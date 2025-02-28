/**
 * LocalStorageのモック
 */
const store = {};

export const mockLocalStorage = {
  getItem: jest.fn(key => store[key] || null),
  setItem: jest.fn((key, value) => {
    store[key] = value.toString();
  }),
  clear: jest.fn(() => {
    Object.keys(store).forEach(key => {
      delete store[key];
    });
  }),
  removeItem: jest.fn(key => {
    delete store[key];
  }),
  key: jest.fn(index => {
    return Object.keys(store)[index] || null;
  }),
  get length() {
    return Object.keys(store).length;
  }
};
