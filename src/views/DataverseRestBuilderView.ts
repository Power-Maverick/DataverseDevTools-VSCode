import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../utils/Interfaces";
import { Panel } from "./base/PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");
import { connectionCurrentStoreKey } from "../utils/Constants";
import { State } from "../utils/State";

export class DataverseRestBuilderView extends Panel {
    constructor(webviewPanel: vscode.WebviewPanel, vscontext: vscode.ExtensionContext, currentAccessToken: string) {
        super({ panel: webviewPanel, extensionUri: vscontext.extensionUri, webViewFileName: "drb.html", excludeExternalCss: true, excludeExternalJs: true });
        super.update();

        if (currentAccessToken) {
            webviewPanel.webview.postMessage({ command: "dvdt_connection", token: currentAccessToken });
        }
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);

        // const requirementJs = this.getFileUri("resources", "views", "js", "drb_custom.js");
        // const customJs = this.getFileUri("resources", "views", "js", "drb_requirements.js");

        const viewModel = {};

        return super.render(compiled(viewModel));
    }
}
