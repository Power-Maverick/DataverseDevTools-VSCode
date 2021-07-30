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
exports.updateConnectionStatusBar = exports.registerCommands = void 0;
const vscode = require("vscode");
const CLIHelper_1 = require("../helpers/CLIHelper");
const DataverseHelper_1 = require("../helpers/DataverseHelper");
const Constants_1 = require("../utils/Constants");
const ViewBase_1 = require("../views/ViewBase");
const connections_1 = require("./connections");
let dvStatusBarItem;
function registerCommands(vscontext) {
    const dvHelper = new DataverseHelper_1.DataverseHelper(vscontext);
    const views = new ViewBase_1.ViewBase(vscontext);
    const cliHelper = new CLIHelper_1.CLIHelper(vscontext);
    dvStatusBarItem = vscode.window.createStatusBarItem(Constants_1.connectionStatusBarUniqueId, vscode.StatusBarAlignment.Left);
    vscontext.subscriptions.push(dvStatusBarItem);
    const cmds = new Array({
        command: "dvExplorer.addConnection",
        callback: () => __awaiter(this, void 0, void 0, function* () { return yield connections_1.addConnection(dvHelper); }),
    }, {
        command: "dvExplorer.deleteConnection",
        callback: (connItem) => __awaiter(this, void 0, void 0, function* () { return yield dvHelper.deleteConnection(connItem); }),
    }, {
        command: "dvExplorer.openConnection",
        callback: (connItem) => dvHelper.openEnvironment(connItem),
    }, {
        command: "dvExplorer.connectDataverse",
        callback: (connItem) => __awaiter(this, void 0, void 0, function* () {
            const conn = yield dvHelper.connectToDataverse(connItem);
            updateConnectionStatusBar(conn);
        }),
    }, {
        command: "dvExplorer.showConnectionDetails",
        callback: (connItem) => __awaiter(this, void 0, void 0, function* () { return yield dvHelper.showEnvironmentDetails(connItem, views); }),
    }, {
        command: "dvExplorer.showEntityDetails",
        callback: (enItem) => __awaiter(this, void 0, void 0, function* () { return yield dvHelper.showEntityDetails(enItem, views); }),
    }, {
        command: "dvExplorer.initPlugin",
        callback: (uri) => cliHelper.initiatePluginProject(uri.fsPath),
    });
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}
exports.registerCommands = registerCommands;
function updateConnectionStatusBar(conn) {
    if (conn) {
        dvStatusBarItem.text = `Connected to: ${conn.environmentUrl}`;
        dvStatusBarItem.show();
    }
    else {
        dvStatusBarItem.hide();
    }
}
exports.updateConnectionStatusBar = updateConnectionStatusBar;
//# sourceMappingURL=registerCommands.js.map