// Casino Simulator - App Principal
// Orquestador de la simulación

class CasinoSimulator {
  constructor() {
    this.casino = new Casino({ name: 'Casino de Juego de Santiago' });
    this.isRunning = false;
    this.animationFrameId = null;
    this.lastFrameTime = Date.now();

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadOrCreateCasino();
    this.render();
  }

  setupEventListeners() {
    // Controles
    document.getElementById('startBtn').addEventListener('click', () => this.start());
    document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('speedSelect').addEventListener('change', (e) => {
      this.casino.speed = parseFloat(e.target.value);
    });
    document.getElementById('addClientsBtn').addEventListener('click', () => this.addMoreClients());

    // Eventos del casino
    this.casino.on('transaction', (tx) => this.onTransaction(tx));
    this.casino.on('client-left', (data) => this.onClientLeft(data));
  }

  loadOrCreateCasino() {
    // Intentar cargar estado guardado
    if (!this.casino.load()) {
      // Si no hay estado guardado, crear nuevo
      this.casino.generateRandomClients(10);
      this.casino.createTable('blackjack');
      this.casino.createTable('roulette');
    }

    this.updateUI();
  }

  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.casino.running = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;

    this.gameLoop();
  }

  pause() {
    this.isRunning = false;
    this.casino.running = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  reset() {
    if (confirm('¿Estás seguro de que deseas reiniciar el casino?')) {
      this.pause();
      this.casino.reset();
      this.casino.generateRandomClients(10);
      this.casino.createTable('blackjack');
      this.casino.createTable('roulette');
      this.updateUI();
      this.renderTables();
    }
  }

  addMoreClients() {
    const count = parseInt(document.getElementById('clientCount').value) || 5;
    this.casino.generateRandomClients(count);
    this.renderTables();
  }

  gameLoop() {
    const now = Date.now();
    const deltaTime = (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Actualizar
    this.casino.update();

    // Renderizar
    this.render();

    // Siguiente frame
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  render() {
    this.updateStats();
    this.updateTimestamp();
    this.renderTables();
  }

  renderTables() {
    const container = document.getElementById('tablesContainer');

    if (this.casino.tables.length === 0) {
      container.innerHTML = '<p style="color: white; grid-column: 1/-1;">Sin mesas creadas. Crea una para comenzar.</p>';
      return;
    }

    container.innerHTML = this.casino.tables.map(table => `
      <div class="table-box">
        <div class="table-title">
          ${this.getGameIcon(table.type)} ${this.getGameName(table.type)}
        </div>
        <div class="table-info">
          <strong>ID:</strong> ${table.id}
        </div>
        <div class="table-info">
          <strong>Jugadores:</strong> ${table.players.length}/6
        </div>
        <div class="table-info">
          <strong>Apuestas:</strong> $${Currency.formatShort(table.minBet)} - $${Currency.formatShort(table.maxBet)}
        </div>
        <div class="table-info">
          <strong>Estado:</strong> ${this.getStateEmoji(table.state)} ${table.state}
        </div>

        <div class="table-players">
          ${table.players.map(clientId => {
            const client = this.casino.clients.find(c => c.id === clientId);
            if (!client) return '';
            return `
              <div class="player-item">
                <span class="player-name">${client.name}</span>
                <span class="player-balance">${Currency.formatShort(client.currentBalance)}</span>
              </div>
            `;
          }).join('')}
          ${table.players.length === 0 ? '<p style="opacity: 0.6; margin-top: 10px;">Sin jugadores</p>' : ''}
        </div>
      </div>
    `).join('');
  }

  getGameIcon(type) {
    const icons = {
      'blackjack': '♠️',
      'roulette': '🎡',
      'poker': '🃏'
    };
    return icons[type] || '🎰';
  }

  getGameName(type) {
    const names = {
      'blackjack': 'Blackjack',
      'roulette': 'Ruleta',
      'poker': 'Póker'
    };
    return names[type] || type;
  }

  getStateEmoji(state) {
    const emojis = {
      'idle': '⏸',
      'betting': '🤑',
      'playing': '🎲',
      'settled': '✓'
    };
    return emojis[state] || '•';
  }

  updateStats() {
    document.getElementById('casinoBalance').textContent = this.casino.getFormattedBalance();
    document.getElementById('activeClients').textContent = this.casino.clients.filter(
      c => c.currentTable !== null
    ).length;
    document.getElementById('handsPlayed').textContent = this.casino.stats.totalHandsPlayed;
    document.getElementById('totalIncome').textContent = Currency.format(this.casino.stats.totalIncome);
    document.getElementById('totalExpense').textContent = Currency.format(this.casino.stats.totalExpense);
  }

  updateTimestamp() {
    const uptime = (Date.now() - this.casino.stats.startTime) / 1000;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    document.getElementById('timestamp').textContent =
      `Tiempo: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  updateUI() {
    this.updateStats();
    this.renderTables();
  }

  onTransaction(transaction) {
    const eventLog = document.getElementById('eventLog');
    const eventItem = document.createElement('div');
    eventItem.className = `event-item ${transaction.amount > 0 ? 'income' : 'expense'}`;

    const sign = transaction.amount > 0 ? '+' : '-';
    const icon = transaction.amount > 0 ? '📈' : '📉';

    eventItem.textContent = `${icon} ${sign}${Currency.format(Math.abs(transaction.amount))} - ${transaction.description || transaction.type}`;

    eventLog.insertBefore(eventItem, eventLog.firstChild);

    // Mantener solo últimos 20 eventos
    while (eventLog.children.length > 20) {
      eventLog.removeChild(eventLog.lastChild);
    }

    // Remover placeholder si existe
    const placeholder = eventLog.querySelector('.placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  }

  onClientLeft(data) {
    console.log(`Cliente ${data.clientId} se fue - Razón: ${data.reason}`);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.simulator = new CasinoSimulator();
});
