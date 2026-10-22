// LocalStorage Wrapper
// Manejo seguro de persistencia

class Storage {
  static KEYS = {
    CASINO_STATE: 'casino_state',
    CASINO_HISTORY: 'casino_history',
    GAME_STATS: 'game_stats'
  };

  // Guardar objeto
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Storage error saving ${key}:`, error);
      return false;
    }
  }

  // Obtener objeto
  static get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Storage error reading ${key}:`, error);
      return defaultValue;
    }
  }

  // Eliminar
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage error removing ${key}:`, error);
      return false;
    }
  }

  // Limpiar todo
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage error clearing:', error);
      return false;
    }
  }

  // Guardar estado del casino
  static saveCasinoState(casinoState) {
    return this.set(this.KEYS.CASINO_STATE, casinoState);
  }

  // Cargar estado del casino
  static loadCasinoState() {
    return this.get(this.KEYS.CASINO_STATE);
  }

  // Añadir a historial
  static addHistory(entry) {
    const history = this.get(this.KEYS.CASINO_HISTORY, []);
    history.push({
      ...entry,
      timestamp: Date.now()
    });
    // Mantener solo últimas 1000 entradas
    if (history.length > 1000) {
      history.shift();
    }
    this.set(this.KEYS.CASINO_HISTORY, history);
  }

  // Obtener historial
  static getHistory(limit = 100) {
    const history = this.get(this.KEYS.CASINO_HISTORY, []);
    return history.slice(-limit);
  }

  // Guardar estadísticas
  static saveStats(stats) {
    return this.set(this.KEYS.GAME_STATS, stats);
  }

  // Cargar estadísticas
  static loadStats() {
    return this.get(this.KEYS.GAME_STATS, {});
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
