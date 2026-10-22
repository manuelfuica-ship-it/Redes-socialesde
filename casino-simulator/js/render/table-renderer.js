// Table Renderer
// Renderizado de mesas de juego en HTML/Canvas

class TableRenderer {
  // Crear elemento visual de mesa Blackjack
  static createBlackjackTable(tableId, options = {}) {
    const minBet = options.minBet || 1000;
    const maxBet = options.maxBet || 100000;

    const html = `
      <div id="table_${tableId}" class="blackjack-table">
        <div class="table-felt">
          <!-- Dealer Area -->
          <div class="dealer-area">
            <h3>Dealer</h3>
            <div id="dealer-hand-${tableId}" class="hand dealer-hand"></div>
            <div id="dealer-value-${tableId}" class="hand-value"></div>
          </div>

          <!-- Player Areas (hasta 6 jugadores) -->
          <div class="players-area">
            ${Array.from({length: 6}, (_, i) => `
              <div id="player-${i}-${tableId}" class="player-position">
                <div id="player-${i}-name-${tableId}" class="player-name"></div>
                <div id="player-${i}-hand-${tableId}" class="hand player-hand"></div>
                <div id="player-${i}-value-${tableId}" class="hand-value"></div>
                <div id="player-${i}-bet-${tableId}" class="player-bet"></div>
              </div>
            `).join('')}
          </div>

          <!-- Table Info -->
          <div class="table-info">
            <span class="bet-limits">Apuestas: $${Currency.formatShort(minBet)} - $${Currency.formatShort(maxBet)}</span>
            <span id="table-message-${tableId}" class="table-message"></span>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  // Actualizar visualización de mano en mesa
  static updatePlayerHand(tableId, playerIndex, hand, value, isSoft = false) {
    const handContainer = document.getElementById(`player-${playerIndex}-hand-${tableId}`);
    const valueContainer = document.getElementById(`player-${playerIndex}-value-${tableId}`);

    if (handContainer) {
      CardsRenderer.renderHand(hand, `player-${playerIndex}-hand-${tableId}`);
    }

    if (valueContainer && value !== null) {
      const softStr = isSoft ? ' (soft)' : '';
      valueContainer.textContent = `${value}${softStr}`;
    }
  }

  // Actualizar mano del dealer
  static updateDealerHand(tableId, hand, value, hideFirstCard = false) {
    const handContainer = document.getElementById(`dealer-hand-${tableId}`);
    const valueContainer = document.getElementById(`dealer-value-${tableId}`);

    if (handContainer) {
      const displayHand = hideFirstCard && hand.length > 0 ? [hand[0]] : hand;
      CardsRenderer.renderHand(displayHand, `dealer-hand-${tableId}`);
    }

    if (valueContainer && value !== null && !hideFirstCard) {
      valueContainer.textContent = `${value}`;
    }
  }

  // Actualizar nombre y balance del jugador
  static updatePlayerInfo(tableId, playerIndex, name, balance, bet = null) {
    const nameEl = document.getElementById(`player-${playerIndex}-name-${tableId}`);
    const betEl = document.getElementById(`player-${playerIndex}-bet-${tableId}`);

    if (nameEl) {
      nameEl.textContent = name;
      nameEl.title = `Balance: ${Currency.format(balance)}`;
    }

    if (betEl && bet !== null) {
      betEl.textContent = `Apuesta: ${Currency.format(bet)}`;
    }
  }

  // Mostrar mensaje en la mesa
  static setTableMessage(tableId, message, type = 'info') {
    const msgEl = document.getElementById(`table-message-${tableId}`);
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.className = `table-message ${type}`;
    }
  }

  // Renderizar resultado
  static showResult(tableId, playerIndex, result, payout) {
    const betEl = document.getElementById(`player-${playerIndex}-bet-${tableId}`);
    if (betEl) {
      let message = '';
      let className = '';

      if (result === 'player-win') {
        message = `✓ Ganó $${Currency.formatShort(Math.abs(payout))}`;
        className = 'win';
      } else if (result === 'dealer-win') {
        message = `✗ Perdió $${Currency.formatShort(Math.abs(payout))}`;
        className = 'loss';
      } else if (result === 'push') {
        message = '= Empate';
        className = 'push';
      } else if (result === 'player-blackjack') {
        message = `★ ¡Blackjack! +$${Currency.formatShort(payout)}`;
        className = 'blackjack';
      } else if (result === 'player-bust') {
        message = '✗ Bust!';
        className = 'bust';
      }

      betEl.textContent = message;
      betEl.className = `player-bet ${className}`;
    }
  }

  // Canvas para vista alternativa (futuro)
  static drawTableCanvas(ctx, width, height, tableData) {
    // Fondo verde
    ctx.fillStyle = '#1a472a';
    ctx.fillRect(0, 0, width, height);

    // Bordes
    ctx.strokeStyle = '#ffb81c';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Zona del dealer
    const dealerY = 30;
    ctx.fillStyle = 'rgba(255, 184, 28, 0.1)';
    ctx.fillRect(width / 2 - 100, dealerY, 200, 100);

    ctx.fillStyle = '#ffb81c';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DEALER', width / 2, dealerY + 20);

    // Cartas del dealer
    if (tableData && tableData.dealerHand) {
      CardsRenderer.drawHand(ctx, tableData.dealerHand, width / 2 - 70, dealerY + 30, 50, 75, 15);
    }
  }

  // Limpiar mesa
  static clearTable(tableId) {
    const table = document.getElementById(`table_${tableId}`);
    if (table) {
      // Limpiar manos
      for (let i = 0; i < 6; i++) {
        const handEl = document.getElementById(`player-${i}-hand-${tableId}`);
        const valueEl = document.getElementById(`player-${i}-value-${tableId}`);
        const betEl = document.getElementById(`player-${i}-bet-${tableId}`);

        if (handEl) handEl.innerHTML = '';
        if (valueEl) valueEl.textContent = '';
        if (betEl) betEl.textContent = '';
      }

      const dealerHandEl = document.getElementById(`dealer-hand-${tableId}`);
      const dealerValueEl = document.getElementById(`dealer-value-${tableId}`);

      if (dealerHandEl) dealerHandEl.innerHTML = '';
      if (dealerValueEl) dealerValueEl.textContent = '';
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TableRenderer;
}
