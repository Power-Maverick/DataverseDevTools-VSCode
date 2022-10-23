import * as vscode from "vscode";
import * as path from "path";

export class CliCommandItemBase extends vscode.TreeItem {
    constructor(public readonly label: string, public readonly desc: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);

        this.tooltip = this.label;
        this.description = this.desc;
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", "generic.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", "generic.svg"),
    };

    //contextValue = this.level === 2 ? "connection" : "connection-child";
}
