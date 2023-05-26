import * as vscode from "vscode";
import * as path from "path";
import { IEntityDefinition } from "../utils/Interfaces";
import { Panel } from "./PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");

export class EntityDetailsView extends Panel {
    entity?: IEntityDefinition;

    constructor(enDetails: IEntityDefinition, webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "entitydetail.html" });
        this.entity = enDetails;
        // Set the webview's initial html content
        super.update();
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            entityLogicalName: this.entity?.LogicalName ?? "--",
            entitySchemaName: this.entity?.SchemaName ?? "--",
            description: this.entity?.Description.UserLocalizedLabel.Label ?? "--",
            sla: this.entity?.IsSLAEnabled ? "Enabled" : "Disabled",
            entityType: this.entity?.IsActivity ? "Activity" : "Standard",
            objectTypeCode: this.entity?.ObjectTypeCode ?? "--",
            idAttr: this.entity?.PrimaryIdAttribute ?? "--",
            nameAttr: this.entity?.PrimaryNameAttribute ?? "--",
            setName: this.entity?.EntitySetName ?? "--",
            attributes: "",
        };

        if (this.entity?.Attributes && this.entity?.Attributes.value.length > 0) {
            this.entity?.Attributes.value.forEach((a) => {
                viewModel.attributes += `<tr>`;
                viewModel.attributes += `<td>${a.MetadataId}</td>`;
                viewModel.attributes += `<td>${a.LogicalName}</td>`;
                viewModel.attributes += `<td>${a.SchemaName}</td>`;
                viewModel.attributes += `<td>${a.AttributeType}</td>`;
                viewModel.attributes += `<td>${a.AttributeTypeName.Value}</td>`;
                viewModel.attributes += `<td>${a.AttributeOf ? a.AttributeOf : ''}</td>`;
                viewModel.attributes += `<td>${a.RequiredLevel.Value}</td>`;
                viewModel.attributes += `</tr>`;
            });
        }

        return super.render(compiled(viewModel));
    }
}
