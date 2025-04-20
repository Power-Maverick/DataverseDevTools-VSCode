import * as vscode from "vscode";
import * as path from "path";
import { IFlowDefinition } from "../utils/Interfaces";
import { readFileSync } from "../utils/FileSystem";
import _ from "lodash";
import { VsCodePanel } from "./base/VsCodePanelBase";

export class FlowListView extends VsCodePanel {
    private flows?: IFlowDefinition[];

    constructor(entities: IFlowDefinition[], webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "flowlist.html" });
        this.flows = entities;
        // Set the webview's initial html content
        super.update();
    }

    public getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);

        const viewModel = {
            flows: '',
        };

        this.flows?.forEach(element => {

            viewModel.flows += `<tr>`;
            viewModel.flows += `<td>${element.workflowid}</td>`;
            viewModel.flows += `<td><a href=${`command:dvdt.explorer.flows.showFlowDetailsById?%5B%22${element.workflowid}%22%5D`}>${element.name}</a></td>`;
            viewModel.flows += `<td>${element.description ? element.description : '-'}</td>`;
            viewModel.flows += `<td>${element.statecode === 1 ? 'On' : 'Off'}</td>`;
            viewModel.flows += `<td>${element.createdon}</td>`;
            viewModel.flows += `<td>${element.modifiedon}</td>`;

            viewModel.flows += `</tr>`;
        });

        return super.render(compiled(viewModel));
    }
}
