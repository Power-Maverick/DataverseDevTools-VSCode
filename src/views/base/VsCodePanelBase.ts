import * as vscode from "vscode";
import * as path from "path";
import { IConnection, IEntityDefinition, IPanel } from "../../utils/Interfaces";
import { readFileSync } from "../../utils/FileSystem";
import _ = require("lodash");

export class VsCodePanel {
    // public static currentPanel: Panel | undefined;
    public readonly webViewPanel: vscode.WebviewPanel;
    private disposables: vscode.Disposable[] = [];
    conn?: IConnection;
    entity?: IEntityDefinition;

    constructor(public panelOptions: IPanel) {
        this.webViewPanel = panelOptions.panel;
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this.webViewPanel.onDidDispose(() => this.dispose(), null, this.disposables);

        this.webViewPanel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'showInfo':
                        vscode.window.showInformationMessage(message.text);
                        return;
                }
            }
        );

        // Update the content based on view changes
        this.webViewPanel.onDidChangeViewState(
            (e) => {
                if (this.webViewPanel.visible) {
                    this.update();
                }
            },
            null,
            this.disposables,
        );
    }

    public dispose() {
        // Panel.currentPanel = undefined;

        // Clean up our resources
        this.webViewPanel.dispose();

        while (this.disposables.length) {
            const x = this.disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    update() {
        this.webViewPanel.webview.html = this.getHtmlForWebview(this.panelOptions.webViewFileName);
    }

    render(htmlPartial: string) {
        const baseCss = this.getFileUri("resources", "views", "css", "base.css");
        const baseJs = this.getFileUri("resources", "views", "js", "base.js");

        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="stylesheet" type="text/css" href="${baseCss}" />
                    
                    ${this.panelOptions.excludeExternalJs
                ? ""
                : ` <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                    <script src="https://unpkg.com/tableexport.jquery.plugin/tableExport.min.js"></script>`
            }
                </head>
                <body>
                    <div class="main-container">
                        ${htmlPartial}
                    </div>                    
                    <script src="${baseJs}"></script>
                </body>
                </html>`;
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!@([\s\S]+?)/g;
        const compiled = _.template(fileHtml);
        const viewModel = {};

        // if (this._images && this._images.length > 0) {
        //     Object.keys(this._images).forEach((key) => {
        //         //viewModel.images.push(this._images[key]);
        //         (<any>viewModel.images)[key] = this._images.get(key);
        //     });
        // }

        return this.render(compiled(viewModel));
    }

    public getFileUri(...paths: string[]): vscode.Uri {
        const pathOnDisk = vscode.Uri.file(path.join(this.panelOptions.extensionUri.fsPath, ...paths));
        return this.webViewPanel.webview.asWebviewUri(pathOnDisk);
    }
}
