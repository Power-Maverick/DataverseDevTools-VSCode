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

    public async getWebView(view: IViewOption): Promise<vscode.WebviewPanel> {
        const column = vscode.window.activeTextEditor ? vscode.ViewColumn.Beside : vscode.ViewColumn.One;
        return vscode.window.createWebviewPanel(`${extensionPrefix}.${view.type}`, view.title, column || vscode.ViewColumn.One, getWebviewOptions(this.vscontext.extensionUri));
    }
}

function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    return {
        // Enable javascript in the webview
        enableScripts: true,
        enableCommandUris: true,

        // And restrict the webview to only loading content from our extension's directory.
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "resources")],

        // And make sure the view is retained for DRB
        retainContextWhenHidden: true,
    };
}
