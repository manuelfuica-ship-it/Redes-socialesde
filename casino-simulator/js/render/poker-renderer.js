// Poker Renderer
// Renderizado visual de mesa de póker

class PokerRenderer {
  // Crear tabla de póker HTML
  static createPokerTable(tableId) {
    const html = `
      <div id="poker_${tableId}" class="poker-table">
        <div class="poker-felt">
          <!-- Community Cards -->
          <div class="community-area">
            <h3>Community Cards</h3>
            <div id="community-${tableId}" class="community-cards">
              <div class="empty-slot"></div>
              <div class="empty-slot"></div>
              <div class="empty-slot"></div>
              <div class="empty-slot"></div>
              <div class="empty-slot"></div>
            </div>
          </div>

          <!-- Pot -->
          <div class="pot-display">
            <div class="pot-label">POT</div>
            <div id="pot-${tableId}" class="pot-value">$0</div>
          </div>

          <!-- Player Seats -->
          <div class="seats-circle">
            ${Array.from({length: 6}, (_, i) => `
              <div id="seat-${i}-${tableId}" class="seat seat-${i}">
                <div id="player-${i}-name-${tableId}" class="player-name"></div>
                <div id="player-${i}-balance-${tableId}" class="player-balance"></div>
                <div id="player-${i}-hand-${tableId}" class="player-hand"></div>
                <div id="player-${i}-action-${tableId}" class="player-action"></div>
              </div>
            `).join('')}
          </div>

          <!-- Game Info -->
          <div class="game-info">
            <div id="round-${tableId}" class="round-info">Preflop</div>
            <div id="action-player-${tableId}" class="action-player"></div>
          </div>
        </div>
      </div>
    `;

    return html;
  }

  // Actualizar cartas comunitarias
  static updateCommunity(tableId, cards) {
    const container = document.getElementById(`community-${tableId}`);
    if (!container) return;

    container.innerHTML = cards.map((card, idx) => `
      <div class="community-card" style="animation: slideIn 0.3s ease ${idx * 0.1}s both;">
        ${this.renderCardHTML(card)}
      </div>
    `).join('') + Array(5 - cards.length).fill(
      '<div class="empty-slot"></div>'
    ).join('');
  }

  // Renderizar HTML de carta
  static renderCardHTML(card) {
    const color = ['♥', '♦'].includes(card.suit) ? '#e74c3c' : '#2c3e50';
    return `
      <div style="
        display: inline-block;
        width: 50px;
        height: 70px;
        background: white;
        border: 2px solid ${color};
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: ${color};
        font-size: 12px;
      ">
        <div>${card.rank}</div>
        <div>${card.suit}</div>
      </div>
    `;
  }

  // Actualizar jugador en seat
  static updatePlayer(tableId, seatIndex, player, isActive = false) {
    const nameEl = document.getElementById(`player-${seatIndex}-name-${tableId}`);
    const balanceEl = document.getElementById(`player-${seatIndex}-balance-${tableId}`);
    const handEl = document.getElementById(`player-${seatIndex}-hand-${tableId}`);
    const seatEl = document.getElementById(`seat-${seatIndex}-${tableId}`);

    if (nameEl) nameEl.textContent = player.name;
    if (balanceEl) balanceEl.textContent = `$${Currency.formatShort(player.balance)}`;

    if (seatEl) {
      if (isActive) {
        seatEl.classList.add('active');
      } else {
        seatEl.classList.remove('active');
      }

      if (player.folded) {
        seatEl.classList.add('folded');
      } else {
        seatEl.classList.remove('folded');
      }
    }

    // Mostrar cartas solo al final (showdown)
    if (player.hole && player.showCards) {
      if (handEl) {
        handEl.innerHTML = player.hole.map((card, idx) => `
          <div style="margin: ${idx * -10}px 0 0 0; z-index: ${idx};">
            ${this.renderCardHTML(card)}
          </div>
        `).join('');
      }
    }
  }

  // Mostrar acción del jugador
  static showPlayerAction(tableId, seatIndex, action) {
    const actionEl = document.getElementById(`player-${seatIndex}-action-${tableId}`);
    if (actionEl) {
      actionEl.textContent = action;
      actionEl.className = `player-action show`;
      setTimeout(() => {
        actionEl.classList.remove('show');
      }, 2000);
    }
  }

  // Actualizar pot
  static updatePot(tableId, amount) {
    const potEl = document.getElementById(`pot-${tableId}`);
    if (potEl) {
      potEl.textContent = `$${Currency.formatShort(amount)}`;
    }
  }

  // Actualizar información de ronda
  static updateRound(tableId, round, actionPlayer) {
    const roundEl = document.getElementById(`round-${tableId}`);
    const actionEl = document.getElementById(`action-player-${tableId}`);

    if (roundEl) {
      const roundNames = {
        'preflop': 'Preflop',
        'flop': 'Flop',
        'turn': 'Turn',
        'river': 'River',
        'showdown': 'Showdown'
      };
      roundEl.textContent = roundNames[round] || round;
    }

    if (actionEl && actionPlayer) {
      actionEl.textContent = `${actionPlayer.name} actúa`;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PokerRenderer;
}
