// Roulette Game Logic
// Implementación de Ruleta Europea (37 números: 0-36)

class RouletteGame {
  constructor(options = {}) {
    this.minBet = options.minBet || 100;
    this.maxBet = options.maxBet || 100000;
    this.variant = options.variant || 'european'; // european (0-36), american (0-36 + 00)

    // Números
    this.numbers = Array.from({length: 37}, (_, i) => i); // 0-36

    // Colores: 0 es verde, rojo/negro alternado
    this.colors = {
      0: 'green',
      1: 'red', 3: 'red', 5: 'red', 7: 'red', 9: 'red',
      12: 'red', 14: 'red', 16: 'red', 18: 'red',
      19: 'red', 21: 'red', 23: 'red', 25: 'red', 27: 'red',
      30: 'red', 32: 'red', 34: 'red', 36: 'red',
      // Negro
      2: 'black', 4: 'black', 6: 'black', 8: 'black', 10: 'black',
      11: 'black', 13: 'black', 15: 'black', 17: 'black',
      20: 'black', 22: 'black', 24: 'black', 26: 'black', 28: 'black',
      29: 'black', 31: 'black', 33: 'black', 35: 'black'
    };

    // Tipos de apuestas y payouts
    this.bets = {
      number: { name: 'Número exacto', payout: 35, description: '35:1' },
      red: { name: 'Rojo', payout: 1, description: '1:1' },
      black: { name: 'Negro', payout: 1, description: '1:1' },
      even: { name: 'Par', payout: 1, description: '1:1' },
      odd: { name: 'Impar', payout: 1, description: '1:1' },
      low: { name: 'Bajo (1-18)', payout: 1, description: '1:1' },
      high: { name: 'Alto (19-36)', payout: 1, description: '1:1' },
      dozen1: { name: 'Primera docena (1-12)', payout: 2, description: '2:1' },
      dozen2: { name: 'Segunda docena (13-24)', payout: 2, description: '2:1' },
      dozen3: { name: 'Tercera docena (25-36)', payout: 2, description: '2:1' },
      column1: { name: 'Columna 1', payout: 2, description: '2:1' },
      column2: { name: 'Columna 2', payout: 2, description: '2:1' },
      column3: { name: 'Columna 3', payout: 2, description: '2:1' }
    };

    this.gameState = null;
  }

  // Generar número ganador
  spinWheel() {
    return globalRandom.nextInt(0, 37); // 0-36
  }

  // Crear una nueva tirada
  startSpin() {
    this.gameState = {
      bets: [], // Array de apuestas
      winningNumber: this.spinWheel(),
      result: null,
      payouts: {},
      timestamp: Date.now(),
      spinDuration: 3 + Math.random() * 2 // 3-5 segundos
    };

    return this.gameState;
  }

  // Agregar apuesta a la tirada
  placeBet(amount, betType, betNumber = null) {
    if (!this.gameState) {
      return { error: 'No hay tirada activa' };
    }

    if (amount < this.minBet || amount > this.maxBet) {
      return { error: 'Apuesta fuera de rango' };
    }

    if (betType === 'number' && (betNumber === null || betNumber < 0 || betNumber > 36)) {
      return { error: 'Número inválido' };
    }

    this.gameState.bets.push({
      amount: amount,
      type: betType,
      number: betNumber,
      id: `bet_${Date.now()}_${Math.random()}`
    });

    return { success: true };
  }

  // Resolver tirada
  resolveSpin() {
    if (!this.gameState) return null;

    const { winningNumber, bets } = this.gameState;
    const winningColor = this.colors[winningNumber];
    const results = {};

    for (const bet of bets) {
      let isWin = false;

      switch (bet.type) {
        case 'number':
          isWin = bet.number === winningNumber;
          break;
        case 'red':
          isWin = winningColor === 'red';
          break;
        case 'black':
          isWin = winningColor === 'black';
          break;
        case 'even':
          isWin = winningNumber > 0 && winningNumber % 2 === 0;
          break;
        case 'odd':
          isWin = winningNumber > 0 && winningNumber % 2 === 1;
          break;
        case 'low':
          isWin = winningNumber >= 1 && winningNumber <= 18;
          break;
        case 'high':
          isWin = winningNumber >= 19 && winningNumber <= 36;
          break;
        case 'dozen1':
          isWin = winningNumber >= 1 && winningNumber <= 12;
          break;
        case 'dozen2':
          isWin = winningNumber >= 13 && winningNumber <= 24;
          break;
        case 'dozen3':
          isWin = winningNumber >= 25 && winningNumber <= 36;
          break;
        case 'column1':
          isWin = winningNumber > 0 && winningNumber % 3 === 1;
          break;
        case 'column2':
          isWin = winningNumber > 0 && winningNumber % 3 === 2;
          break;
        case 'column3':
          isWin = winningNumber > 0 && winningNumber % 3 === 0;
          break;
      }

      const payout = isWin ? bet.amount * this.bets[bet.type].payout : -bet.amount;
      results[bet.id] = {
        bet: bet,
        isWin: isWin,
        payout: payout,
        type: bet.type
      };
    }

    this.gameState.payouts = results;
    this.gameState.result = 'settled';

    return results;
  }

  // Obtener color del número
  getColor(number) {
    return this.colors[number] || 'green';
  }

  // Verificar si número es rojo
  isRed(number) {
    return this.colors[number] === 'red';
  }

  // Verificar si número es negro
  isBlack(number) {
    return this.colors[number] === 'black';
  }

  // Verificar si número es verde
  isGreen(number) {
    return this.colors[number] === 'green';
  }

  // Obtener estado JSON
  getState() {
    return {
      ...this.gameState,
      winningColor: this.gameState ? this.getColor(this.gameState.winningNumber) : null
    };
  }

  // Reset
  reset() {
    this.gameState = null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RouletteGame;
}
