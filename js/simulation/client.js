// Cliente IA del Casino
// Representa a un jugador con comportamiento y decisiones

class CasinoClient {
  constructor(id, name, options = {}) {
    this.id = id;
    this.name = name;

    // Datos personales
    this.appearance = options.appearance || 'Persona desconocida';
    this.age = options.age || Math.floor(Math.random() * 50 + 25);
    this.personality = options.personality || this.generatePersonality();

    // Balance
    this.initialBalance = options.initialBalance || 50000;
    this.currentBalance = this.initialBalance;

    // Estado del juego
    this.currentTable = null;
    this.emotion = 'neutral'; // neutral, happy, sad, frustrated, concentrado
    this.lastAction = null;
    this.lastResult = null;

    // Estrategia de juego
    this.strategy = options.strategy || this.generateStrategy();
    this.aggressiveness = options.aggressiveness || Math.random();

    // Historial
    this.gameHistory = [];
    this.stats = {
      totalPlayed: 0,
      totalWon: 0,
      totalLost: 0,
      longestWinStreak: 0,
      currentWinStreak: 0
    };
  }

  generatePersonality() {
    const personalities = [
      'conservador', 'agresivo', 'casual', 'profesional', 'nervioso',
      'confiado', 'prudente', 'impulsivo'
    ];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  generateStrategy() {
    const strategies = ['conservative', 'aggressive', 'random', 'balanced'];
    return strategies[Math.floor(Math.random() * strategies.length)];
  }

  // Decidir apuesta para Blackjack
  decideBet(tableMinBet, tableMaxBet) {
    let bet = 0;

    if (this.strategy === 'conservative') {
      // Solo apuesta mínimo si está perdiendo, más si gana
      if (this.currentBalance < this.initialBalance) {
        bet = tableMinBet;
      } else {
        bet = Math.min(tableMinBet * 3, tableMaxBet);
      }
    } else if (this.strategy === 'aggressive') {
      // Apuesta fuerte siempre
      bet = Math.min(tableMaxBet * 0.7, this.currentBalance * 0.2);
    } else if (this.strategy === 'random') {
      // Aleatorio
      bet = tableMinBet + Math.floor(Math.random() * (tableMaxBet - tableMinBet));
    } else {
      // balanced
      bet = Math.min(tableMaxBet * 0.3, this.currentBalance * 0.1);
    }

    // Nunca apostar más de lo que tiene
    return Math.min(Math.floor(bet), this.currentBalance);
  }

  // Decidir hit/stand en Blackjack (básico)
  decideHitBlackjack(playerHand, dealerUpCard) {
    const playerTotal = this.calculateHandTotal(playerHand);

    if (this.strategy === 'conservative') {
      return playerTotal < 17;
    } else if (this.strategy === 'aggressive') {
      return playerTotal < 16;
    } else if (this.strategy === 'random') {
      return Math.random() > 0.5 && playerTotal < 18;
    } else {
      // balanced - básico strategy
      if (playerTotal < 12) return true;
      if (playerTotal > 16) return false;
      // 12-16: depende del dealer
      return dealerUpCard >= 7;
    }
  }

  calculateHandTotal(hand) {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.rank === 'A') {
        aces++;
        total += 11;
      } else if (['K', 'Q', 'J'].includes(card.rank)) {
        total += 10;
      } else {
        total += parseInt(card.rank);
      }
    }

    // Ajustar ases si está over 21
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  // Decidir apuesta en Ruleta
  decideRouletteBet() {
    const bet = this.decideBet(1000, 100000);
    const betTypes = ['red', 'black', 'even', 'odd', 'number'];
    const betType = betTypes[Math.floor(Math.random() * betTypes.length)];

    let betNumber = null;
    if (betType === 'number') {
      betNumber = Math.floor(Math.random() * 37); // 0-36
    }

    return { bet, betType, betNumber };
  }

  // Aplicar resultado
  applyResult(amount) {
    if (amount > 0) {
      this.currentBalance += amount;
      this.stats.totalWon += amount;
      this.stats.currentWinStreak++;
      this.stats.longestWinStreak = Math.max(
        this.stats.longestWinStreak,
        this.stats.currentWinStreak
      );
      this.updateEmotion('happy');
    } else if (amount < 0) {
      this.currentBalance += amount; // amount es negativo
      this.stats.totalLost += Math.abs(amount);
      this.stats.currentWinStreak = 0;
      this.updateEmotion('sad');
    }

    this.stats.totalPlayed++;

    this.gameHistory.push({
      timestamp: Date.now(),
      amount: amount,
      balance: this.currentBalance
    });

    // Limitar historial a últimas 100 acciones
    if (this.gameHistory.length > 100) {
      this.gameHistory.shift();
    }
  }

  updateEmotion(newEmotion) {
    this.emotion = newEmotion;
    // Vuelver a neutral después de 3 segundos (30 frames @ 10fps)
    setTimeout(() => {
      this.emotion = 'neutral';
    }, 3000);
  }

  // Irse del casino (si perdió demasiado)
  shouldLeave() {
    // Si perdió 70% del balance inicial
    if (this.currentBalance < this.initialBalance * 0.3) {
      return Math.random() > 0.3; // 70% de probabilidad
    }
    // Si ganó mucho, considera irse
    if (this.currentBalance > this.initialBalance * 2.5) {
      return Math.random() > 0.5; // 50% de probabilidad
    }
    return false;
  }

  // Obtener estado JSON
  getState() {
    return {
      id: this.id,
      name: this.name,
      currentBalance: this.currentBalance,
      emotion: this.emotion,
      strategy: this.strategy,
      currentTable: this.currentTable,
      stats: this.stats,
      appearance: this.appearance
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CasinoClient;
}
