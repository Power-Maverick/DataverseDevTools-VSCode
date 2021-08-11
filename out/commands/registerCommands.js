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
const cliHelper_1 = require("../helpers/cliHelper");
const uploadHelper_1 = require("../helpers/uploadHelper");
const dataverseHelper_1 = require("../helpers/dataverseHelper");
const templateHelper_1 = require("../helpers/templateHelper");
const typingsHelper_1 = require("../helpers/typingsHelper");
const Constants_1 = require("../utils/Constants");
const ViewBase_1 = require("../views/ViewBase");
const connections_1 = require("./connections");
let dvStatusBarItem;
function registerCommands(vscontext) {
    return __awaiter(this, void 0, void 0, function* () {
        const dvHelper = new dataverseHelper_1.DataverseHelper(vscontext);
        const views = new ViewBase_1.ViewBase(vscontext);
        const cliHelper = new cliHelper_1.CLIHelper(vscontext);
        const templateHelper = new templateHelper_1.TemplateHelper(vscontext);
        const uploadHelper = new uploadHelper_1.UploadHelper(vscontext, dvHelper);
        const typingHelper = new typingsHelper_1.TypingsHelper(vscontext, dvHelper);
        dvStatusBarItem = vscode.window.createStatusBarItem(Constants_1.connectionStatusBarUniqueId, vscode.StatusBarAlignment.Left);
        vscontext.subscriptions.push(dvStatusBarItem);
        const cmds = new Array({
            command: "dvdt.explorer.connections.addConnection",
            callback: () => __awaiter(this, void 0, void 0, function* () { return yield connections_1.addConnection(dvHelper); }),
        }, {
            command: "dvdt.explorer.connections.deleteConnection",
            callback: (connItem) => __awaiter(this, void 0, void 0, function* () { return yield dvHelper.deleteConnection(connItem); }),
        }, {
            command: "dvdt.explorer.connections.openConnection",
            callback: (connItem) => dvHelper.openEnvironment(connItem),
        }, {
            command: "dvdt.explorer.connections.connectDataverse",
            callback: (connItem) => __awaiter(this, void 0, void 0, function* () {
                const conn = yield dvHelper.connectToDataverse(connItem);
                updateConnectionStatusBar(conn);
            }),
        }, {
            command: "dvdt.explorer.connections.showConnectionDetails",
            callback: (connItem) => __awaiter(this, void 0, void 0, function* () { return yield dvHelper.showEnvironmentDetails(connItem, views); }),
        }, {
            command: "dvdt.explorer.entities.showEntityDetails",
            callback: (enItem) => __awaiter(this, void 0, void 0, function* () { return yield dvHelper.showEntityDetails(enItem, views); }),
        }, 
        // {
        //     command: "dvdt.commands.initPlugin",
        //     callback: (uri: vscode.Uri) => cliHelper.initiatePluginProject(uri.fsPath),
        // },
        {
            command: "dvdt.commands.initTS",
            callback: (uri) => __awaiter(this, void 0, void 0, function* () { return yield templateHelper.initiateTypeScriptProject(uri.fsPath); }),
        }, {
            command: "dvdt.explorer.webresources.uploadWebResource",
            callback: (uri) => __awaiter(this, void 0, void 0, function* () { return yield uploadHelper.uploadWebResource(uri.fsPath); }),
        }, {
            command: "dvdt.explorer.entities.generateTyping",
            callback: (enItem) => __awaiter(this, void 0, void 0, function* () { return yield typingHelper.generateTyping(enItem.desc); }),
        });
        cmds.forEach((c) => {
            vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
        });
        updateConnectionStatusBar(yield dvHelper.reloadWorkspaceConnection());
        vscode.commands.executeCommand("setContext", `${Constants_1.extensionPrefix}.resourcesExtn`, Constants_1.fileExtensions);
        vscode.commands.executeCommand("setContext", `${Constants_1.extensionPrefix}.linkedResources`, yield uploadHelper.getLinkedResourceStrings("@_localFileName"));
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