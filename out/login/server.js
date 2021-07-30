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
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.createTerminateServer = exports.createServer = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const fs = require("fs");
const http = require("http");
const path = require("path");
const querystring_1 = require("querystring");
const url = require("url");
const Constants_1 = require("../utils/Constants");
/*export async function checkRedirectServer(isAdfs: boolean): Promise<boolean> {
    if (isAdfs) {
        return true;
    }
    let timer: NodeJS.Timer | undefined;
    const checkServerPromise = new Promise<boolean>((resolve) => {
        const req: http.ClientRequest = https.get(
            {
                ...url.parse(`${redirectUrlAAD}?state=3333,cccc`),
            },
            (res) => {
                const key: string | undefined = Object.keys(res.headers).find((key) => key.toLowerCase() === "location");
                const location: string | string[] | undefined = key && res.headers[key];
                resolve(res.statusCode === 302 && typeof location === "string" && location.startsWith("http://127.0.0.1:3333/callback"));
            },
        );
        req.on("error", (err) => {
            console.error(err);
            resolve(false);
        });
        req.on("close", () => {
            resolve(false);
        });
        timer = setTimeout(() => {
            resolve(false);
            req.abort();
        }, 5000);
    });
    function cancelTimer() {
        if (timer) {
            clearTimeout(timer);
        }
    }
    checkServerPromise.then(cancelTimer, cancelTimer);
    return checkServerPromise;
}*/
function createServer(nonce) {
    let deferredRedirect;
    const redirectPromise = new Promise((resolve, reject) => (deferredRedirect = { resolve, reject }));
    let deferredCode;
    const codePromise = new Promise((resolve, reject) => (deferredCode = { resolve, reject }));
    const codeTimer = setTimeout(() => {
        deferredCode.reject(new Error("Timeout waiting for code"));
    }, 5 * 60 * 1000);
    function cancelCodeTimer() {
        clearTimeout(codeTimer);
    }
    const server = http.createServer(function (req, res) {
        var _a, _b;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const reqUrl = url.parse(req.url, /* parseQueryString */ true);
        switch (reqUrl.pathname) {
            case "/signin":
                const receivedNonce = (((_b = (_a = reqUrl === null || reqUrl === void 0 ? void 0 : reqUrl.query) === null || _a === void 0 ? void 0 : _a.nonce) === null || _b === void 0 ? void 0 : _b.toString()) || "").replace(/ /g, "+");
                if (receivedNonce === nonce) {
                    deferredRedirect.resolve({ req, res });
                }
                else {
                    const err = new Error("Nonce does not match.");
                    deferredRedirect.resolve({ err, res });
                }
                break;
            case "/":
                //sendFile(res, path.join(__dirname, "../../codeFlowResult/index.html"), "text/html; charset=utf-8");
                sendFile(res, path.join(__filename, "..", "..", "..", "CodeFlowResult", "index.html"), "text/html; charset=utf-8");
                break;
            case "/main.css":
                //sendFile(res, path.join(__dirname, "../../codeFlowResult/main.css"), "text/css; charset=utf-8");
                sendFile(res, path.join(__filename, "..", "..", "..", "CodeFlowResult", "main.css"), "text/css; charset=utf-8");
                break;
            case "/callback":
                deferredCode.resolve(callback(nonce, reqUrl)
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    .then((code) => ({ code, res }), (err) => ({ err, res })));
                break;
            default:
                res.writeHead(404);
                res.end();
                break;
        }
    });
    codePromise.then(cancelCodeTimer, cancelCodeTimer);
    return {
        server,
        redirectPromise,
        codePromise,
    };
}
exports.createServer = createServer;
function createTerminateServer(server) {
    const sockets = {};
    let socketCount = 0;
    server.on("connection", (socket) => {
        const id = socketCount++;
        sockets[id] = socket;
        socket.on("close", () => {
            delete sockets[id];
        });
    });
    return () => __awaiter(this, void 0, void 0, function* () {
        const result = new Promise((resolve) => server.close(resolve));
        for (const id in sockets) {
            sockets[id].destroy();
        }
        return result;
    });
}
exports.createTerminateServer = createTerminateServer;
function startServer(server, adfs) {
    return __awaiter(this, void 0, void 0, function* () {
        let portTimer;
        function cancelPortTimer() {
            clearTimeout(portTimer);
        }
        const portPromise = new Promise((resolve, reject) => {
            portTimer = setTimeout(() => {
                reject(new Error("Timeout waiting for port"));
            }, 5000);
            server.on("listening", () => {
                const address = server.address();
                if (address && typeof address !== "string") {
                    resolve(address.port);
                }
            });
            server.on("error", (err) => {
                reject(err);
            });
            server.on("close", () => {
                reject(new Error("Closed"));
            });
            server.listen(adfs ? Constants_1.portADFS : 0, "127.0.0.1");
        });
        portPromise.then(cancelPortTimer, cancelPortTimer);
        return portPromise;
    });
}
exports.startServer = startServer;
function sendFile(res, filepath, contentType) {
    fs.readFile(filepath, (err, body) => {
        if (err) {
            console.error(err);
        }
        else {
            res.writeHead(200, {
                "Content-Length": body.length,
                "Content-Type": contentType,
            });
            res.end(body);
        }
    });
}
function callback(nonce, reqUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let query;
        let error;
        let code;
        if (reqUrl.query) {
            query = typeof reqUrl.query === "string" ? querystring_1.parse(reqUrl.query) : reqUrl.query;
            error = getQueryProp(query, "error_description") || getQueryProp(query, "error");
            code = getQueryProp(query, "code");
            if (!error) {
                const state = getQueryProp(query, "state");
                const receivedNonce = ((state === null || state === void 0 ? void 0 : state.split(",")[1]) || "").replace(/ /g, "+");
                if (receivedNonce !== nonce) {
                    error = "Nonce does not match.";
                }
            }
        }
        if (!error && code) {
            return code;
        }
        throw new Error(error || "No code received.");
    });
}
function getQueryProp(query, propName) {
    const value = query[propName];
    return typeof value === "string" ? value : "";
}
//# sourceMappingURL=server.js.map