// Poker Game App
// Texas Hold'em con IA

class PokerGameApp {
  constructor() {
    this.game = null;
    this.players = [];
    this.handsPlayed = 0;
    this.casinoIncome = 0;
    this.gameRunning = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    document.getElementById('createGameBtn').addEventListener('click', () => this.createGame());
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
  }

  createGame() {
    const numPlayers = parseInt(document.getElementById('numPlayersSelect').value);

    this.game = new PokerGame({
      smallBlind: 50,
      bigBlind: 100,
      maxPlayers: numPlayers
    });

    // Crear jugadores
    const names = ['Carlos', 'María', 'Juan', 'Patricia', 'Roberto', 'Francisca'];
    this.players = names.slice(0, numPlayers).map(name => ({
      name: name,
      balance: 50000,
      initialBalance: 50000,
      wins: 0,
      losses: 0
    }));

    // Renderizar mesa
    const container = document.getElementById('pokerContainer');
    container.innerHTML = PokerRenderer.createPokerTable('poker_main');

    // Actualizar jugadores
    this.players.forEach((p, idx) => {
      PokerRenderer.updatePlayer('poker_main', idx, p);
    });

    document.getElementById('startBtn').disabled = false;
    this.updateUI();

    console.log(`✓ Juego de póker creado con ${numPlayers} jugadores`);
  }

  startGame() {
    if (!this.game) return;

    this.gameRunning = true;
    this.playHands();
  }

  playHands() {
    if (!this.gameRunning) return;

    // Simular mano
    this.simulateHand();

    // Siguiente mano después de delay
    setTimeout(() => this.playHands(), 2000);
  }

  simulateHand() {
    // Iniciar mano
    const positions = Array.from({length: this.players.length}, (_, i) => i);
    this.game.startHand(this.players, positions);

    if (!this.game.gameState) return;

    const state = this.game.gameState;

    // Actualizar cartas comunitarias (simular rondas)
    const rounds = ['preflop', 'flop', 'turn', 'river'];

    for (const round of rounds) {
      if (round === 'flop') {
        this.game.flop();
        PokerRenderer.updateCommunity('poker_main', state.community);
      } else if (round === 'turn') {
        this.game.turn();
        PokerRenderer.updateCommunity('poker_main', state.community);
      } else if (round === 'river') {
        this.game.river();
        PokerRenderer.updateCommunity('poker_main', state.community);
      }
    }

    // Determinar ganador (simplificado)
    let maxStrength = -1;
    let winnerIdx = 0;

    for (let i = 0; i < state.players.length; i++) {
      const player = state.players[i];
      if (!player.folded) {
        const strength = this.game.getHandStrength(player.hole, state.community);
        if (strength > maxStrength) {
          maxStrength = strength;
          winnerIdx = i;
        }
      }
    }

    // Asignar payout
    const pot = 500 * this.players.length;
    const winner = this.players[winnerIdx];
    winner.balance += pot;
    winner.wins++;
    this.casinoIncome += pot * 0.05; // 5% rake

    // Actualizar visualización
    this.players.forEach((p, idx) => {
      PokerRenderer.updatePlayer('poker_main', idx, p, idx === winnerIdx);
      if (idx === winnerIdx) {
        PokerRenderer.showPlayerAction('poker_main', idx, '✓ Ganó');
      }
    });

    PokerRenderer.updatePot('poker_main', pot);
    this.handsPlayed++;
    this.updateUI();

    console.log(`Mano ${this.handsPlayed}: ${winner.name} ganó $${Currency.formatShort(pot)}`);
  }

  updateUI() {
    document.getElementById('casinoBalance').textContent = Currency.format(this.casinoIncome);
    document.getElementById('handsPlayed').textContent = this.handsPlayed;
    document.getElementById('handsPerMin').textContent =
      this.handsPlayed > 0 ? Math.floor(this.handsPlayed * 60 / 2000) : 0;

    // Ranking
    const ranking = [...this.players]
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 6);

    const html = ranking.map((p, idx) => {
      const profit = p.balance - p.initialBalance;
      return `
        <div class="client-item">
          <div style="display: flex; justify-content: space-between; width: 100%;">
            <span class="client-name">#${idx + 1} ${p.name}</span>
            <span class="client-balance" style="color: ${profit >= 0 ? '#2ecc71' : '#e74c3c'}">
              ${Currency.format(p.balance)}
            </span>
          </div>
        </div>
      `;
    }).join('');

    const rankingEl = document.getElementById('playersRanking');
    if (rankingEl) {
      rankingEl.innerHTML = html;
    }

    document.getElementById('casinoIncome').textContent = Currency.format(this.casinoIncome);
    document.getElementById('avgPot').textContent =
      Currency.format(this.handsPlayed > 0 ? this.casinoIncome / (this.handsPlayed * 0.05) : 0);
  }

  reset() {
    if (confirm('¿Reiniciar póker?')) {
      this.gameRunning = false;
      this.game = null;
      this.players = [];
      this.handsPlayed = 0;
      this.casinoIncome = 0;
      document.getElementById('pokerContainer').innerHTML = '';
      document.getElementById('startBtn').disabled = true;
      this.updateUI();
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.pokerGame = new PokerGameApp();
});
