// Roulette Game App
// Simulador de Ruleta Europea con múltiples jugadores

class RouletteGameApp {
  constructor() {
    this.rouletteGames = [];
    this.spinHistory = [];
    this.numberHistory = {};
    this.totalWagered = 0;
    this.houseIncome = 0;
    this.autoPlayInterval = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    document.getElementById('newGameBtn').addEventListener('click', () => this.createNewGame());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
  }

  createNewGame() {
    const numPlayers = parseInt(document.getElementById('numPlayersSelect').value) || 1;

    // Crear instancia de ruleta
    const game = new RouletteGame({
      minBet: 100,
      maxBet: 100000
    });

    // Crear jugadores
    const players = [];
    const names = ['Carlos', 'María', 'Juan', 'Patricia'];

    for (let i = 0; i < numPlayers && i < names.length; i++) {
      players.push({
        name: names[i],
        balance: 50000,
        bets: [],
        wins: 0,
        losses: 0
      });
    }

    const gameData = {
      id: `roulette_${Date.now()}`,
      game: game,
      players: players,
      spinCount: 0
    };

    this.rouletteGames.push(gameData);

    // Renderizar mesa
    const container = document.getElementById('rouletteContainer');
    const html = RouletteRenderer.createBettingTable(gameData.id);
    container.innerHTML += html;

    this.setupGameHandlers(gameData);
    this.updateUI();

    console.log(`✓ Juego de ruleta creado: ${gameData.id} con ${numPlayers} jugadores`);
  }

  setupGameHandlers(gameData) {
    const { id, players } = gameData;

    // Botones de apuesta
    document.querySelectorAll(`#roulette_${id} .bet-btn`).forEach(btn => {
      btn.addEventListener('click', (e) => {
        const betType = e.target.dataset.bet;
        const amount = 5000; // Apuesta fija por ahora
        this.placeBet(gameData, players[0], betType, amount, null);
      });
    });

    // Apuesta a número
    document.getElementById(`place_number_${id}`).addEventListener('click', () => {
      const numberInput = document.getElementById(`bet_number_${id}`);
      const betNumber = parseInt(numberInput.value);
      const amount = 1000;
      this.placeBet(gameData, players[0], 'number', amount, betNumber);
    });

    // Girar
    document.getElementById(`spin_${id}`).addEventListener('click', () => {
      this.performSpin(gameData);
    });

    // Limpiar apuestas
    document.getElementById(`clear_bets_${id}`).addEventListener('click', () => {
      gameData.game.gameState = null;
      players[0].bets = [];
      this.updateBetsList(gameData);
    });
  }

  placeBet(gameData, player, betType, amount, betNumber) {
    if (!gameData.game.gameState) {
      gameData.game.startSpin();
    }

    const result = gameData.game.placeBet(amount, betType, betNumber);

    if (result.error) {
      alert(`Error: ${result.error}`);
      return;
    }

    player.bets.push({
      type: betType,
      amount: amount,
      number: betNumber
    });

    this.totalWagered += amount;
    this.updateBetsList(gameData);
  }

  performSpin(gameData) {
    const { id, game, players, spinCount } = gameData;

    // Validar que hay apuestas
    if (!game.gameState || game.gameState.bets.length === 0) {
      alert('Coloca apuestas primero');
      return;
    }

    // Resolver tirada
    const results = game.resolveSpin();
    gameData.spinCount++;

    // Procesar resultados para cada jugador
    const winningNumber = game.gameState.winningNumber;
    const color = game.getColor(winningNumber);

    // Guardar en historial
    this.spinHistory.push(winningNumber);
    this.numberHistory[winningNumber] = (this.numberHistory[winningNumber] || 0) + 1;

    // Aplicar payouts
    let totalPayout = 0;
    for (const player of players) {
      for (const bet of player.bets) {
        const result = results[Object.keys(results).find(key =>
          results[key].bet.amount === bet.amount && results[key].bet.type === bet.type
        )];

        if (result) {
          player.balance += result.payout;
          totalPayout += result.payout;

          if (result.isWin) {
            player.wins++;
            this.addEvent(`✓ ${player.name} ganó $${Currency.formatShort(result.payout)}`, 'income');
          } else {
            player.losses++;
            this.addEvent(`✗ ${player.name} perdió $${Currency.formatShort(Math.abs(result.payout))}`, 'expense');
          }
        }
      }
    }

    this.houseIncome -= totalPayout; // Negativo = ganancia del casino

    // Renderizar resultados
    this.renderSpinResults(gameData, winningNumber, color, results);

    // Limpiar para siguiente tirada
    setTimeout(() => {
      players[0].bets = [];
      game.gameState = null;
      this.updateBetsList(gameData);
    }, 3000);

    this.updateUI();
  }

  renderSpinResults(gameData, winningNumber, color, results) {
    const { id, game } = gameData;

    // Mostrar número ganador
    RouletteRenderer.showWinningNumber(`winning_${id}`, winningNumber, color);

    // Animar rueda
    RouletteRenderer.animateSpin(`wheel_${id}`, 3000, winningNumber);

    // Mostrar resultados
    RouletteRenderer.showResults(`results_${id}`, results);
  }

  updateBetsList(gameData) {
    const { id, game, players } = gameData;

    if (!game.gameState) return;

    RouletteRenderer.updateBetsList(`bets_list_${id}`, game.gameState.bets);

    // Actualizar total
    const total = game.gameState.bets.reduce((sum, b) => sum + b.amount, 0);
    document.getElementById(`total_bet_${id}`).textContent = `$${Currency.formatShort(total)}`;
  }

  addEvent(message, type = 'info') {
    const recentSpins = document.getElementById('recentSpins');
    if (!recentSpins) return;

    const eventEl = document.createElement('div');
    eventEl.className = `event-item ${type}`;
    eventEl.textContent = message;

    recentSpins.insertBefore(eventEl, recentSpins.firstChild);

    // Mantener solo últimos 10
    while (recentSpins.children.length > 10) {
      recentSpins.removeChild(recentSpins.lastChild);
    }

    // Remover placeholder
    const placeholder = recentSpins.querySelector('.placeholder');
    if (placeholder) placeholder.remove();
  }

  updateUI() {
    document.getElementById('casinoBalance').textContent = Currency.format(this.houseIncome);
    document.getElementById('spinCount').textContent = this.spinHistory.length;
    document.getElementById('totalSpins').textContent = this.spinHistory.length;
    document.getElementById('totalWagered').textContent = Currency.format(this.totalWagered);
    document.getElementById('houseIncome').textContent = Currency.format(this.houseIncome);
    document.getElementById('uniqueNumbers').textContent = Object.keys(this.numberHistory).length;

    // Distribución de números
    this.updateNumberDistribution();
  }

  updateNumberDistribution() {
    const dist = document.getElementById('numberDistribution');
    if (!dist || this.spinHistory.length === 0) return;

    const recent = this.spinHistory.slice(-100);
    const distMap = {};

    recent.forEach(num => {
      distMap[num] = (distMap[num] || 0) + 1;
    });

    const html = Object.entries(distMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([num, count]) => `
        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e0e0e0;">
          <span><strong>${num}</strong> ${RouletteRenderer.isRedNumber(parseInt(num)) ? '🔴' : (num === '0' ? '🟢' : '⚫')}</span>
          <span>${count} veces</span>
        </div>
      `).join('');

    dist.innerHTML = html;
  }

  reset() {
    if (confirm('¿Reiniciar ruleta?')) {
      this.rouletteGames = [];
      this.spinHistory = [];
      this.numberHistory = {};
      this.totalWagered = 0;
      this.houseIncome = 0;
      document.getElementById('rouletteContainer').innerHTML = '';
      document.getElementById('recentSpins').innerHTML = '<p class="placeholder">Sin tiradas</p>';
      this.updateUI();
    }
  }
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.rouletteGame = new RouletteGameApp();
});
