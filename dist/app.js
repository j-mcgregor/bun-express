var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true
      });
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/path-to-regexp/dist/index.js
var require_dist = __commonJS((exports) => {
  var lexer = function(str) {
    const chars = [...str];
    const tokens = [];
    let i = 0;
    while (i < chars.length) {
      const value = chars[i];
      const type = SIMPLE_TOKENS[value];
      if (type) {
        tokens.push({ type, index: i++, value });
        continue;
      }
      if (value === "\\") {
        tokens.push({ type: "ESCAPED", index: i++, value: chars[i++] });
        continue;
      }
      if (value === ":") {
        let name = "";
        while (ID_CHAR.test(chars[++i])) {
          name += chars[i];
        }
        if (!name) {
          throw new TypeError(`Missing parameter name at ${i}`);
        }
        tokens.push({ type: "NAME", index: i, value: name });
        continue;
      }
      if (value === "(") {
        const pos = i++;
        let count = 1;
        let pattern = "";
        if (chars[i] === "?") {
          throw new TypeError(`Pattern cannot start with "?" at ${i}`);
        }
        while (i < chars.length) {
          if (chars[i] === "\\") {
            pattern += chars[i++] + chars[i++];
            continue;
          }
          if (chars[i] === ")") {
            count--;
            if (count === 0) {
              i++;
              break;
            }
          } else if (chars[i] === "(") {
            count++;
            if (chars[i + 1] !== "?") {
              throw new TypeError(`Capturing groups are not allowed at ${i}`);
            }
          }
          pattern += chars[i++];
        }
        if (count)
          throw new TypeError(`Unbalanced pattern at ${pos}`);
        if (!pattern)
          throw new TypeError(`Missing pattern at ${pos}`);
        tokens.push({ type: "PATTERN", index: i, value: pattern });
        continue;
      }
      tokens.push({ type: "CHAR", index: i, value: chars[i++] });
    }
    tokens.push({ type: "END", index: i, value: "" });
    return new Iter(tokens);
  };
  var parse = function(str, options = {}) {
    const { delimiter = DEFAULT_DELIMITER, encodePath = NOOP_VALUE } = options;
    const tokens = [];
    const it = lexer(str);
    let key = 0;
    do {
      const path = it.text();
      if (path)
        tokens.push(encodePath(path));
      const name = it.tryConsume("NAME");
      const pattern = it.tryConsume("PATTERN");
      if (name || pattern) {
        tokens.push({
          name: name || String(key++),
          pattern
        });
        const next = it.peek();
        if (next.type === "*") {
          throw new TypeError(`Unexpected * at ${next.index}, you probably want \`/*\` or \`{/:foo}*\`: https://git.new/pathToRegexpError`);
        }
        continue;
      }
      const asterisk = it.tryConsume("*");
      if (asterisk) {
        tokens.push({
          name: String(key++),
          pattern: `[^${escape(delimiter)}]*`,
          modifier: "*",
          separator: delimiter
        });
        continue;
      }
      const open = it.tryConsume("{");
      if (open) {
        const prefix = it.text();
        const name2 = it.tryConsume("NAME");
        const pattern2 = it.tryConsume("PATTERN");
        const suffix = it.text();
        const separator = it.tryConsume(";") ? it.text() : prefix + suffix;
        it.consume("}");
        const modifier = it.modifier();
        tokens.push({
          name: name2 || (pattern2 ? String(key++) : ""),
          prefix: encodePath(prefix),
          suffix: encodePath(suffix),
          pattern: pattern2,
          modifier,
          separator
        });
        continue;
      }
      it.consume("END");
      break;
    } while (true);
    return new TokenData(tokens, delimiter);
  };
  var compile = function(path, options = {}) {
    const data = path instanceof TokenData ? path : parse(path, options);
    return compileTokens(data, options);
  };
  var tokenToFunction = function(token, encode) {
    if (typeof token === "string") {
      return () => token;
    }
    const encodeValue = encode || NOOP_VALUE;
    const repeated = token.modifier === "+" || token.modifier === "*";
    const optional = token.modifier === "?" || token.modifier === "*";
    const { prefix = "", suffix = "", separator = "" } = token;
    if (encode && repeated) {
      const stringify2 = (value, index) => {
        if (typeof value !== "string") {
          throw new TypeError(`Expected "${token.name}/${index}" to be a string`);
        }
        return encodeValue(value);
      };
      const compile2 = (value) => {
        if (!Array.isArray(value)) {
          throw new TypeError(`Expected "${token.name}" to be an array`);
        }
        if (value.length === 0)
          return "";
        return prefix + value.map(stringify2).join(separator) + suffix;
      };
      if (optional) {
        return (data) => {
          const value = data[token.name];
          if (value == null)
            return "";
          return value.length ? compile2(value) : "";
        };
      }
      return (data) => {
        const value = data[token.name];
        return compile2(value);
      };
    }
    const stringify = (value) => {
      if (typeof value !== "string") {
        throw new TypeError(`Expected "${token.name}" to be a string`);
      }
      return prefix + encodeValue(value) + suffix;
    };
    if (optional) {
      return (data) => {
        const value = data[token.name];
        if (value == null)
          return "";
        return stringify(value);
      };
    }
    return (data) => {
      const value = data[token.name];
      return stringify(value);
    };
  };
  var compileTokens = function(data, options) {
    const { encode = encodeURIComponent, loose = true, validate = true } = options;
    const reFlags = flags(options);
    const stringify = toStringify(loose, data.delimiter);
    const keyToRegexp = toKeyRegexp(stringify, data.delimiter);
    const encoders = data.tokens.map((token) => {
      const fn = tokenToFunction(token, encode);
      if (!validate || typeof token === "string")
        return fn;
      const pattern = keyToRegexp(token);
      const validRe = new RegExp(`^${pattern}\$`, reFlags);
      return (data2) => {
        const value = fn(data2);
        if (!validRe.test(value)) {
          throw new TypeError(`Invalid value for "${token.name}": ${JSON.stringify(value)}`);
        }
        return value;
      };
    });
    return function path(data2 = {}) {
      let path = "";
      for (const encoder of encoders)
        path += encoder(data2);
      return path;
    };
  };
  var match = function(path, options = {}) {
    const { decode = decodeURIComponent, loose = true } = options;
    const data = path instanceof TokenData ? path : parse(path, options);
    const stringify = toStringify(loose, data.delimiter);
    const keys = [];
    const re = tokensToRegexp(data, keys, options);
    const decoders = keys.map((key) => {
      if (decode && (key.modifier === "+" || key.modifier === "*")) {
        const re2 = new RegExp(stringify(key.separator || ""), "g");
        return (value) => value.split(re2).map(decode);
      }
      return decode || NOOP_VALUE;
    });
    return function match(pathname) {
      const m = re.exec(pathname);
      if (!m)
        return false;
      const { 0: path2, index } = m;
      const params = Object.create(null);
      for (let i = 1;i < m.length; i++) {
        if (m[i] === undefined)
          continue;
        const key = keys[i - 1];
        const decoder = decoders[i - 1];
        params[key.name] = decoder(m[i]);
      }
      return { path: path2, index, params };
    };
  };
  var escape = function(str) {
    return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  };
  var looseReplacer = function(value, loose) {
    return loose ? `${escape(value)}+` : escape(value);
  };
  var toStringify = function(loose, delimiter) {
    if (!loose)
      return escape;
    const re = new RegExp(`[^${escape(delimiter)}]+|(.)`, "g");
    return (value) => value.replace(re, looseReplacer);
  };
  var flags = function(options) {
    return options.sensitive ? "" : "i";
  };
  var tokensToRegexp = function(data, keys, options) {
    const { trailing = true, start = true, end = true, loose = true } = options;
    const stringify = toStringify(loose, data.delimiter);
    const keyToRegexp = toKeyRegexp(stringify, data.delimiter);
    let pattern = start ? "^" : "";
    for (const token of data.tokens) {
      if (typeof token === "string") {
        pattern += stringify(token);
      } else {
        if (token.name)
          keys.push(token);
        pattern += keyToRegexp(token);
      }
    }
    if (trailing)
      pattern += `(?:${stringify(data.delimiter)})?`;
    pattern += end ? "$" : `(?=${escape(data.delimiter)}|\$)`;
    return new RegExp(pattern, flags(options));
  };
  var toKeyRegexp = function(stringify, delimiter) {
    const segmentPattern = `[^${escape(delimiter)}]+?`;
    return (key) => {
      const prefix = key.prefix ? stringify(key.prefix) : "";
      const suffix = key.suffix ? stringify(key.suffix) : "";
      const modifier = key.modifier || "";
      if (key.name) {
        const pattern = key.pattern || segmentPattern;
        if (key.modifier === "+" || key.modifier === "*") {
          const mod = key.modifier === "*" ? "?" : "";
          const split = key.separator ? stringify(key.separator) : "";
          return `(?:${prefix}((?:${pattern})(?:${split}(?:${pattern}))*)${suffix})${mod}`;
        }
        return `(?:${prefix}(${pattern})${suffix})${modifier}`;
      }
      return `(?:${prefix}${suffix})${modifier}`;
    };
  };
  var pathToRegexp = function(path, options = {}) {
    const data = path instanceof TokenData ? path : parse(path, options);
    const keys = [];
    const regexp = tokensToRegexp(data, keys, options);
    return Object.assign(regexp, { keys });
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.pathToRegexp = exports.match = exports.compile = exports.parse = exports.TokenData = undefined;
  var DEFAULT_DELIMITER = "/";
  var NOOP_VALUE = (value) => value;
  var ID_CHAR = /^\p{XID_Continue}$/u;
  var SIMPLE_TOKENS = {
    "!": "!",
    "@": "@",
    ";": ";",
    ",": ",",
    "*": "*",
    "+": "+",
    "?": "?",
    "{": "{",
    "}": "}"
  };

  class Iter {
    constructor(tokens) {
      this.tokens = tokens;
      this.index = 0;
    }
    peek() {
      return this.tokens[this.index];
    }
    tryConsume(type) {
      const token = this.peek();
      if (token.type !== type)
        return;
      this.index++;
      return token.value;
    }
    consume(type) {
      const value = this.tryConsume(type);
      if (value !== undefined)
        return value;
      const { type: nextType, index } = this.peek();
      throw new TypeError(`Unexpected ${nextType} at ${index}, expected ${type}: https://git.new/pathToRegexpError`);
    }
    text() {
      let result = "";
      let value;
      while (value = this.tryConsume("CHAR") || this.tryConsume("ESCAPED")) {
        result += value;
      }
      return result;
    }
    modifier() {
      return this.tryConsume("?") || this.tryConsume("*") || this.tryConsume("+") || "";
    }
  }

  class TokenData {
    constructor(tokens, delimiter) {
      this.tokens = tokens;
      this.delimiter = delimiter;
    }
  }
  exports.TokenData = TokenData;
  exports.parse = parse;
  exports.compile = compile;
  exports.match = match;
  exports.pathToRegexp = pathToRegexp;
});

// src/app.ts
var import_path_to_regexp = __toESM(require_dist(), 1);

class App {
  routes = new Map;
  port = 8080;
  hostname = "localhost";
  ws;
  server;
  middleware = new Map;
  prefix = "";
  constructor({
    port = Number(process.env.PORT) || 8080,
    hostname = process.env.HOSTNAME || "localhost",
    prefix = ""
  } = {}) {
    this.routes.set("GET", new Map);
    this.routes.set("POST", new Map);
    this.routes.set("PUT", new Map);
    this.routes.set("PATCH", new Map);
    this.routes.set("DELETE", new Map);
    this.prefix = prefix;
    this.port = port;
    this.hostname = hostname;
  }
  serve() {
    this.server = Bun.serve({
      port: this.port,
      hostname: this.hostname,
      development: true,
      fetch: async (request, server) => {
        const url = new URL(request.url);
        const methodRoutes = this.routes.get(request.method);
        if (!methodRoutes) {
          return Response.json({ message: "Method routes not found" }, { status: 404 });
        }
        for await (const [name, middleware] of this.middleware) {
          try {
            const response = await middleware(request, server);
            if (!response.ok) {
              return Response.json(response.data, {
                status: response.status,
                statusText: response.statusText
              });
            }
          } catch (error) {
            if (error instanceof Response) {
              return error;
            }
            return Response.json({ message: String(error) }, { status: 500 });
          }
        }
        for await (const [path, _handler] of methodRoutes) {
          const regex = import_path_to_regexp.pathToRegexp(path);
          const matched = regex.exec(url.pathname);
          if (matched) {
            console.log("regex :>> ", regex);
            try {
              const res = await _handler(request, server);
              return res;
            } catch (error) {
              if (error instanceof Response) {
                return error;
              }
              return Response.json({ message: String(error) }, { status: 500 });
            }
          } else {
            continue;
          }
        }
        return Response.json({ message: "Route not found" }, { status: 404 });
      },
      websocket: {
        open(ws) {
          const welcomeMessage = "Welcome to the Time Server!!!  Ask 'What's the time' and I will answer.";
          ws.send(welcomeMessage);
          console.log("connection opened");
        },
        message(ws, message) {
          console.log(`incoming message: ${message}`);
          const messageString = typeof message === "string" ? message : new TextDecoder().decode(message);
          if (messageString.trim().toLowerCase() === "what's the time?") {
            const currentTime = new Date().toLocaleTimeString();
            ws.send(`The time is ${currentTime}`);
            return;
          }
          ws.send("i'm just a silly timebot, i can only tell the time");
        },
        close(ws) {
          console.log("connection closed");
        }
      }
    });
    console.log(`Listening on ${this.server.hostname}:${this.server.port}`);
  }
  socket({ port = this.port + 1 } = {}) {
    this.ws = Bun.serve({
      port,
      fetch(request, server) {
        if (server.upgrade(request)) {
          return;
        }
        return new Response("Helloooooo World");
      },
      websocket: {
        open(ws) {
          const welcomeMessage = "Welcome to the Time Server!!!  Ask 'What's the time' and I will answer.";
          ws.send(welcomeMessage);
          console.log("connection opened");
        },
        message(ws, message) {
          console.log(`incoming message: ${message}`);
          const messageString = typeof message === "string" ? message : new TextDecoder().decode(message);
          if (messageString.trim().toLowerCase() === "what's the time?") {
            const currentTime = new Date().toLocaleTimeString();
            ws.send(`The time is ${currentTime}`);
            return;
          }
          ws.send("i'm just a silly timebot, i can only tell the time");
        },
        close(ws) {
          console.log("connection closed");
        }
      }
    });
  }
  close() {
    this.server?.stop(true);
  }
  get(path, handler) {
    this.addMethod({ method: "GET", path, handler });
  }
  post(path, handler) {
    this.addMethod({ method: "POST", path, handler });
  }
  put(path, handler) {
    this.addMethod({ method: "PUT", path, handler });
  }
  patch(path, handler) {
    this.addMethod({ method: "PATCH", path, handler });
  }
  delete(path, handler) {
    this.addMethod({ method: "DELETE", path, handler });
  }
  addMethod(props) {
    const { method, path, handler } = props;
    if (!method || !path) {
      return;
    }
    const METHOD = this.routes.get(method);
    if (!METHOD) {
      return;
    }
    if (this.prefix) {
      METHOD.set(`${this.prefix}${path}`, handler);
    } else {
      METHOD.set(path, handler);
    }
    this.routes.set(method, METHOD);
  }
  use(props) {
    const { method, path, handler } = props;
    if (!handler?.length) {
      return;
    }
    if (method && path) {
      this.addMethod({ method, path, handler });
      return;
    }
    if (path) {
      this.routes.forEach((value, key) => {
        value.forEach((handler2, _path) => {
          if (path === _path) {
            if (this.prefix) {
              value.set(`${this.prefix}${path}`, handler2);
            } else {
              value.set(path, handler2);
            }
          }
        });
      });
    }
  }
  setMiddleware(middleware) {
    middleware.forEach((fn) => {
      this.middleware.set(fn.name, fn);
    });
  }
  printRoutes() {
    this.routes.forEach((routes, method) => {
      routes.forEach((handler, route) => {
        console.log(`${method} ${route}`);
      });
    });
  }
}
export {
  App
};
