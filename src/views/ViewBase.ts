import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import { extensionPrefix } from "../utils/Constants";
import { IViewOption } from "../utils/Interfaces";

export class ViewBase {
    public viewOptions: IViewOption | undefined;
    private vscontext: vscode.ExtensionContext;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context: vscode.ExtensionContext) {
        this.vscontext = context;
    }

    public async createTempDirectory() {
        const scratchDirectory = path.join(os.tmpdir(), extensionPrefix);
        const dayjs = require("dayjs");
        const timestamp = dayjs().format("YYYYMMDD");
        const tempDirectory = path.join(scratchDirectory, timestamp);

        const uri = vscode.Uri.file(tempDirectory);
        await vscode.workspace.fs.createDirectory(uri);

        return uri;
    }

    private async copyOutput(tempDirUri: vscode.Uri) {
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
    }

    public async getWebView(view: IViewOption): Promise<vscode.WebviewPanel> {
        const column = vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;

        // // If we already have a panel, show it
        // if (Panel.currentPanel) {
        //     Panel.currentPanel.webViewPanel.reveal(column);
        //     return Panel.currentPanel.webViewPanel;
        // }

        // Otherwise, create a new panel.
        return vscode.window.createWebviewPanel(`${extensionPrefix}.${view.type}`, view.title, column || vscode.ViewColumn.One, getWebviewOptions(this.vscontext.extensionUri));
    }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,
        enableCommandUris: true,

        // And restrict the webview to only loading content from our extension's `test-harness` directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "resources")],
    };
}
