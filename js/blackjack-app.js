// Blackjack Game App
// Simulador de Blackjack con múltiples jugadores IA

class BlackjackGameApp {
  constructor() {
    this.casino = new Casino({ name: 'Casino Blackjack' });
    this.tables = [];
    this.gameRunning = false;
    this.animationFrameId = null;
    this.handsPlayed = 0;
    this.totalIncome = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    document.getElementById('createTableBtn').addEventListener('click', () => this.createBlackjackTable());
    document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('speedSelect').addEventListener('change', (e) => {
      this.speed = parseFloat(e.target.value);
    });
  }

  createBlackjackTable() {
    const numPlayers = parseInt(document.getElementById('numPlayersSelect').value) || 4;

    // Crear mesa en casino
    const table = this.casino.createTable('blackjack', {
      minBet: 1000,
      maxBet: 100000
    });

    // Crear juego de blackjack
    const game = new BlackjackGame({
      minBet: table.minBet,
      maxBet: table.maxBet,
      numDecks: 6
    });

    // Crear clientes para esta mesa
    if (this.casino.clients.length === 0) {
      this.casino.generateRandomClients(numPlayers);
    } else if (this.casino.clients.length < numPlayers) {
      this.casino.generateRandomClients(numPlayers - this.casino.clients.length);
    }

    // Asignar jugadores a la mesa
    for (let i = 0; i < Math.min(numPlayers, this.casino.clients.length); i++) {
      this.casino.assignClientToTable(this.casino.clients[i].id, table.id);
    }

    // Guardar en lista local
    this.tables.push({
      tableId: table.id,
      game: game,
      players: table.players.map(id => this.casino.clients.find(c => c.id === id)),
      currentHandIndex: 0,
      state: 'waiting' // waiting, betting, playing, settling
    });

    // Renderizar HTML de la mesa
    const container = document.getElementById('tablesContainer');
    const tableHtml = TableRenderer.createBlackjackTable(table.id, {
      minBet: table.minBet,
      maxBet: table.maxBet
    });
    container.innerHTML += tableHtml;

    document.getElementById('startGameBtn').disabled = false;
    this.updateUI();

    console.log(`✓ Mesa creada: ${table.id} con ${this.tables[this.tables.length - 1].players.length} jugadores`);
  }

  startGame() {
    if (this.tables.length === 0) {
      alert('Crea una mesa primero');
      return;
    }

    this.gameRunning = true;
    this.gameLoop();
  }

  gameLoop() {
    if (!this.gameRunning) return;

    // Procesar cada mesa
    for (const tableData of this.tables) {
      this.processTable(tableData);
    }

    this.updateUI();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }

  processTable(tableData) {
    const { tableId, game, players } = tableData;

    if (tableData.state === 'waiting') {
      // Iniciar nueva mano
      this.startNewHand(tableData);
    } else if (tableData.state === 'playing') {
      // Procesar decisiones IA
      this.processPlayerDecisions(tableData);
    } else if (tableData.state === 'settling') {
      // Resolver mano y asignar ganancias
      this.settleHand(tableData);
    }
  }

  startNewHand(tableData) {
    const { game, players } = tableData;

    // Cada jugador hace apuesta
    for (const player of players) {
      const bet = player.decideBet(game.minBet, game.maxBet);
      if (bet > 0) {
        player.currentBalance -= bet;
        this.totalIncome += bet;

        // Iniciar mano del juego
        const state = game.startHand(bet);

        if (state.result) {
          // Mano ya terminó (blackjack del dealer, etc)
          this.applyResult(player, state.result, state.payout);
          this.renderTableState(tableData);
          this.handsPlayed++;
        }
      }
    }

    tableData.state = 'playing';
    this.renderTableState(tableData);
  }

  processPlayerDecisions(tableData) {
    const { game, players } = tableData;

    if (!game.gameState || game.gameState.result) {
      tableData.state = 'settling';
      return;
    }

    // Jugador decide hit/stand
    const player = players[0]; // Simplificado: solo primer jugador
    const playerValue = game.calculateHandValue(game.gameState.playerHand);
    const dealerUpCard = game.gameState.dealerHand[0].rank;

    if (player.decideHitBlackjack(game.gameState.playerHand, dealerUpCard)) {
      game.playerHit();
    } else {
      game.playerStand();
    }

    this.renderTableState(tableData);
  }

  settleHand(tableData) {
    const { game, players } = tableData;

    if (!game.gameState) {
      tableData.state = 'waiting';
      return;
    }

    // Aplicar resultados a jugadores
    const player = players[0]; // Simplificado
    if (game.gameState.result) {
      this.applyResult(player, game.gameState.result, game.gameState.payout);
      this.handsPlayed++;

      // Emitir evento
      this.addEvent(`${player.name}: ${game.gameState.result}`);

      // Esperar un poco antes de siguiente mano
      setTimeout(() => {
        game.gameState = null;
        tableData.state = 'waiting';
      }, 2000);
    }
  }

  applyResult(player, result, payout) {
    if (payout > 0) {
      player.applyResult(payout);
      this.addEvent(`✓ ${player.name} ganó $${Currency.formatShort(payout)}`, 'income');
    } else if (payout < 0) {
      player.applyResult(payout);
      this.addEvent(`✗ ${player.name} perdió $${Currency.formatShort(Math.abs(payout))}`, 'expense');
    }
  }

  renderTableState(tableData) {
    const { tableId, game, players } = tableData;

    if (!game.gameState) return;

    // Actualizar dealer
    const dealerValue = game.calculateHandValue(game.gameState.dealerHand);
    TableRenderer.updateDealerHand(tableId, game.gameState.dealerHand, dealerValue, true);

    // Actualizar jugadores
    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const playerValue = game.calculateHandValue(game.gameState.playerHand);
      const isSoft = game.isSoftHand(game.gameState.playerHand);

      TableRenderer.updatePlayerInfo(tableId, i, player.name, player.currentBalance, game.gameState.bet);
      TableRenderer.updatePlayerHand(tableId, i, game.gameState.playerHand, playerValue, isSoft);

      // Mostrar resultado si hay
      if (game.gameState.result) {
        TableRenderer.showResult(tableId, i, game.gameState.result, game.gameState.payout);
      }
    }
  }

  updateUI() {
    document.getElementById('casinoBalance').textContent = Currency.format(this.totalIncome);
    document.getElementById('activeTables').textContent = this.tables.length;
    document.getElementById('handsPlayed').textContent = this.handsPlayed;
    document.getElementById('moneyInPlay').textContent = Currency.format(
      this.tables.reduce((sum, t) => sum + (t.game.gameState?.bet || 0), 0)
    );
    document.getElementById('houseEarnings').textContent = Currency.format(this.totalIncome);

    // House edge
    if (this.handsPlayed > 0) {
      const houseEdge = ((this.totalIncome / (this.handsPlayed * 5000)) * 100).toFixed(2);
      document.getElementById('houseEdge').textContent = `${houseEdge}%`;
    }

    // Top player
    if (this.tables.length > 0 && this.tables[0].players.length > 0) {
      const topPlayer = this.tables[0].players[0];
      const profit = topPlayer.currentBalance - topPlayer.initialBalance;
      const className = profit >= 0 ? 'win' : 'loss';

      document.getElementById('topPlayer').innerHTML = `
        <div class="client-item">
          <span class="client-name">${topPlayer.name}</span>
          <span class="client-balance" style="color: ${profit >= 0 ? '#2ecc71' : '#e74c3c'}">
            ${Currency.format(topPlayer.currentBalance)}
          </span>
        </div>
      `;
    }
  }

  addEvent(message, type = 'info') {
    const eventLog = document.getElementById('eventLog');
    const eventEl = document.createElement('div');
    eventEl.className = `event-item ${type}`;
    eventEl.textContent = message;

    eventLog.insertBefore(eventEl, eventLog.firstChild);

    // Mantener solo últimos 15 eventos
    while (eventLog.children.length > 15) {
      eventLog.removeChild(eventLog.lastChild);
    }

    // Remover placeholder
    const placeholder = eventLog.querySelector('.placeholder');
    if (placeholder) placeholder.remove();
  }

  reset() {
    if (confirm('¿Reiniciar el juego?')) {
      this.gameRunning = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      this.tables = [];
      this.handsPlayed = 0;
      this.totalIncome = 0;
      document.getElementById('tablesContainer').innerHTML = '';
      document.getElementById('startGameBtn').disabled = true;
      this.updateUI();
    }
  }
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.blackjackGame = new BlackjackGameApp();
});
