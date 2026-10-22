// Seedable Random Number Generator
// Usa algoritmo Mulberry32 para determinismo
class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed;
    this.state = seed;
  }

  // Mulberry32 - determinístico y rápido
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Random integer entre min (inclusive) y max (exclusive)
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min)) + min;
  }

  // Random entre 0 y 1
  random() {
    return this.next();
  }

  // Shuffle array (Fisher-Yates)
  shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Elegir un elemento random
  choice(array) {
    return array[this.nextInt(0, array.length)];
  }

  // Reset seed
  setSeed(seed) {
    this.seed = seed;
    this.state = seed;
  }
}

// Exportar singleton global
const globalRandom = new SeededRandom();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SeededRandom, globalRandom };
}
