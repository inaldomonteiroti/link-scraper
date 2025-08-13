import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

global.fetch = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});
