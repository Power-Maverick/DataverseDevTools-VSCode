import * as vscode from "vscode";
import * as path from "path";
import { IEntityDefinition, IFlowDefinition } from "../utils/Interfaces";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");
import { VsCodePanel } from "./base/VsCodePanelBase";
import { convertToMermaid } from "../utils/Flow2MermaidConverter";

export class FlowDetailsView extends VsCodePanel {
    flow?: IFlowDefinition;
    mermaid?: string;

    constructor(flowDefinition: IFlowDefinition, webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "flowdetail.html" });
        this.flow = flowDefinition;
        this.mermaid = convertToMermaid(this.flow.clientdata);
        // Set the webview's initial html content
        super.update();
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            id: this.flow?.workflowid ?? "--",
            name: this.flow?.name ?? "--",
            description: this.flow?.description ?? "--",
            createdOn: this.flow?.createdon ?? "--",
            modifiedOn: this.flow?.modifiedon ?? "--",
            json: this.flow?.clientdata ?? "--",
            mermaid: this.mermaid ?? "--",
            mermaidFormated: this.mermaid?.replace(/;/g, ';<br />') ?? "--"
        };

        return super.render(compiled(viewModel));
    }
}

