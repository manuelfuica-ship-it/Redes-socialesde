// Blackjack Game Logic
// Implementación completa de reglas de Blackjack

class BlackjackGame {
  constructor(options = {}) {
    this.minBet = options.minBet || 1000;
    this.maxBet = options.maxBet || 100000;

    // Reglas
    this.rules = {
      soft17: options.soft17 || 'hit', // hit o stand
      doubleDown: options.doubleDown !== false,
      split: options.split !== false,
      insurance: options.insurance === true,
      blackjackPayout: options.blackjackPayout || 1.5 // 3:2
    };

    // Mazo
    this.deck = this.createDeck(options.numDecks || 6);
    this.penetration = options.penetration || 0.75;
    this.cutCardIndex = Math.floor(this.deck.length * this.penetration);

    // Estado actual
    this.gameState = null;
  }

  // Crear mazo
  createDeck(numDecks = 6) {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    const deck = [];
    for (let d = 0; d < numDecks; d++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          deck.push({ suit, rank });
        }
      }
    }

    // Shuffle con globalRandom
    return globalRandom.shuffle(deck);
  }

  // Repartir carta
  dealCard() {
    if (this.deck.length < this.cutCardIndex) {
      this.deck = this.createDeck();
    }
    return this.deck.pop();
  }

  // Calcular valor de mano
  calculateHandValue(hand) {
    let total = 0;
    let aces = 0;

    // Sumar valores
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

  // Verificar si es soft hand (as contable como 11)
  isSoftHand(hand) {
    let aces = 0;
    let total = 0;

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

    return total <= 21 && aces > 0;
  }

  // Verificar blackjack natural (21 en 2 cartas)
  isBlackjack(hand) {
    return hand.length === 2 && this.calculateHandValue(hand) === 21;
  }

  // Verificar bust (over 21)
  isBust(hand) {
    return this.calculateHandValue(hand) > 21;
  }

  // Comparar manos
  compareHands(playerValue, dealerValue, playerBusted = false, dealerBusted = false) {
    if (playerBusted) return -1; // Player pierde
    if (dealerBusted) return 1;  // Player gana

    if (playerValue > dealerValue) return 1;   // Player gana
    if (playerValue < dealerValue) return -1;  // Dealer gana
    return 0; // Push (empate)
  }

  // Iniciar nueva mano
  startHand(playerBet) {
    if (playerBet < this.minBet || playerBet > this.maxBet) {
      return { error: 'Apuesta inválida' };
    }

    this.gameState = {
      bet: playerBet,
      playerHand: [this.dealCard(), this.dealCard()],
      dealerHand: [this.dealCard(), this.dealCard()],
      playerSplitHands: null,
      doubleDown: false,
      insurance: false,
      playerAction: null,
      result: null,
      payout: 0,
      timestamp: Date.now()
    };

    // Verificar blackjack del dealer
    if (this.isBlackjack(this.gameState.dealerHand) &&
        !this.isBlackjack(this.gameState.playerHand)) {
      this.gameState.result = 'dealer-blackjack';
      this.gameState.payout = -playerBet;
      return this.gameState;
    }

    // Blackjack del player
    if (this.isBlackjack(this.gameState.playerHand)) {
      this.gameState.result = 'player-blackjack';
      this.gameState.payout = Math.floor(playerBet * this.rules.blackjackPayout);
      return this.gameState;
    }

    return this.gameState;
  }

  // Hit - pedir carta
  playerHit() {
    if (!this.gameState) return { error: 'No hay mano activa' };

    this.gameState.playerHand.push(this.dealCard());

    if (this.isBust(this.gameState.playerHand)) {
      this.gameState.result = 'player-bust';
      this.gameState.payout = -this.gameState.bet;
      return this.gameState;
    }

    return this.gameState;
  }

  // Stand - parar
  playerStand() {
    if (!this.gameState) return { error: 'No hay mano activa' };

    // Jugar dealer
    this.playDealer();

    // Resolver resultado
    this.resolveHand();

    return this.gameState;
  }

  // Jugar dealer (hit 16, stand 17+)
  playDealer() {
    while (true) {
      const dealerValue = this.calculateHandValue(this.gameState.dealerHand);

      // Stand on 17+ o soft 17
      if (dealerValue > 17) {
        break;
      }

      if (dealerValue === 17) {
        const isSoft = this.isSoftHand(this.gameState.dealerHand);
        if (this.rules.soft17 === 'stand' || !isSoft) {
          break;
        }
      }

      this.gameState.dealerHand.push(this.dealCard());
    }
  }

  // Resolver resultado
  resolveHand() {
    const playerValue = this.calculateHandValue(this.gameState.playerHand);
    const dealerValue = this.calculateHandValue(this.gameState.dealerHand);

    const playerBusted = this.isBust(this.gameState.playerHand);
    const dealerBusted = this.isBust(this.gameState.dealerHand);

    const result = this.compareHands(playerValue, dealerValue, playerBusted, dealerBusted);

    if (result === 1) {
      this.gameState.result = 'player-win';
      this.gameState.payout = this.gameState.bet;
    } else if (result === -1) {
      this.gameState.result = 'dealer-win';
      this.gameState.payout = -this.gameState.bet;
    } else {
      this.gameState.result = 'push';
      this.gameState.payout = 0;
    }
  }

  // Double Down
  doubleDown() {
    if (!this.gameState || !this.rules.doubleDown) {
      return { error: 'Double down no disponible' };
    }

    if (this.gameState.playerHand.length !== 2) {
      return { error: 'Solo se puede doble en 2 cartas' };
    }

    this.gameState.doubleDown = true;
    this.gameState.bet *= 2;
    this.playerHit();

    if (!this.isBust(this.gameState.playerHand)) {
      this.playerStand();
    }

    return this.gameState;
  }

  // Split
  split() {
    if (!this.gameState || !this.rules.split) {
      return { error: 'Split no disponible' };
    }

    if (this.gameState.playerHand.length !== 2) {
      return { error: 'Solo se puede split en 2 cartas' };
    }

    if (this.gameState.playerHand[0].rank !== this.gameState.playerHand[1].rank) {
      return { error: 'Las cartas deben ser del mismo rango' };
    }

    // Para simplificar, solo soportamos un split por ahora
    this.gameState.playerSplitHands = [
      [this.gameState.playerHand[0], this.dealCard()],
      [this.gameState.playerHand[1], this.dealCard()]
    ];

    return this.gameState;
  }

  // Obtener estado serializable
  getState() {
    return {
      ...this.gameState,
      playerHandValue: this.gameState ? this.calculateHandValue(this.gameState.playerHand) : 0,
      dealerHandValue: this.gameState ? this.calculateHandValue(this.gameState.dealerHand) : 0
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlackjackGame;
}
