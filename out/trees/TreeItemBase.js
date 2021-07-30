"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItemBase = void 0;
const vscode = require("vscode");
const path = require("path");
class TreeItemBase extends vscode.TreeItem {
    constructor(label, desc, collapsibleState) {
        super(label, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.collapsibleState = collapsibleState;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", "generic.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", "generic.svg"),
        };
        this.tooltip = this.desc ? `${this.label}-${this.desc}` : `${this.label}`;
        this.description = this.desc;
    }
}
exports.TreeItemBase = TreeItemBase;
//# sourceMappingURL=TreeItemBase.js.map