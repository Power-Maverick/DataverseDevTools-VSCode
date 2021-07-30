"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const registerCommands_1 = require("./commands/registerCommands");
const registerTreeDataProviders_1 = require("./commands/registerTreeDataProviders");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    registerTreeDataProviders_1.registerTreeDataProviders(context);
    registerCommands_1.registerCommands(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map