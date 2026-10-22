// Poker Game Logic - Texas Hold'em
// Implementación simplificada de Texas Hold'em para casino

class PokerGame {
  constructor(options = {}) {
    this.smallBlind = options.smallBlind || 50;
    this.bigBlind = options.bigBlind || 100;
    this.maxPlayers = options.maxPlayers || 6;

    // Deck
    this.deck = this.createDeck();

    // Game state
    this.gameState = null;
    this.players = [];
    this.dealer = null;
  }

  createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

    const deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank });
      }
    }

    return globalRandom.shuffle(deck);
  }

  // Evaluar mano (5 best cards)
  evaluateHand(hole, community) {
    const allCards = [...hole, ...community];
    const bestHand = this.findBestHand(allCards);
    return this.getHandRank(bestHand);
  }

  // Encontrar mejor mano de 5 cartas
  findBestHand(cards) {
    if (cards.length < 5) return cards;

    const combinations = this.getCombi nations(cards, 5);
    let bestHand = combinations[0];
    let bestRank = this.getHandRank(bestHand);

    for (let i = 1; i < combinations.length; i++) {
      const rank = this.getHandRank(combinations[i]);
      if (this.compareRanks(rank, bestRank) > 0) {
        bestHand = combinations[i];
        bestRank = rank;
      }
    }

    return bestHand;
  }

  // Combinaciones de n elementos
  getCombinations(arr, n) {
    if (n === 1) return arr.map(x => [x]);
    const combs = [];
    for (let i = 0; i <= arr.length - n; i++) {
      const head = arr.slice(i, i + 1);
      const tail = this.getCombinations(arr.slice(i + 1), n - 1);
      for (const t of tail) {
        combs.push(head.concat(t));
      }
    }
    return combs;
  }

  // Clasificar mano (retorna {type, value, kickers})
  getHandRank(hand) {
    const ranks = hand.map(c => this.rankValue(c.rank));
    const suits = hand.map(c => c.suit);

    const isFlush = suits.every(s => s === suits[0]);
    const isStraight = this.isStraight(ranks);
    const counts = this.getCounts(ranks);
    const [count1, count2] = Object.values(counts).sort((a, b) => b - a);

    let type, value;

    if (isStraight && isFlush) {
      type = 'straight-flush';
      value = Math.max(...ranks);
    } else if (count1 === 4) {
      type = 'four-of-a-kind';
      value = Object.keys(counts).find(k => counts[k] === 4);
    } else if (count1 === 3 && count2 === 2) {
      type = 'full-house';
      value = Object.keys(counts).find(k => counts[k] === 3);
    } else if (isFlush) {
      type = 'flush';
      value = Math.max(...ranks);
    } else if (isStraight) {
      type = 'straight';
      value = Math.max(...ranks);
    } else if (count1 === 3) {
      type = 'three-of-a-kind';
      value = Object.keys(counts).find(k => counts[k] === 3);
    } else if (count1 === 2 && count2 === 2) {
      type = 'two-pair';
      value = Object.keys(counts).filter(k => counts[k] === 2).map(Number).sort((a, b) => b - a);
    } else if (count1 === 2) {
      type = 'pair';
      value = Object.keys(counts).find(k => counts[k] === 2);
    } else {
      type = 'high-card';
      value = Math.max(...ranks);
    }

    return { type, value, hand };
  }

  // Comparar dos rankings
  compareRanks(rank1, rank2) {
    const ranking = [
      'high-card', 'pair', 'two-pair', 'three-of-a-kind',
      'straight', 'flush', 'full-house', 'four-of-a-kind', 'straight-flush'
    ];

    const type1Index = ranking.indexOf(rank1.type);
    const type2Index = ranking.indexOf(rank2.type);

    if (type1Index !== type2Index) {
      return type1Index - type2Index;
    }

    // Mismo tipo, comparar valores
    if (typeof rank1.value === 'number' && typeof rank2.value === 'number') {
      return rank1.value - rank2.value;
    }

    return 0;
  }

  rankValue(rank) {
    const values = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11 };
    return values[rank] || parseInt(rank);
  }

  isStraight(ranks) {
    const sorted = [...ranks].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] !== 1) return false;
    }
    return true;
  }

  getCounts(arr) {
    const counts = {};
    for (const val of arr) {
      counts[val] = (counts[val] || 0) + 1;
    }
    return counts;
  }

  // Iniciar nueva mano
  startHand(players, playerPositions) {
    if (players.length === 0) return null;

    // Reset deck
    this.deck = this.createDeck();

    this.gameState = {
      players: players.map(p => ({
        ...p,
        hole: [this.deck.pop(), this.deck.pop()],
        bet: 0,
        folded: false,
        allIn: false,
        balance: p.balance
      })),
      community: [],
      pot: 0,
      currentBet: this.bigBlind,
      round: 'preflop', // preflop, flop, turn, river, showdown
      action: 0,
      playerPositions: playerPositions,
      timestamp: Date.now()
    };

    return this.gameState;
  }

  // Flop (3 community cards)
  flop() {
    if (!this.gameState) return null;
    this.gameState.community = [this.deck.pop(), this.deck.pop(), this.deck.pop()];
    this.gameState.round = 'flop';
    return this.gameState;
  }

  // Turn (1 card)
  turn() {
    if (!this.gameState) return null;
    this.gameState.community.push(this.deck.pop());
    this.gameState.round = 'turn';
    return this.gameState;
  }

  // River (1 card)
  river() {
    if (!this.gameState) return null;
    this.gameState.community.push(this.deck.pop());
    this.gameState.round = 'river';
    return this.gameState;
  }

  // Calcular hand strength (0-1, qué tan fuerte es la mano)
  getHandStrength(holeCards, communityCards) {
    if (communityCards.length === 0) {
      // Preflop: evaluar pair, high cards
      const rank1 = this.rankValue(holeCards[0].rank);
      const rank2 = this.rankValue(holeCards[1].rank);

      if (rank1 === rank2) return 0.85; // Pair
      if (rank1 >= 12 || rank2 >= 12) return 0.65; // High cards
      return 0.45;
    }

    // Post-flop: evaluar mano real
    const hand = this.evaluateHand(holeCards, communityCards);

    const strengthMap = {
      'high-card': 0.1,
      'pair': 0.35,
      'two-pair': 0.55,
      'three-of-a-kind': 0.7,
      'straight': 0.75,
      'flush': 0.8,
      'full-house': 0.9,
      'four-of-a-kind': 0.95,
      'straight-flush': 1.0
    };

    return strengthMap[hand.type] || 0.1;
  }

  // Obtener estado JSON
  getState() {
    return this.gameState;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PokerGame;
}
