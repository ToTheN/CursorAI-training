/** Jest stub — avoids ESM in @react-native-async-storage/async-storage. */
const memory = new Map();

module.exports = {
  __esModule: true,
  default: {
    getItem: jest.fn((key) => Promise.resolve(memory.get(String(key)) ?? null)),
    setItem: jest.fn((key, value) => {
      memory.set(String(key), String(value));
      return Promise.resolve();
    }),
    removeItem: jest.fn((key) => {
      memory.delete(String(key));
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      memory.clear();
      return Promise.resolve();
    }),
  },
};
