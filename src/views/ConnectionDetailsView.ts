import * as vscode from "vscode";
import * as path from "path";
import { IConnection } from "../utils/Interfaces";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");
import { VsCodePanel } from "./base/VsCodePanelBase";

export class ConnectionDetailsView extends VsCodePanel {
    conn?: IConnection;

    constructor(connDetails: IConnection, webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "connectiondetail.html" });
        this.conn = connDetails;
        super.update();
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            connName: this.conn?.connectionName ?? "--",
            connType: this.conn?.environmentType ?? "--",
            envUrl: this.conn?.environmentUrl ?? "--",
            loginType: this.conn?.loginType ?? "--",
            userName: this.conn?.userName ?? "--",
            token: this.conn?.currentAccessToken ?? "--",
            refreshToken: this.conn?.refreshToken ?? "--",
        };

        // if (this._images && this._images.length > 0) {
        //     Object.keys(this._images).forEach((key) => {
        //         //viewModel.images.push(this._images[key]);
        //         (<any>viewModel.images)[key] = this._images.get(key);
        //     });
        // }

        return super.render(compiled(viewModel));
    }
}
