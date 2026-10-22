// Roulette Renderer
// Renderizado visual de la rueda de ruleta y mesa de apuestas

class RouletteRenderer {
  // Dibujar rueda de ruleta en canvas
  static drawWheel(ctx, x, y, radius, winningNumber = null, rotation = 0) {
    const centerX = x;
    const centerY = y;

    // Fondo de la rueda
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, Math.PI * 2);
    ctx.fill();

    // Cada número
    const slices = 37; // 0-36
    const sliceAngle = (Math.PI * 2) / slices;

    for (let i = 0; i < slices; i++) {
      const angle = i * sliceAngle + rotation;
      const nextAngle = (i + 1) * sliceAngle + rotation;

      // Determinar color
      let color = '#2c3e50'; // Negro por defecto
      if (i === 0) {
        color = '#2ecc71'; // Verde para 0
      } else if (this.isRedNumber(i)) {
        color = '#e74c3c'; // Rojo
      } else {
        color = '#2c3e50'; // Negro
      }

      // Dibujar slice
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, nextAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      ctx.fill();

      // Borde
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, nextAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      ctx.stroke();

      // Número
      const textAngle = angle + sliceAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (radius - 15);
      const textY = centerY + Math.sin(textAngle) * (radius - 15);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i, textX, textY);
    }

    // Resaltar número ganador
    if (winningNumber !== null) {
      const angle = (winningNumber * sliceAngle) + rotation;
      const nextAngle = ((winningNumber + 1) * sliceAngle) + rotation;

      ctx.strokeStyle = '#ffb81c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, angle, nextAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();
      ctx.stroke();
    }

    // Centro (eje)
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dibujar mesa de apuestas (layout de números)
  static drawBettingLayout(ctx, x, y, cellWidth = 40, cellHeight = 40) {
    const startX = x;
    const startY = y;
    const spacing = 2;

    // 0
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(startX, startY, cellWidth, cellHeight);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, cellWidth, cellHeight);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('0', startX + cellWidth / 2, startY + cellHeight / 2);

    // Números 1-36 en grid 3x12
    let num = 1;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 12; col++) {
        const px = startX + cellWidth + col * (cellWidth + spacing);
        const py = startY + row * (cellHeight + spacing);

        // Color según número
        ctx.fillStyle = this.isRedNumber(num) ? '#e74c3c' : '#2c3e50';
        ctx.fillRect(px, py, cellWidth, cellHeight);

        // Borde
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, cellWidth, cellHeight);

        // Número
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num, px + cellWidth / 2, py + cellHeight / 2);

        num++;
      }
    }
  }

  // Crear HTML para mesa de apuestas
  static createBettingTable(tableId) {
    const html = `
      <div id="roulette_${tableId}" class="roulette-table">
        <div class="roulette-wheel">
          <canvas id="wheel_${tableId}" width="400" height="400"></canvas>
          <div class="winning-number" id="winning_${tableId}"></div>
        </div>

        <div class="betting-area">
          <h3>Apuestas Disponibles</h3>

          <div class="bet-buttons">
            <button class="bet-btn red" data-bet="red">
              🔴 Rojo (1:1)
            </button>
            <button class="bet-btn black" data-bet="black">
              ⚫ Negro (1:1)
            </button>
            <button class="bet-btn green" data-bet="even">
              🟢 Par (1:1)
            </button>
            <button class="bet-btn yellow" data-bet="odd">
              🟡 Impar (1:1)
            </button>
            <button class="bet-btn" data-bet="low">
              1-18 (1:1)
            </button>
            <button class="bet-btn" data-bet="high">
              19-36 (1:1)
            </button>
            <button class="bet-btn" data-bet="dozen1">
              1ª Docena (2:1)
            </button>
            <button class="bet-btn" data-bet="dozen2">
              2ª Docena (2:1)
            </button>
            <button class="bet-btn" data-bet="dozen3">
              3ª Docena (2:1)
            </button>
          </div>

          <div class="number-input">
            <label>Apuesta a Número (0-36):</label>
            <input type="number" id="bet_number_${tableId}" min="0" max="36" value="0" class="input">
            <button class="btn btn-small" id="place_number_${tableId}">Apostar</button>
          </div>

          <div class="spin-controls">
            <button id="spin_${tableId}" class="btn btn-primary">🎡 GIRAR</button>
            <button id="clear_bets_${tableId}" class="btn btn-secondary">Limpiar Apuestas</button>
          </div>
        </div>

        <div class="bets-summary">
          <h4>Apuestas Realizadas</h4>
          <div id="bets_list_${tableId}" class="bets-list">
            <p class="placeholder">Sin apuestas</p>
          </div>
          <div class="total-bet">
            Total: <span id="total_bet_${tableId}">$0</span>
          </div>
        </div>

        <div class="results">
          <h4>Resultados</h4>
          <div id="results_${tableId}" class="results-list">
            <p class="placeholder">Esperando tirada...</p>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  // Verificar si número es rojo
  static isRedNumber(num) {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num);
  }

  // Animar el giro de la rueda
  static animateSpin(canvasId, duration = 4000, winningNumber = null) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const startTime = Date.now();
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Velocidad inicial alta, disminuye (desaceleración)
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing: aceleración al inicio, desaceleración al final (ease-out cubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      // Rotación total: ~10 vueltas
      const totalRotation = (Math.PI * 2 * 10) * easeProgress;

      // Limpiar canvas
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar rueda girada
      this.drawWheel(ctx, centerX, centerY, radius, winningNumber, totalRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Dibujar resultado final
        this.drawWheel(ctx, centerX, centerY, radius, winningNumber, 0);
      }
    };

    animate();
  }

  // Mostrar número ganador
  static showWinningNumber(containerId, number, color) {
    const el = document.getElementById(containerId);
    if (el) {
      el.textContent = `Número ganador: ${number}`;
      el.style.color = color === 'red' ? '#e74c3c' : (color === 'black' ? '#2c3e50' : '#2ecc71');
      el.className = `winning-number show`;
    }
  }

  // Actualizar lista de apuestas
  static updateBetsList(containerId, bets) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (bets.length === 0) {
      container.innerHTML = '<p class="placeholder">Sin apuestas</p>';
      return;
    }

    const betNames = {
      'red': '🔴 Rojo',
      'black': '⚫ Negro',
      'even': '🟢 Par',
      'odd': '🟡 Impar',
      'low': '1-18',
      'high': '19-36',
      'dozen1': '1ª Docena (1-12)',
      'dozen2': '2ª Docena (13-24)',
      'dozen3': '3ª Docena (25-36)',
      'number': 'Número'
    };

    container.innerHTML = bets.map((bet, idx) => `
      <div class="bet-item">
        <span>${betNames[bet.type] || bet.type} ${bet.number !== null ? `(${bet.number})` : ''}</span>
        <span>$${Currency.formatShort(bet.amount)}</span>
      </div>
    `).join('');
  }

  // Mostrar resultados
  static showResults(containerId, results) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const resultItems = Object.values(results).map(r => {
      const sign = r.isWin ? '+' : '-';
      const icon = r.isWin ? '✓' : '✗';
      const color = r.isWin ? 'win' : 'loss';

      return `
        <div class="result-item ${color}">
          <span>${icon} ${r.bet.type === 'number' ? `Número ${r.bet.number}` : r.bet.type}</span>
          <span>${sign}$${Currency.formatShort(Math.abs(r.payout))}</span>
        </div>
      `;
    });

    if (resultItems.length === 0) {
      container.innerHTML = '<p class="placeholder">Sin resultados</p>';
    } else {
      container.innerHTML = resultItems.join('');
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RouletteRenderer;
}
