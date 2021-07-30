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
exports.ViewBase = void 0;
const vscode = require("vscode");
const os = require("os");
const path = require("path");
const Constants_1 = require("../utils/Constants");
class ViewBase {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context) {
        this.vscontext = context;
    }
    createTempDirectory() {
        return __awaiter(this, void 0, void 0, function* () {
            const scratchDirectory = path.join(os.tmpdir(), Constants_1.extensionPrefix);
            const dayjs = require("dayjs");
            const timestamp = dayjs().format("YYYYMMDD");
            const tempDirectory = path.join(scratchDirectory, timestamp);
            const uri = vscode.Uri.file(tempDirectory);
            yield vscode.workspace.fs.createDirectory(uri);
            return uri;
        });
    }
    copyOutput(tempDirUri) {
        return __awaiter(this, void 0, void 0, function* () {
            // vscode.window.withProgress(
            //     {
            //         cancellable: false,
            //         location: vscode.ProgressLocation.Notification,
            //         title: "Copying necessary files",
            //     },
            //     async () => {
            //         if (store.controlName) {
            //             if (vscode.workspace.workspaceFolders && tempDirUri) {
            //                 const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
            //                 await vscode.workspace.fs.copy(vscode.Uri.joinPath(workspaceFolder, "out", "controls", store.controlName), vscode.Uri.joinPath(tempDirUri, ""), { overwrite: true });
            //                 // Copy required files & folders
            //                 const libFolderUri = vscode.Uri.joinPath(this.vscontext.extensionUri, "bundle", "lib");
            //                 const harnessJsUri = vscode.Uri.joinPath(this.vscontext.extensionUri, "bundle", "harness.js");
            //                 const locFolderUri = vscode.Uri.joinPath(this.vscontext.extensionUri, "bundle", "loc");
            //                 if (vscode.workspace.workspaceFolders) {
            //                     await vscode.workspace.fs.copy(locFolderUri, vscode.Uri.joinPath(tempDirUri, "loc"), { overwrite: true });
            //                     await vscode.workspace.fs.copy(libFolderUri, vscode.Uri.joinPath(tempDirUri, "lib"), { overwrite: true });
            //                     await vscode.workspace.fs.copy(harnessJsUri, vscode.Uri.joinPath(tempDirUri, "harness.js"), { overwrite: true });
            //                 }
            //                 this.ShowWebView(tempDirUri);
            //             }
            //         } else {
            //             vscode.window.showErrorMessage("Unable to identify control name.");
            //         }
            //     },
            // );
        });
    }
    getWebView(view) {
        return __awaiter(this, void 0, void 0, function* () {
            const column = vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
            // // If we already have a panel, show it
            // if (Panel.currentPanel) {
            //     Panel.currentPanel.webViewPanel.reveal(column);
            //     return Panel.currentPanel.webViewPanel;
            // }
            // Otherwise, create a new panel.
            return vscode.window.createWebviewPanel(`${Constants_1.extensionPrefix}.${view.type}`, view.title, column || vscode.ViewColumn.One, getWebviewOptions(this.vscontext.extensionUri));
        });
    }
}
exports.ViewBase = ViewBase;
function getWebviewOptions(extensionUri) {
    return {
        // Enable javascript in the webview
        enableScripts: true,
        enableCommandUris: true,
        // And restrict the webview to only loading content from our extension's `test-harness` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "resources")],
    };
}
//# sourceMappingURL=ViewBase.js.map