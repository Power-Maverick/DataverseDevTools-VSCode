import * as path from "path";
import * as vscode from "vscode";

export class TreeItemBase extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly desc: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);

        this.tooltip = this.desc ? `${this.label}-${this.desc}` : `${this.label}`;
        this.description = this.desc;
    }

    iconPath = {
        light: vscode.Uri.file(path.join(__filename, "..", "resources", "light", "generic.svg")),
        dark: vscode.Uri.file(path.join(__filename, "..", "resources", "dark", "generic.svg")),
    };

    //contextValue = this.level === 2 ? "connection" : "connection-child";
}
