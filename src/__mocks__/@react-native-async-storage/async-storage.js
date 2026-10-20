let store = {};

const AsyncStorage = {
  async getItem(key) {
    return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
  },
  async setItem(key, value) {
    store[key] = String(value);
  },
  async removeItem(key) {
    delete store[key];
  },
  async clear() {
    store = {};
  },
  async multiGet(keys) {
    return keys.map((key) => [
      key,
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    ]);
  },
  async multiSet(pairs) {
    pairs.forEach(([key, value]) => {
      store[key] = String(value);
    });
  },
  async multiRemove(keys) {
    keys.forEach((key) => {
      delete store[key];
    });
  },
};

module.exports = AsyncStorage;
module.exports.default = AsyncStorage;
