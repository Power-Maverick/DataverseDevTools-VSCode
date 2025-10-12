import * as path from "path";
import * as vscode from "vscode";
import { ITools } from "../utils/Interfaces";
import toolsInJson from "./tools.json";
import { ToolsItemBase } from "./toolsItemBase";

export class ToolsDataProvider implements vscode.TreeDataProvider<ToolsTreeItem> {
    constructor(private vscontext: vscode.ExtensionContext) {}

    getTreeItem(element: ToolsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ToolsTreeItem): vscode.ProviderResult<ToolsTreeItem[]> {
        const toolsArray: ITools = toolsInJson;
        let toolsTree: ToolsTreeItem[] = [];

        toolsArray.tools.map((tool) => {
            toolsTree.push(new ToolsTreeItem(tool.name, tool.shortName, tool.author, vscode.TreeItemCollapsibleState.None, tool.icon));
        });

        return Promise.resolve(toolsTree);
    }
}

export class ToolsTreeItem extends ToolsItemBase {
    constructor(
        public readonly toolName: string,
        public readonly toolShortName: string,
        public readonly authorName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly toolIcon?: string,
    ) {
        super(toolName, authorName, collapsibleState);
    }

    iconPath = {
        light: vscode.Uri.file(path.join(__filename, "..", "resources", "toolIcons", "light", this.toolIcon ?? "generic.svg")),
        dark: vscode.Uri.file(path.join(__filename, "..", "resources", "toolIcons", "dark", this.toolIcon ?? "generic.svg")),
    };
}
