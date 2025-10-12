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
                const escapedToolName = _.escape(tool.name);
                const escapedShortName = _.escape(tool.shortName);
                const escapedAuthor = _.escape(tool.author);
                const escapedDescription = _.escape(tool.description || 'No description available');
                const toolIcon = tool.emoji || '🔨';
                
                return `<div class="tool-card" onclick="launchTool('${escapedShortName}')">
                    <div class="tool-card-header">
                        <div class="tool-icon">${toolIcon}</div>
                        <div class="tool-info">
                            <h3 class="tool-name">${escapedToolName}</h3>
                            <p class="tool-author">by ${escapedAuthor}</p>
                        </div>
                    </div>
                    <p class="tool-description">${escapedDescription}</p>
                    <div class="tool-footer">
                        <span class="tool-tag">${escapedShortName}</span>
                        <button class="tool-launch-btn" onclick="event.stopPropagation(); launchTool('${escapedShortName}')">
                            <span>▶</span> Launch
                        </button>
                    </div>
                </div>`;
            }).join(''),
        };

        return super.render(compiled(viewModel));
    }
}
