"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataverseConnectionTreeItem = void 0;
const vscode = require("vscode");
const path = require("path");
class DataverseConnectionTreeItem extends vscode.TreeItem {
    constructor(label, desc, collapsibleState, level, command) {
        super(label, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.collapsibleState = collapsibleState;
        this.level = level;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "connection-type.svg" : this.level === 2 ? "connection.svg" : this.level === 3 ? "connection-details.svg" : "generic.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "connection-type.svg" : this.level === 2 ? "connection.svg" : this.level === 3 ? "connection-details.svg" : "generic.svg"),
        };
        this.contextValue = this.level === 2 ? "connection" : "connection-child";
        this.tooltip = this.desc ? `${this.label}-${this.desc}` : `${this.label}`;
        this.description = this.desc;
    }
}
exports.DataverseConnectionTreeItem = DataverseConnectionTreeItem;
//# sourceMappingURL=DataverseConnectionTreeItem.js.map