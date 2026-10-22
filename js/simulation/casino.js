// Casino Manager
// Gestor principal del casino y simulación

class Casino {
  constructor(options = {}) {
    this.name = options.name || 'Casino de Juego';
    this.initialBalance = options.initialBalance || 1000000;
    this.balance = this.initialBalance;

    this.tables = [];
    this.clients = [];
    this.clientIdCounter = 0;
    this.tableIdCounter = 0;

    this.stats = {
      totalHandsPlayed: 0,
      totalSpins: 0,
      totalIncome: 0,
      totalExpense: 0,
      startTime: Date.now()
    };

    this.running = false;
    this.speed = 1; // 1x, 2x, 4x
    this.frameCount = 0;
    this.lastSaveTime = Date.now();
    this.SAVE_INTERVAL = 10000; // Guardar cada 10s
  }

  // Crear mesa
  createTable(gameType, options = {}) {
    const table = {
      id: `table_${this.tableIdCounter++}`,
      type: gameType, // 'blackjack', 'roulette', 'poker'
      minBet: options.minBet || 1000,
      maxBet: options.maxBet || 100000,
      players: [],
      state: 'idle', // idle, betting, playing, settled
      gameData: {},
      history: [],
      dealer: null
    };

    this.tables.push(table);
    return table;
  }

  // Agregar cliente
  addClient(name, options = {}) {
    const client = new CasinoClient(
      `client_${this.clientIdCounter++}`,
      name,
      {
        initialBalance: options.initialBalance || 50000,
        ...options
      }
    );

    this.clients.push(client);
    return client;
  }

  // Generar clientes aleatorios
  generateRandomClients(count = 10, names = []) {
    const defaultNames = [
      'Carlos', 'María', 'Juan', 'Patricia', 'Roberto',
      'Francisca', 'Luis', 'Ana', 'Miguel', 'Carmen',
      'Pedro', 'Gabriela', 'Fernando', 'Marcela', 'Andrés'
    ];

    const availableNames = names.length > 0 ? names : defaultNames;

    for (let i = 0; i < count; i++) {
      const name = availableNames[i % availableNames.length] +
                   (i >= availableNames.length ? ` ${Math.floor(i / availableNames.length)}` : '');

      this.addClient(name, {
        strategy: ['conservative', 'aggressive', 'random', 'balanced'][i % 4]
      });
    }
  }

  // Asignar cliente a mesa
  assignClientToTable(clientId, tableId) {
    const client = this.clients.find(c => c.id === clientId);
    const table = this.tables.find(t => t.id === tableId);

    if (!client || !table) return false;
    if (table.players.length >= 6) return false; // Máximo 6 jugadores

    client.currentTable = tableId;
    table.players.push(clientId);
    return true;
  }

  // Remover cliente de mesa
  removeClientFromTable(clientId, tableId) {
    const client = this.clients.find(c => c.id === clientId);
    const table = this.tables.find(t => t.id === tableId);

    if (!client || !table) return false;

    client.currentTable = null;
    table.players = table.players.filter(id => id !== clientId);
    return true;
  }

  // Agregar ganancia/pérdida al casino
  recordTransaction(amount, type = 'game', description = '') {
    if (amount > 0) {
      this.balance += amount;
      this.stats.totalIncome += amount;
    } else {
      this.balance -= Math.abs(amount);
      this.stats.totalExpense += Math.abs(amount);
    }

    // Guardar en historial
    const transaction = {
      timestamp: Date.now(),
      amount: amount,
      type: type,
      description: description
    };

    // Emitir evento para escuchadores (dashboard, etc)
    this.emit('transaction', transaction);
  }

  // Sistema de eventos simple
  listeners = {};

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Update loop principal
  update() {
    if (!this.running) return;

    this.frameCount++;

    // Actualizar clientes (emociones, decidir si irse)
    for (const client of this.clients) {
      // Si no tiene mesa, intenta sentarse
      if (!client.currentTable && this.tables.length > 0) {
        const availableTable = this.tables.find(
          t => t.players.length < 6 && t.state === 'idle'
        );
        if (availableTable) {
          this.assignClientToTable(client.id, availableTable.id);
        }
      }

      // Si debería irse, ir
      if (client.shouldLeave()) {
        const table = this.tables.find(t => t.id === client.currentTable);
        if (table) {
          this.removeClientFromTable(client.id, client.currentTable);
          this.emit('client-left', { clientId: client.id, reason: 'budget' });
        }
      }
    }

    // Guardar estado periódicamente
    const now = Date.now();
    if (now - this.lastSaveTime > this.SAVE_INTERVAL) {
      this.save();
      this.lastSaveTime = now;
    }
  }

  // Guardar estado en localStorage
  save() {
    const state = {
      name: this.name,
      balance: this.balance,
      initialBalance: this.initialBalance,
      stats: this.stats,
      clientsState: this.clients.map(c => c.getState())
    };

    Storage.saveCasinoState(state);
  }

  // Cargar estado
  load() {
    const state = Storage.loadCasinoState();
    if (!state) return false;

    this.name = state.name;
    this.balance = state.balance;
    this.initialBalance = state.initialBalance;
    this.stats = state.stats;

    // Reconstruir clientes (datos básicos)
    this.clients = state.clientsState.map(cState => {
      const client = new CasinoClient(cState.id, cState.name);
      client.currentBalance = cState.currentBalance;
      client.stats = cState.stats;
      return client;
    });

    return true;
  }

  // Reset
  reset() {
    this.balance = this.initialBalance;
    this.tables = [];
    this.clients = [];
    this.clientIdCounter = 0;
    this.tableIdCounter = 0;
    this.stats = {
      totalHandsPlayed: 0,
      totalSpins: 0,
      totalIncome: 0,
      totalExpense: 0,
      startTime: Date.now()
    };
    this.frameCount = 0;
  }

  // Obtener estado JSON
  getState() {
    return {
      name: this.name,
      balance: this.balance,
      initialBalance: this.initialBalance,
      stats: this.stats,
      tables: this.tables,
      clients: this.clients.map(c => c.getState()),
      running: this.running
    };
  }

  // Getter para dinero formateado
  getFormattedBalance() {
    return Currency.format(this.balance);
  }

  getFormattedProfit() {
    const profit = this.stats.totalIncome - this.stats.totalExpense;
    return Currency.format(profit);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Casino;
}
