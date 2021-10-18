import * as vscode from "vscode";
import * as path from "path";
import { ISmartMatchRecord } from "../utils/Interfaces";
import { Panel } from "./PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");

export class SmartMatchView extends Panel {
    smartMatches?: ISmartMatchRecord[];

    constructor(matches: ISmartMatchRecord[], webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "smartmatch.html" });
        this.smartMatches = matches;
        // Set the webview's initial html content
        super.update();
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            matches: "",
        };

        if (this.smartMatches && this.smartMatches.length > 0) {
            this.smartMatches.forEach((a) => {
                viewModel.matches += `<tr>`;
                viewModel.matches += `<td>${a.wrId}</td>`;
                viewModel.matches += `<td>${a.wrDisplayName}</td>`;
                viewModel.matches += `<td>${a.localFileName}</td>`;
                viewModel.matches += `<td>${a.wrPath}</td>`;
                viewModel.matches += `<td>${a.localFilePath}</td>`;
                viewModel.matches += `<td>${a.confidenceLevel}</td>`;
                viewModel.matches += `<td><i class="material-icons">cancel</i></td>`;
                viewModel.matches += `</tr>`;
            });
        }

        return super.render(compiled(viewModel));
    }
}
