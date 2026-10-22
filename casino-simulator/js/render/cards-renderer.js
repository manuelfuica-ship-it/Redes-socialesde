// Cards Renderer
// Renderizado de cartas como SVG inline

class CardsRenderer {
  // SVG de una carta
  static getCardSVG(rank, suit, width = 60, height = 90) {
    const cardColor = ['♥', '♦'].includes(suit) ? '#e74c3c' : '#2c3e50';
    const cardBg = '#ffffff';

    // SVG de carta básica
    const svg = `
      <svg width="${width}" height="${height}" viewBox="0 0 60 90" xmlns="http://www.w3.org/2000/svg">
        <!-- Fondo de carta -->
        <rect width="60" height="90" fill="${cardBg}" stroke="${cardColor}" stroke-width="1" rx="4"/>

        <!-- Esquina superior izquierda -->
        <text x="3" y="12" font-size="10" font-weight="bold" fill="${cardColor}">${rank}</text>
        <text x="3" y="22" font-size="8" fill="${cardColor}">${suit}</text>

        <!-- Centro -->
        <text x="30" y="50" font-size="20" font-weight="bold" fill="${cardColor}"
              text-anchor="middle" dominant-baseline="middle">${rank}</text>

        <!-- Esquina inferior derecha (invertida) -->
        <g transform="translate(57, 88) rotate(180)">
          <text x="0" y="0" font-size="10" font-weight="bold" fill="${cardColor}">${rank}</text>
          <text x="0" y="10" font-size="8" fill="${cardColor}">${suit}</text>
        </g>
      </svg>
    `;

    return svg;
  }

  // Renderizar mano de cartas HTML
  static renderHand(hand, containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = hand.map((card, index) => {
      const svg = this.getCardSVG(card.rank, card.suit, 60, 90);
      return `
        <div class="card-item" style="animation: slideIn 0.3s ease ${index * 0.1}s both;">
          ${svg}
        </div>
      `;
    }).join('');
  }

  // Renderizar mano en canvas
  static drawHand(ctx, hand, x, y, cardWidth = 60, cardHeight = 90, spacing = 10) {
    hand.forEach((card, index) => {
      const cardX = x + index * (cardWidth + spacing);
      this.drawCard(ctx, card, cardX, y, cardWidth, cardHeight);
    });
  }

  // Dibujar carta individual en canvas
  static drawCard(ctx, card, x, y, width = 60, height = 90) {
    const color = ['♥', '♦'].includes(card.suit) ? '#e74c3c' : '#2c3e50';
    const bgColor = '#ffffff';

    // Fondo
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 4);
    ctx.fill();
    ctx.stroke();

    // Texto rango
    ctx.fillStyle = color;
    ctx.font = 'bold 12px Arial';
    ctx.fillText(card.rank, x + 4, y + 14);
    ctx.font = '10px Arial';
    ctx.fillText(card.suit, x + 4, y + 24);

    // Centro
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.rank, x + width / 2, y + height / 2);

    ctx.textAlign = 'left';
  }

  // Renderizar dorso de carta
  static drawCardBack(ctx, x, y, width = 60, height = 90) {
    const pattern = ctx.createLinearGradient(x, y, x + width, y + height);
    pattern.addColorStop(0, '#2980b9');
    pattern.addColorStop(1, '#1a5276');

    ctx.fillStyle = pattern;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 4);
    ctx.fill();
    ctx.stroke();

    // Patrón
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(x + 5 + i * 10, y + 5);
      ctx.lineTo(x + 5 + i * 10, y + height - 5);
      ctx.stroke();
    }
  }

  // Tabla de valores de mano
  static renderHandValue(containerId, value, isSoft = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const softStr = isSoft ? ' (soft)' : '';
    container.innerHTML = `<strong>${value}${softStr}</strong>`;
  }
}

// Polyfill para roundRect (no disponible en navegadores antiguos)
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CardsRenderer;
}
