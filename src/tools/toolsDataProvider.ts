import * as vscode from "vscode";
import * as path from "path";
import { ITools } from "../utils/Interfaces";
import { ToolsItemBase } from "./toolsItemBase";
import toolsInJson from "./tools.json";

export class ToolsDataProvider implements vscode.TreeDataProvider<ToolsTreeItem> {
    constructor(private vscontext: vscode.ExtensionContext) {}

    onDidChangeTreeData?: vscode.Event<void | ToolsTreeItem | null | undefined> | undefined;

    getTreeItem(element: ToolsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ToolsTreeItem): vscode.ProviderResult<ToolsTreeItem[]> {
        const toolsArray: ITools = toolsInJson;
        let toolsTree: ToolsTreeItem[] = [];

        toolsArray.tools.map((tool) => {
            toolsTree.push(new ToolsTreeItem(tool.toolName, tool.toolAuthor, vscode.TreeItemCollapsibleState.None));
        });

        return Promise.resolve(toolsTree);
    }
}

export class ToolsTreeItem extends ToolsItemBase {
    constructor(public readonly toolName: string, public readonly shortDesc: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(toolName, shortDesc, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "toolIcons", this.toolName === "drb" ? "drb.png" : "generic.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "toolIcons", this.toolName === "drb" ? "drb.ong" : "generic.svg"),
    };
}
