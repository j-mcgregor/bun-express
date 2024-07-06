"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
var path_to_regexp_1 = require("path-to-regexp");
var App = /** @class */ (function () {
    function App(_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.port, port = _c === void 0 ? Number(process.env.PORT) || 8080 : _c, _d = _b.hostname, hostname = _d === void 0 ? process.env.HOSTNAME || "localhost" : _d, _e = _b.prefix, prefix = _e === void 0 ? "" : _e;
        this.routes = new Map();
        this.port = 8080;
        this.hostname = "localhost";
        this.middleware = new Map();
        this.prefix = "";
        this.routes.set("GET", new Map());
        this.routes.set("POST", new Map());
        this.routes.set("PUT", new Map());
        this.routes.set("PATCH", new Map());
        this.routes.set("DELETE", new Map());
        this.prefix = prefix;
        this.port = port;
        this.hostname = hostname;
    }
    App.prototype.serve = function () {
        var _this = this;
        this.server = Bun.serve({
            port: this.port,
            hostname: this.hostname,
            development: true,
            fetch: function (request, server) { return __awaiter(_this, void 0, void 0, function () {
                var url, methodRoutes, _a, _b, _c, name_1, middleware, response, error_1, e_1_1, _d, methodRoutes_1, methodRoutes_1_1, path, _handler, regex, matched, res, error_2, e_2_1;
                var _e, e_1, _f, _g, _h, e_2, _j, _k;
                return __generator(this, function (_l) {
                    switch (_l.label) {
                        case 0:
                            url = new URL(request.url);
                            methodRoutes = this.routes.get(request.method);
                            if (!methodRoutes) {
                                return [2 /*return*/, Response.json({ message: "Method routes not found" }, { status: 404 })];
                            }
                            _l.label = 1;
                        case 1:
                            _l.trys.push([1, 9, 10, 15]);
                            _a = true, _b = __asyncValues(this.middleware);
                            _l.label = 2;
                        case 2: return [4 /*yield*/, _b.next()];
                        case 3:
                            if (!(_c = _l.sent(), _e = _c.done, !_e)) return [3 /*break*/, 8];
                            _g = _c.value;
                            _a = false;
                            name_1 = _g[0], middleware = _g[1];
                            _l.label = 4;
                        case 4:
                            _l.trys.push([4, 6, , 7]);
                            return [4 /*yield*/, middleware(request, server)];
                        case 5:
                            response = _l.sent();
                            if (!response.ok) {
                                return [2 /*return*/, Response.json(response.data, {
                                        status: response.status,
                                        statusText: response.statusText,
                                    })];
                            }
                            return [3 /*break*/, 7];
                        case 6:
                            error_1 = _l.sent();
                            if (error_1 instanceof Response) {
                                return [2 /*return*/, error_1];
                            }
                            return [2 /*return*/, Response.json({ message: String(error_1) }, { status: 500 })];
                        case 7:
                            _a = true;
                            return [3 /*break*/, 2];
                        case 8: return [3 /*break*/, 15];
                        case 9:
                            e_1_1 = _l.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 15];
                        case 10:
                            _l.trys.push([10, , 13, 14]);
                            if (!(!_a && !_e && (_f = _b.return))) return [3 /*break*/, 12];
                            return [4 /*yield*/, _f.call(_b)];
                        case 11:
                            _l.sent();
                            _l.label = 12;
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 14: return [7 /*endfinally*/];
                        case 15:
                            _l.trys.push([15, 25, 26, 31]);
                            _d = true, methodRoutes_1 = __asyncValues(methodRoutes);
                            _l.label = 16;
                        case 16: return [4 /*yield*/, methodRoutes_1.next()];
                        case 17:
                            if (!(methodRoutes_1_1 = _l.sent(), _h = methodRoutes_1_1.done, !_h)) return [3 /*break*/, 24];
                            _k = methodRoutes_1_1.value;
                            _d = false;
                            path = _k[0], _handler = _k[1];
                            regex = (0, path_to_regexp_1.pathToRegexp)(path);
                            matched = regex.exec(url.pathname);
                            if (!matched) return [3 /*break*/, 22];
                            console.log("regex :>> ", regex);
                            _l.label = 18;
                        case 18:
                            _l.trys.push([18, 20, , 21]);
                            return [4 /*yield*/, _handler(request, server)];
                        case 19:
                            res = _l.sent();
                            return [2 /*return*/, res];
                        case 20:
                            error_2 = _l.sent();
                            if (error_2 instanceof Response) {
                                return [2 /*return*/, error_2];
                            }
                            return [2 /*return*/, Response.json({ message: String(error_2) }, { status: 500 })];
                        case 21: return [3 /*break*/, 23];
                        case 22: return [3 /*break*/, 23];
                        case 23:
                            _d = true;
                            return [3 /*break*/, 16];
                        case 24: return [3 /*break*/, 31];
                        case 25:
                            e_2_1 = _l.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 31];
                        case 26:
                            _l.trys.push([26, , 29, 30]);
                            if (!(!_d && !_h && (_j = methodRoutes_1.return))) return [3 /*break*/, 28];
                            return [4 /*yield*/, _j.call(methodRoutes_1)];
                        case 27:
                            _l.sent();
                            _l.label = 28;
                        case 28: return [3 /*break*/, 30];
                        case 29:
                            if (e_2) throw e_2.error;
                            return [7 /*endfinally*/];
                        case 30: return [7 /*endfinally*/];
                        case 31: return [2 /*return*/, Response.json({ message: "Route not found" }, { status: 404 })];
                    }
                });
            }); },
            websocket: {
                open: function (ws) {
                    var welcomeMessage = "Welcome to the Time Server!!!  Ask 'What's the time' and I will answer.";
                    ws.send(welcomeMessage);
                    console.log("connection opened");
                },
                message: function (ws, message) {
                    console.log("incoming message: ".concat(message));
                    var messageString = typeof message === "string"
                        ? message
                        : new TextDecoder().decode(message);
                    if (messageString.trim().toLowerCase() === "what's the time?") {
                        var currentTime = new Date().toLocaleTimeString();
                        ws.send("The time is ".concat(currentTime));
                        return;
                    }
                    ws.send("i'm just a silly timebot, i can only tell the time");
                },
                close: function (ws) {
                    console.log("connection closed");
                },
            },
        });
        console.log("Listening on ".concat(this.server.hostname, ":").concat(this.server.port));
    };
    App.prototype.socket = function (_a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.port, port = _c === void 0 ? this.port + 1 : _c;
        this.ws = Bun.serve({
            port: port,
            fetch: function (request, server) {
                if (server.upgrade(request)) {
                    return;
                }
                return new Response("Helloooooo World");
            },
            websocket: {
                open: function (ws) {
                    var welcomeMessage = "Welcome to the Time Server!!!  Ask 'What's the time' and I will answer.";
                    ws.send(welcomeMessage);
                    console.log("connection opened");
                },
                message: function (ws, message) {
                    console.log("incoming message: ".concat(message));
                    var messageString = typeof message === "string"
                        ? message
                        : new TextDecoder().decode(message);
                    if (messageString.trim().toLowerCase() === "what's the time?") {
                        var currentTime = new Date().toLocaleTimeString();
                        ws.send("The time is ".concat(currentTime));
                        return;
                    }
                    ws.send("i'm just a silly timebot, i can only tell the time");
                },
                close: function (ws) {
                    console.log("connection closed");
                },
            },
        });
    };
    App.prototype.close = function () {
        var _a;
        (_a = this.server) === null || _a === void 0 ? void 0 : _a.stop(true);
    };
    App.prototype.get = function (path, handler) {
        this.addMethod({ method: "GET", path: path, handler: handler });
    };
    App.prototype.post = function (path, handler) {
        this.addMethod({ method: "POST", path: path, handler: handler });
    };
    App.prototype.put = function (path, handler) {
        this.addMethod({ method: "PUT", path: path, handler: handler });
    };
    App.prototype.patch = function (path, handler) {
        this.addMethod({ method: "PATCH", path: path, handler: handler });
    };
    App.prototype.delete = function (path, handler) {
        this.addMethod({ method: "DELETE", path: path, handler: handler });
    };
    App.prototype.addMethod = function (props) {
        var method = props.method, path = props.path, handler = props.handler;
        if (!method || !path) {
            return;
        }
        var METHOD = this.routes.get(method);
        if (!METHOD) {
            return;
        }
        // create a map to store the handler
        // set the path and handler
        if (this.prefix) {
            METHOD.set("".concat(this.prefix).concat(path), handler);
        }
        else {
            METHOD.set(path, handler);
        }
        // set the METHOD routes
        this.routes.set(method, METHOD);
    };
    App.prototype.use = function (props) {
        var _this = this;
        var method = props.method, path = props.path, handler = props.handler;
        if (!(handler === null || handler === void 0 ? void 0 : handler.length)) {
            return;
        }
        if (method && path) {
            // if method, path and handler, add the handler to the route
            this.addMethod({ method: method, path: path, handler: handler });
            return;
        }
        if (path) {
            // if no method, apply the handler to all routes with the path
            // get the routes
            this.routes.forEach(function (value, key) {
                // get the routes
                value.forEach(function (handler, _path) {
                    // check if the path matches
                    if (path === _path) {
                        // set the handler
                        if (_this.prefix) {
                            value.set("".concat(_this.prefix).concat(path), handler);
                        }
                        else {
                            value.set(path, handler);
                        }
                    }
                });
            });
        }
    };
    App.prototype.setMiddleware = function (middleware) {
        var _this = this;
        middleware.forEach(function (fn) {
            _this.middleware.set(fn.name, fn);
        });
    };
    App.prototype.printRoutes = function () {
        this.routes.forEach(function (routes, method) {
            routes.forEach(function (handler, route) {
                console.log("".concat(method, " ").concat(route));
            });
        });
    };
    return App;
}());
exports.App = App;
