const path = require("path");
process.env.NODE_ENV = "test";
process.env.NODE_PATH = path.join(__dirname, "node_modules");
require("module").Module._initPaths();

process.env.JWT_SECRET = "test_secret";

jest.mock(
  "jsonwebtoken",
  () => ({
    verify: jest.fn().mockReturnValue({ userId: 1 }),
    sign: jest.fn().mockReturnValue("mock_token"),
  }),
  { virtual: true }
);

jest.mock(
  "bcryptjs",
  () => ({
    hash: jest.fn().mockResolvedValue("hashed_password"),
    compare: jest.fn().mockResolvedValue(true),
  }),
  { virtual: true }
);

jest.mock(
  "axios",
  () => ({
    get: jest.fn(),
  }),
  { virtual: true }
);

jest.mock(
  "cheerio",
  () => ({
    load: jest.fn(),
  }),
  { virtual: true }
);

global.expect = expect;
global.jest = jest;
global.describe = describe;
global.it = it;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

global.ReadableStream = class ReadableStream {
  constructor() {}
  getReader() {
    return {
      read: () => Promise.resolve({ done: true, value: undefined }),
      releaseLock: () => {},
    };
  }
};

global.WritableStream = class WritableStream {
  constructor() {}
  getWriter() {
    return {
      write: () => Promise.resolve(),
      close: () => Promise.resolve(),
      abort: () => Promise.resolve(),
      releaseLock: () => {},
    };
  }
};

global.TransformStream = class TransformStream {
  constructor() {
    this.readable = new global.ReadableStream();
    this.writable = new global.WritableStream();
  }
};

global.TextEncoder = class TextEncoder {
  encode(str) {
    return Buffer.from(str);
  }
};

global.TextDecoder = class TextDecoder {
  decode(buf) {
    return buf.toString();
  }
};

if (typeof window === "undefined") {
  global.window = global;
}

beforeEach(() => {
  jest.clearAllMocks();

  const jwt = require("jsonwebtoken");
  const bcrypt = require("bcryptjs");

  process.env.JWT_SECRET = "test_secret";
});
