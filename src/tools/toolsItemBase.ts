import * as vscode from "vscode";
import * as path from "path";

export class ToolsItemBase extends vscode.TreeItem {
    constructor(public readonly toolName: string, public readonly shortDesc: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(toolName, collapsibleState);

        this.tooltip = this.shortDesc ? `${this.toolName}-${this.shortDesc}` : `${this.toolName}`;
        this.description = this.shortDesc;
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", "generic.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", "generic.svg"),
    };

    //contextValue = this.level === 2 ? "connection" : "connection-child";
}
