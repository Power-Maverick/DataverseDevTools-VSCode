import * as vscode from "vscode";
import * as path from "path";
import { IEntityDefinition } from "../utils/Interfaces";
import { Panel } from "./PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ from "lodash";

export class EntityListView extends Panel {
    private entities?: IEntityDefinition[];

    constructor(entities: IEntityDefinition[], webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "entitylist.html" });
        this.entities = entities;
        // Set the webview's initial html content
        super.update();
    }

    public getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);

        const viewModel = {
            entities: '',
        };

        this.entities?.forEach(element => {

            viewModel.entities += `<tr>`;
            viewModel.entities += `<td>${element.MetadataId}</td>`;
            viewModel.entities += `<td>${element.ObjectTypeCode}</td>`;
            viewModel.entities += `<td><a href=${`command:dvdt.explorer.entities.showEntityDetailsByEntityName?%5B%22${element.LogicalName}%22%5D`}>${element.LogicalName}</a></td>`;
            viewModel.entities += `<td>${element.SchemaName}</td>`;
            viewModel.entities += `<td>${element.Description?.UserLocalizedLabel?.Label}</td>`;
            viewModel.entities += `<td>${element.TableType}</td>`;
            viewModel.entities += `<td>${element.HasActivities}</td>`;
            viewModel.entities += `<td>${element.HasNotes}</td>`;
            viewModel.entities += `<td>${element.IsActivity}</td>`;
            viewModel.entities += `<td>${element.IsActivityParty}</td>`;
            viewModel.entities += `<td>${element.IsAuditEnabled?.Value}</td>`;
            viewModel.entities += `<td>${element.IsCustomEntity}</td>`;
            viewModel.entities += `<td>${element.IsCustomizable?.Value}</td>`;
            viewModel.entities += `<td>${element.IsDocumentManagementEnabled}</td>`;
            viewModel.entities += `<td>${element.IsDuplicateDetectionEnabled?.Value}</td>`;
            viewModel.entities += `<td>${element.IsManaged}</td>`;
            viewModel.entities += `<td>${element.OwnershipType}</td>`;

            viewModel.entities += `</tr>`;
        });

        return super.render(compiled(viewModel));
    }
}
