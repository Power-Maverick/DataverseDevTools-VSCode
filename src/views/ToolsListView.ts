import * as vscode from "vscode";
import * as path from "path";
import { IToolDetails } from "../utils/Interfaces";
import { readFileSync } from "../utils/FileSystem";
import _ from "lodash";
import { VsCodePanel } from "./base/VsCodePanelBase";
import toolsInJson from "../tools/tools.json";

export class ToolsListView extends VsCodePanel {
    private tools: IToolDetails[];

    constructor(webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "toolslist.html" });
        this.tools = toolsInJson.tools;
        // Set the webview's initial html content
        super.update();

        // Set up message listener for launching tools
        this.webViewPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'launchTool':
                        vscode.commands.executeCommand('dvdt.commands.launchToolByShortName', message.toolShortName);
                        return;
                }
            }
        );
    }

    public getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);

        const viewModel = {
            tools: this.tools.map(tool => {
                const escapedToolName = _.escape(tool.toolName);
                const escapedShortName = _.escape(tool.toolShortName);
                const escapedAuthor = _.escape(tool.toolAuthor);
                return `<tr>
                    <td>${escapedToolName}</td>
                    <td>${escapedShortName}</td>
                    <td>${escapedAuthor}</td>
                    <td><button class="btn" onclick="launchTool('${escapedShortName}')">Launch</button></td>
                </tr>`;
            }).join(''),
        };

        return super.render(compiled(viewModel));
    }
}
