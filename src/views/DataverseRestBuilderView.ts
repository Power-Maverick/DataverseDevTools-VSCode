import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../utils/Interfaces";
import { Panel } from "./PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");
import { connectionCurrentStoreKey } from "../utils/Constants";
import { State } from "../utils/State";

export class DataverseRestBuilderView extends Panel {
    private vsstate: State;

    constructor(webviewPanel: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webviewPanel, extensionUri: vscontext.extensionUri, webViewFileName: "drb.html", excludeExternalCss: true, excludeExternalJs: true });
        super.update();

        this.vsstate = new State(vscontext);
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        if (connFromWS) {
            webviewPanel.webview.postMessage({ command: "connection", text: "this is a test", token: connFromWS.currentAccessToken, url: connFromWS.environmentUrl, version: "1.0" });
        }
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);

        const requirementJs = this.getFileUri("resources", "views", "js", "drb_custom.js");
        const customJs = this.getFileUri("resources", "views", "js", "drb_requirements.js");

        const viewModel = {
            drbVersion: "1.0.0.10",
            requirementJs: requirementJs,
            customJs: customJs,
        };

        return super.render(compiled(viewModel));
    }
}
