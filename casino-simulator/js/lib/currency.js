// Currency Formatter
// Formateo de dinero chileno y utilidades

class Currency {
  // Formatear dinero en pesos chilenos
  static format(amount, decimals = 0) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount);
  }

  // Formato corto (e.g., "1.5M", "500K")
  static formatShort(amount) {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  }

  // Obtener signo de dinero ganado/perdido
  static getDelta(oldValue, newValue) {
    const delta = newValue - oldValue;
    const sign = delta >= 0 ? '+' : '-';
    return sign + this.format(Math.abs(delta));
  }

  // Clase para seguimiento de dinero
  static createBalance(initial = 0) {
    return {
      current: initial,
      initial: initial,
      won: 0,
      lost: 0,

      addWin(amount) {
        this.current += amount;
        this.won += amount;
      },

      addLoss(amount) {
        this.current -= amount;
        this.lost += amount;
      },

      getProfit() {
        return this.current - this.initial;
      },

      getRoi() {
        return this.initial > 0 ? (this.getProfit() / this.initial) * 100 : 0;
      },

      getStats() {
        return {
          current: this.current,
          profit: this.getProfit(),
          roi: this.getRoi().toFixed(2),
          totalWon: this.won,
          totalLost: this.lost,
          sessions: this.won + this.lost
        };
      }
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Currency;
}
