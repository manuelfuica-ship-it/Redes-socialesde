// Dashboard Renderer
// Componentes visuales del dashboard

class DashboardRenderer {
  // Crear estructura principal del dashboard
  static createDashboard() {
    const html = `
      <div class="dashboard-main">
        <!-- KPI Cards -->
        <section class="kpi-cards">
          <div class="kpi-card">
            <div class="kpi-label">Balance Casino</div>
            <div class="kpi-value" id="kpiBalance">$0</div>
            <div class="kpi-trend" id="kpiBalanceTrend">▼ $0</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Ingresos Hoy</div>
            <div class="kpi-value" id="kpiIncome">$0</div>
            <div class="kpi-trend positive" id="kpiIncomeTrend">▲ $0</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Jugadores Activos</div>
            <div class="kpi-value" id="kpiActivePlayers">0</div>
            <div class="kpi-trend">En 4 mesas</div>
          </div>

          <div class="kpi-card">
            <div class="kpi-label">Tasa Ganancia</div>
            <div class="kpi-value" id="kpiWinRate">0%</div>
            <div class="kpi-trend">House Edge</div>
          </div>
        </section>

        <!-- Charts Section -->
        <section class="charts-section">
          <div class="chart-container">
            <h3>📈 Ingresos por Juego (Últimas 24h)</h3>
            <canvas id="incomeChart" width="400" height="200"></canvas>
          </div>

          <div class="chart-container">
            <h3>🎯 Distribución de Apuestas</h3>
            <canvas id="betsChart" width="400" height="200"></canvas>
          </div>
        </section>

        <!-- Tables Section -->
        <section class="tables-section">
          <div class="table-info">
            <h3>🎰 Estado de Mesas</h3>
            <div id="tablesStatus" class="tables-grid">
              <p class="placeholder">Sin mesas activas</p>
            </div>
          </div>

          <div class="players-ranking">
            <h3>🏆 Top Jugadores</h3>
            <div id="playersRanking" class="ranking-list">
              <p class="placeholder">Sin datos</p>
            </div>
          </div>
        </section>

        <!-- History Section -->
        <section class="history-section">
          <h3>📝 Historial de Transacciones</h3>
          <div id="transactionHistory" class="transaction-list">
            <p class="placeholder">Sin transacciones</p>
          </div>
        </section>

        <!-- Controls -->
        <section class="casino-controls">
          <h3>⚙️ Controles del Casino</h3>
          <div class="controls-grid">
            <div class="control-group">
              <label>Velocidad Simulación:</label>
              <select id="simulationSpeed" class="select">
                <option value="0.5">0.5x (Lento)</option>
                <option value="1" selected>1x (Normal)</option>
                <option value="2">2x (Rápido)</option>
                <option value="4">4x (Muy rápido)</option>
              </select>
            </div>

            <div class="control-group">
              <label>House Edge Target:</label>
              <input type="number" id="houseEdgeTarget" class="input" min="0" max="10" value="2.7" step="0.1">
              <span class="help-text">% esperado para European Roulette</span>
            </div>

            <button id="pauseBtn" class="btn btn-secondary">⏸ Pausar</button>
            <button id="resumeBtn" class="btn btn-secondary">▶ Reanudar</button>
            <button id="exportBtn" class="btn btn-secondary">💾 Exportar Datos</button>
            <button id="resetBtn" class="btn btn-danger">↻ Reset Total</button>
          </div>
        </section>
      </div>
    `;

    return html;
  }

  // Actualizar tarjetas KPI
  static updateKPIs(casinoBalance, todayIncome, activePlayers, winRate) {
    document.getElementById('kpiBalance').textContent = Currency.format(casinoBalance);
    document.getElementById('kpiIncome').textContent = Currency.format(todayIncome);
    document.getElementById('kpiActivePlayers').textContent = activePlayers;
    document.getElementById('kpiWinRate').textContent = winRate.toFixed(2) + '%';

    // Actualizar tendencia
    const balanceTrend = document.getElementById('kpiBalanceTrend');
    const incomeTrend = document.getElementById('kpiIncomeTrend');

    if (casinoBalance > 0) {
      balanceTrend.textContent = '▲ Ganancia';
      balanceTrend.className = 'kpi-trend positive';
    } else {
      balanceTrend.textContent = '▼ Pérdida';
      balanceTrend.className = 'kpi-trend negative';
    }
  }

  // Crear gráfico de ingresos
  static drawIncomeChart(ctx, gameData) {
    const labels = Object.keys(gameData).slice(-12);
    const data = Object.values(gameData).slice(-12);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (data.length === 0) return;

    const maxValue = Math.max(...data, 1);
    const barWidth = ctx.canvas.width / labels.length;
    const padding = 40;
    const graphHeight = ctx.canvas.height - padding * 2;

    // Y-axis
    ctx.strokeStyle = '#ccc';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, ctx.canvas.height - padding);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, ctx.canvas.height - padding);
    ctx.lineTo(ctx.canvas.width - padding, ctx.canvas.height - padding);
    ctx.stroke();

    // Barras
    ctx.fillStyle = '#2ecc71';
    data.forEach((value, idx) => {
      const barHeight = (value / maxValue) * graphHeight;
      const x = padding + idx * barWidth;
      const y = ctx.canvas.height - padding - barHeight;
      ctx.fillRect(x + 5, y, barWidth - 10, barHeight);
    });

    // Labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    labels.forEach((label, idx) => {
      const x = padding + idx * barWidth + barWidth / 2;
      ctx.fillText(label, x, ctx.canvas.height - padding + 20);
    });

    // Title y eje Y
    ctx.fillStyle = '#333';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('$' + Currency.formatShort(maxValue), 10, padding);
  }

  // Mostrar estado de mesas
  static updateTablesStatus(tables) {
    const container = document.getElementById('tablesStatus');

    if (tables.length === 0) {
      container.innerHTML = '<p class="placeholder">Sin mesas activas</p>';
      return;
    }

    const html = tables.map(table => `
      <div class="table-card ${table.state}">
        <div class="table-name">${this.getGameIcon(table.type)} ${this.getGameName(table.type)}</div>
        <div class="table-stat">
          <span class="label">Jugadores:</span>
          <span class="value">${table.players.length}/6</span>
        </div>
        <div class="table-stat">
          <span class="label">Estado:</span>
          <span class="value">${table.state}</span>
        </div>
        <div class="table-stat">
          <span class="label">Dinero:</span>
          <span class="value">${Currency.formatShort(table.totalBets || 0)}</span>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  // Ranking de jugadores
  static updatePlayersRanking(players) {
    const container = document.getElementById('playersRanking');

    if (players.length === 0) {
      container.innerHTML = '<p class="placeholder">Sin datos</p>';
      return;
    }

    const sorted = players
      .map((p, idx) => ({...p, rank: idx + 1}))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10);

    const html = sorted.map((player, idx) => {
      const balance = player.balance;
      const initialBalance = player.initialBalance || 50000;
      const profit = balance - initialBalance;
      const profitPercent = ((profit / initialBalance) * 100).toFixed(1);

      return `
        <div class="ranking-item">
          <div class="rank">#${idx + 1}</div>
          <div class="player-info">
            <div class="name">${player.name}</div>
            <div class="stats">
              ${profit >= 0 ? '✓' : '✗'} ${Currency.format(balance)}
            </div>
          </div>
          <div class="profit ${profit >= 0 ? 'positive' : 'negative'}">
            ${profit >= 0 ? '+' : ''}${profitPercent}%
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  }

  // Historial de transacciones
  static updateTransactionHistory(transactions) {
    const container = document.getElementById('transactionHistory');

    if (transactions.length === 0) {
      container.innerHTML = '<p class="placeholder">Sin transacciones</p>';
      return;
    }

    const html = transactions.slice(-20).map(tx => `
      <div class="transaction-item ${tx.type}">
        <div class="time">${new Date(tx.timestamp).toLocaleTimeString()}</div>
        <div class="description">${tx.description || tx.type}</div>
        <div class="amount ${tx.amount > 0 ? 'positive' : 'negative'}">
          ${tx.amount > 0 ? '+' : ''}${Currency.format(tx.amount)}
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  }

  // Utilidades
  static getGameIcon(type) {
    const icons = {
      'blackjack': '♠️',
      'roulette': '🎡',
      'poker': '🃏'
    };
    return icons[type] || '🎰';
  }

  static getGameName(type) {
    const names = {
      'blackjack': 'Blackjack',
      'roulette': 'Ruleta',
      'poker': 'Póker'
    };
    return names[type] || type;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardRenderer;
}
