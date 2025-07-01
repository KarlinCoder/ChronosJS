// ================ CORE LIBRARY ================
/**
 * ChronosJS - Generación de números aleatorios de alta calidad
 * @license MIT
 * @version 1.0.0
 */
class ChronosJS {
  constructor(seed = this._generateSeed(), algorithm = "chronos64") {
    this._version = "1.0.0";
    this._seed = seed;
    this._algorithm = algorithm;
    this._state = this._initEngine(seed, algorithm);
    this._history = [];
  }

  // ========== MÉTODOS PRINCIPALES ==========
  /** Float [0, 1) */
  next() {
    const value = this._state.next();
    this._history.push(value);
    return value;
  }

  /** Entero [min, max] */
  int(min = 0, max = 100) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Float [min, max) */
  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  /** Booleano con probabilidad personalizable */
  bool(probability = 0.5) {
    return this.next() < probability;
  }

  // ========== DISTRIBUCIONES ESTADÍSTICAS ==========
  /** Distribución normal (Box-Muller) */
  normal(mean = 0, stdDev = 1) {
    let u, v, s;
    do {
      u = this.float(-1, 1);
      v = this.float(-1, 1);
      s = u * u + v * v;
    } while (s >= 1 || s === 0);
    const z0 = u * Math.sqrt((-2 * Math.log(s)) / s);
    return z0 * stdDev + mean;
  }

  /** Distribución exponencial */
  exponential(lambda = 1) {
    return -Math.log(1 - this.next()) / lambda;
  }

  // ========== MANEJO DE ESTADO ==========
  /** Guarda el estado actual */
  saveState() {
    return {
      seed: this._seed,
      algorithm: this._algorithm,
      state: JSON.parse(JSON.stringify(this._state)),
      history: [...this._history],
      version: this._version,
    };
  }

  /** Restaura un estado guardado */
  loadState(state) {
    if (state.version !== this._version)
      console.warn("Versión diferente detectada");
    this._seed = state.seed;
    this._algorithm = state.algorithm;
    this._state = state.state;
    this._history = state.history;
    return this;
  }

  // ========== UTILIDADES ==========
  /** Cambia el algoritmo RNG */
  useAlgorithm(algorithm) {
    if (this._algorithm !== algorithm) {
      this._algorithm = algorithm;
      this._state = this._initEngine(this._seed, algorithm);
    }
    return this;
  }

  /** Establece una nueva semilla */
  reseed(seed) {
    this._seed = seed;
    this._state = this._initEngine(seed, this._algorithm);
    this._history = [];
    return this;
  }

  // ========== MÉTODOS PRIVADOS ==========
  _generateSeed() {
    const time =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const cryptoSeed =
      typeof crypto !== "undefined"
        ? crypto.getRandomValues(new Uint32Array(1))[0]
        : Math.random() * 0xffffffff;
    return [time, cryptoSeed];
  }

  _initEngine(seed, algorithm) {
    const engines = {
      chronos64: Chronos64Engine,
      xoshiro256ss: Xoshiro256SSEngine,
      pcg32: PCG32Engine,
      crypto: CryptoEngine,
    };
    if (!engines[algorithm])
      throw new Error(`Algoritmo no soportado: ${algorithm}`);
    return new engines[algorithm](seed);
  }
}

// ========== IMPLEMENTACIONES DE ALGORITMOS ==========
class Chronos64Engine {
  constructor(seed) {
    this.state = [
      this._hash(seed[0] || 0xdeadbeef),
      this._hash(seed[1] || 0xbadc0ffe),
    ];
  }

  next() {
    const [a, b] = this.state;
    this.state[0] = (a ^ (a << 15)) >>> 0;
    this.state[1] = (b ^ (b >>> 17)) >>> 0;
    const mixed = (this.state[0] + this.state[1]) >>> 0;
    return mixed / 0xffffffff;
  }

  _hash(val) {
    val = val ^ 61 ^ (val >>> 16);
    val = val + (val << 3);
    val = val ^ (val >>> 4);
    val = val * 0x27d4eb2d;
    return (val ^ (val >>> 15)) >>> 0;
  }
}

class Xoshiro256SSEngine {
  constructor(seed) {
    this.state = this._initialize(seed);
  }

  next() {
    const result = ((this.state[1] * 5) << 7) >>> 0;
    const t = this.state[1] << 17;

    this.state[2] ^= this.state[0];
    this.state[3] ^= this.state[1];
    this.state[1] ^= this.state[2];
    this.state[0] ^= this.state[3];
    this.state[2] ^= t;
    this.state[3] = (this.state[3] << 45) | (this.state[3] >>> 19);

    return (result >>> 0) / 0x100000000;
  }

  _initialize(seed) {
    // Inicialización robusta del estado
    return [
      this._hash(seed[0] || 0x8d3b7c19),
      this._hash(seed[1] || 0x4e6f5a2d),
      this._hash((seed[0] || 0x1b0a3f6e) + 0x9c7d5e3f),
      this._hash((seed[1] || 0x2d4e6f81) + 0x5a3b7c9d),
    ];
  }

  _hash(val) {
    val = val ^ 61 ^ (val >>> 16);
    val = val + (val << 3);
    val = val ^ (val >>> 4);
    val = val * 0x27d4eb2d;
    return (val ^ (val >>> 15)) >>> 0;
  }
}

class PCG32Engine {
  constructor(seed) {
    this.state = BigInt(seed[0] || 0x4d595df4d0f33173n);
    this.inc = 1442695040888963407n;
    this.mult = 6364136223846793005n;
  }

  next() {
    const oldstate = this.state;
    this.state = (oldstate * this.mult + this.inc) & 0xffffffffffffffffn;
    const xorshifted = ((oldstate >> 18n) ^ oldstate) >> 27n;
    const rot = oldstate >> 59n;
    const result =
      ((xorshifted >> rot) | (xorshifted << (-rot & 31n))) & 0xffffffffn;
    return Number(result) / 0x100000000;
  }
}

class CryptoEngine {
  constructor() {
    if (typeof crypto === "undefined") {
      throw new Error("Entorno sin soporte para Crypto API");
    }
  }

  next() {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 0x100000000;
  }
}

// ========== INSTANCIA GLOBAL ==========
const _globalInstance = new ChronosJS();

// ========== EXPORTS ==========
export { ChronosJS as default, _globalInstance as random, ChronosJS };
