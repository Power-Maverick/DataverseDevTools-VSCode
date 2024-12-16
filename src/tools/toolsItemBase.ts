import * as path from "path";
import * as vscode from "vscode";

export class ToolsItemBase extends vscode.TreeItem {
    constructor(public readonly toolName: string, public readonly authorName: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(toolName, collapsibleState);

        this.tooltip = this.authorName ? `${this.toolName}-${this.authorName}` : `${this.toolName}`;
        this.description = this.authorName;
    }

    iconPath = {
        light: vscode.Uri.file(path.join(__filename, "..", "resources", "light", "generic.svg")),
        dark: vscode.Uri.file(path.join(__filename, "..", "resources", "dark", "generic.svg")),
    };

    //contextValue = this.level === 2 ? "connection" : "connection-child";
}
