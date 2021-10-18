import * as vscode from "vscode";
import * as path from "path";
import { IConnection, IEntityDefinition, IPanel } from "../utils/Interfaces";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");

export class Panel {
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

        // Handle messages from the webview
        this.webViewPanel.webview.onDidReceiveMessage(({ command, value }) => {
            switch (command) {
                case "alert":
                    if (value) {
                        vscode.window.showInformationMessage(value);
                    }
                    break;
            }
        });
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
                    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
                    <link rel="stylesheet" href="https://static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />

                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
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

        // return `<!DOCTYPE html>
        //         <html lang="en">
        //             <head>
        //                 <!-- Required meta tags -->
        //                 <meta charset="utf-8" />
        //                 <meta name="viewport" content="width=device-width, initial-scale=1" />
        //                 <!-- Bootstrap CSS -->
        //                 <link href="css/base.css" rel="stylesheet" />
        //                 <title>Hello, world!</title>
        //             </head>
        //             <body>
        //                 <h1>Hello, world!</h1>
        //                 <form>
        //                     <div>
        //                         <label for="exampleInputEmail1" class="form-label">Email address</label>
        //                         <input type="email" placeholder="Test" class="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" />
        //                         <div id="emailHelp" class="form-text">We'll never share your email with anyone else.</div>
        //                     </div>
        //                     <div>
        //                         <label for="exampleInputPassword1" class="form-label">Password</label>
        //                         <input type="password" class="form-control" id="exampleInputPassword1" />
        //                     </div>
        //                     <div>
        //                         <input type="checkbox" class="form-check-input" id="exampleCheck1" />
        //                         <label class="form-check-label" for="exampleCheck1">Check me out</label>
        //                     </div>
        //                     <button type="submit" class="btn btn-primary">Submit</button>
        //                 </form>
        //                 <!-- <script src="js/materialize.min.js"></script> -->
        //             </body>
        //         </html>`;
    }

    private getFileUri(...paths: string[]): vscode.Uri {
        const pathOnDisk = vscode.Uri.file(path.join(this.panelOptions.extensionUri.fsPath, ...paths));
        return this.webViewPanel.webview.asWebviewUri(pathOnDisk);
    }
}
