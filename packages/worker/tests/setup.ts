if (typeof global.ReadableStream === "undefined") {
  (global as any).ReadableStream = class ReadableStream {
    constructor() {}
    getReader() {
      return {
        read: () => Promise.resolve({ done: true, value: undefined }),
        releaseLock: () => {},
      };
    }
  };
}

if (typeof global.WritableStream === "undefined") {
  (global as any).WritableStream = class WritableStream {
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
}

if (typeof global.TransformStream === "undefined") {
  (global as any).TransformStream = class TransformStream {
    readable: any;
    writable: any;

    constructor() {
      this.readable = new (global as any).ReadableStream();
      this.writable = new (global as any).WritableStream();
    }
  };
}

if (typeof global.TextEncoder === "undefined") {
  (global as any).TextEncoder = class TextEncoder {
    encode(str: string) {
      return Buffer.from(str);
    }
  };
}

if (typeof global.TextDecoder === "undefined") {
  (global as any).TextDecoder = class TextDecoder {
    decode(buf: Buffer) {
      return buf.toString();
    }
  };
}

if (typeof global.window === "undefined") {
  global.window = global as any;
}

if (typeof global.URL === "undefined") {
  global.URL = require("url").URL;
}
