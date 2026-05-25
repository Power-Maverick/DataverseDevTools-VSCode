import * as fs from "fs";
import * as vscode from "vscode";
import { Panel } from "./base/PanelBase";
import _ = require("lodash");

export class ERDGeneratorView extends Panel {
    private environmentUrl: string;
    private accessToken: string;

    constructor(webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext, environmentUrl: string, accessToken: string) {
        super({
            panel: webview,
            extensionUri: vscontext.extensionUri,
            webViewFileName: "erd-generator", // Not used, we override getHtmlForWebview
            excludeExternalCss: true,
            excludeExternalJs: true,
        });

        this.environmentUrl = environmentUrl;
        this.accessToken = accessToken;

        // Send credentials after webview loads
        setTimeout(() => {
            this.sendCredentials();
        }, 500);

        // Set initial HTML
        super.update();
    }

    private sendCredentials() {
        this.webViewPanel.webview.postMessage({
            command: "setCredentials",
            environmentUrl: this.environmentUrl,
            accessToken: this.accessToken,
        });
    }

    /**
     * Override to load React app instead of template HTML
     */
    getHtmlForWebview(): string {
        // Path to the built React app
        const distPath = vscode.Uri.joinPath(this.panelOptions.extensionUri, "resources", "tools", "erd-generator");

        // Read index.html from the React build
        const indexHtmlPath = vscode.Uri.joinPath(distPath, "index.html");
        let htmlContent = fs.readFileSync(indexHtmlPath.fsPath, "utf-8");

        // Get webview URIs for assets
        const jsUri = this.webViewPanel.webview.asWebviewUri(vscode.Uri.joinPath(distPath, "index.js"));
        const cssUri = this.webViewPanel.webview.asWebviewUri(vscode.Uri.joinPath(distPath, "index.css"));

        // CSP for the webview
        const cspSource = this.webViewPanel.webview.cspSource;
        const cspMeta = `
            <meta http-equiv="Content-Security-Policy" 
                  content="default-src 'none'; 
                           script-src ${cspSource} 'unsafe-inline'; 
                           style-src ${cspSource} 'unsafe-inline'; 
                           connect-src https://*.dynamics.com; 
                           img-src ${cspSource} data: blob:;">
        `;

        // Replace script/css paths with webview URIs
        htmlContent = htmlContent.replace(/src="\/src\/main.tsx"/g, `src="${jsUri}"`).replace("</head>", `<link rel="stylesheet" href="${cssUri}">${cspMeta}</head>`);

        return htmlContent;
    }
}
