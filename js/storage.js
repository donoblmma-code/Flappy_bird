'use strict';
(() => {
  class ScoreStorage {
    constructor(storage) { this.storage = storage; this.key = 'flappy-bird-best'; }
    load() {
      try {
        const value = Number(this.storage.getItem(this.key));
        return Number.isSafeInteger(value) && value >= 0 ? value : 0;
      } catch { return 0; }
    }
    save(value) {
      try { this.storage.setItem(this.key, String(value)); } catch { /* Private browsers can deny storage; the in-memory best still works. */ }
    }
  }
  Flappy.ScoreStorage = ScoreStorage;
})();
