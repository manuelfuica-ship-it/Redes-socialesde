// Dashboard App
// Control centralizado del casino con múltiples vistas

class DashboardApp {
  constructor() {
    this.casino = new Casino({ name: 'Casino Central' });
    this.isRunning = false;
    this.animationFrameId = null;
    this.startTime = Date.now();
    this.transactionHistory = [];
    this.gameStats = {
      blackjack: 0,
      roulette: 0,
      poker: 0
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderDashboard();
    this.updateDashboard();
  }

  setupEventListeners() {
    // Tabs de navegación
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Controles principales
    document.getElementById('startSimBtn').addEventListener('click', () => this.startSimulation());
    document.getElementById('stopSimBtn').addEventListener('click', () => this.stopSimulation());
    document.getElementById('refreshBtn').addEventListener('click', () => this.updateDashboard());
  }

  renderDashboard() {
    const container = document.getElementById('dashboardContainer');
    container.innerHTML = DashboardRenderer.createDashboard();
  }

  switchTab(tabName) {
    // Actualizar nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      }
    });

    // Aquí se podría cambiar contenido según tab
    // Por ahora, mostrar siempre el dashboard principal
    this.updateDashboard();
  }

  startSimulation() {
    if (this.isRunning) return;

    // Crear estructura inicial
    if (this.casino.clients.length === 0) {
      this.casino.generateRandomClients(12);
      this.casino.createTable('blackjack');
      this.casino.createTable('roulette');
    }

    this.isRunning = true;
    this.casino.running = true;

    document.getElementById('startSimBtn').disabled = true;
    document.getElementById('stopSimBtn').disabled = false;

    this.simulationLoop();
    console.log('✓ Simulación iniciada');
  }

  stopSimulation() {
    this.isRunning = false;
    this.casino.running = false;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    document.getElementById('startSimBtn').disabled = false;
    document.getElementById('stopSimBtn').disabled = true;
    console.log('✓ Simulación detenida');
  }

  simulationLoop() {
    if (!this.isRunning) return;

    // Actualizar casino
    this.casino.update();

    // Procesar lógica de juegos (simplificada)
    this.processGames();

    // Actualizar UI
    this.updateDashboard();

    this.animationFrameId = requestAnimationFrame(() => this.simulationLoop());
  }

  processGames() {
    // Simular eventos aleatorios de juegos
    if (this.casino.frameCount % 30 === 0) {
      // Cada 30 frames (~0.5 segundos)
      const randomEvent = Math.random();

      if (randomEvent < 0.3) {
        this.gameStats.blackjack++;
        this.addTransaction({
          amount: Math.random() > 0.5 ? 5000 : -3000,
          type: 'game',
          description: 'Blackjack - Mano jugada'
        });
      } else if (randomEvent < 0.6) {
        this.gameStats.roulette++;
        this.addTransaction({
          amount: Math.random() > 0.5 ? 8000 : -5000,
          type: 'game',
          description: 'Ruleta - Tirada realizada'
        });
      }
    }
  }

  addTransaction(tx) {
    const transaction = {
      timestamp: Date.now(),
      ...tx
    };

    this.transactionHistory.push(transaction);

    // Limitar historial
    if (this.transactionHistory.length > 100) {
      this.transactionHistory.shift();
    }

    // Actualizar balance del casino
    this.casino.balance += tx.amount;
  }

  updateDashboard() {
    // KPIs
    const activePlayers = this.casino.clients.filter(c => c.currentTable).length;
    const todayIncome = this.transactionHistory
      .filter(t => Date.now() - t.timestamp < 24 * 60 * 60 * 1000)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBets = this.transactionHistory
      .filter(t => Date.now() - t.timestamp < 24 * 60 * 60 * 1000)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const winRate = totalBets > 0 ? (todayIncome / totalBets * 100) : 0;

    DashboardRenderer.updateKPIs(
      this.casino.balance,
      todayIncome,
      activePlayers,
      winRate
    );

    // Gráficos
    this.drawCharts();

    // Tablas
    DashboardRenderer.updateTablesStatus(this.casino.tables);
    DashboardRenderer.updatePlayersRanking(this.casino.clients);
    DashboardRenderer.updateTransactionHistory(this.transactionHistory);

    // Status
    document.getElementById('casinoStatus').textContent =
      this.isRunning ? '▶ En ejecución' : '⏹ Parado';

    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    document.getElementById('casinoUptime').textContent =
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  drawCharts() {
    // Gráfico de ingresos
    const incomeCanvas = document.getElementById('incomeChart');
    if (incomeCanvas) {
      const ctx = incomeCanvas.getContext('2d');
      const gameData = {
        'Blackjack': this.gameStats.blackjack * 2000,
        'Ruleta': this.gameStats.roulette * 3000,
        'Póker': (this.gameStats.poker || 0) * 5000
      };

      DashboardRenderer.drawIncomeChart(ctx, gameData);
    }

    // Gráfico de apuestas
    const betsCanvas = document.getElementById('betsChart');
    if (betsCanvas) {
      const ctx = betsCanvas.getContext('2d');
      this.drawBetsChart(ctx);
    }
  }

  drawBetsChart(ctx) {
    const total =
      this.gameStats.blackjack +
      this.gameStats.roulette +
      (this.gameStats.poker || 0);

    if (total === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sin datos', ctx.canvas.width / 2, ctx.canvas.height / 2);
      return;
    }

    const games = [
      {name: 'Blackjack', count: this.gameStats.blackjack, color: '#2ecc71'},
      {name: 'Ruleta', count: this.gameStats.roulette, color: '#e74c3c'},
      {name: 'Póker', count: this.gameStats.poker || 0, color: '#3498db'}
    ];

    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    let currentAngle = 0;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const game of games) {
      const sliceAngle = (game.count / total) * Math.PI * 2;

      // Dibujar slice
      ctx.fillStyle = game.color;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const percent = ((game.count / total) * 100).toFixed(0);
      ctx.fillText(`${percent}%`, labelX, labelY);

      currentAngle += sliceAngle;
    }

    // Leyenda
    let legendY = 10;
    games.forEach(game => {
      ctx.fillStyle = game.color;
      ctx.fillRect(10, legendY, 12, 12);
      ctx.fillStyle = '#333';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(game.name, 25, legendY + 10);
      legendY += 20;
    });
  }
}

// Inicializar cuando DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardApp = new DashboardApp();
});
