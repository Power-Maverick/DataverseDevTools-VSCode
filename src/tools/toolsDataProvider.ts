import * as vscode from "vscode";
import * as path from "path";
import { ITools } from "../utils/Interfaces";
import { ToolsItemBase } from "./toolsItemBase";
import toolsInJson from "./tools.json";

export class ToolsDataProvider implements vscode.TreeDataProvider<ToolsTreeItem> {
    constructor(private vscontext: vscode.ExtensionContext) {}

    getTreeItem(element: ToolsTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: ToolsTreeItem): vscode.ProviderResult<ToolsTreeItem[]> {
        const toolsArray: ITools = toolsInJson;
        let toolsTree: ToolsTreeItem[] = [];

        toolsArray.tools.map((tool) => {
            toolsTree.push(new ToolsTreeItem(tool.toolName, tool.toolShortName, tool.toolAuthor, vscode.TreeItemCollapsibleState.None));
        });

        return Promise.resolve(toolsTree);
    }
}

export class ToolsTreeItem extends ToolsItemBase {
    constructor(public readonly toolName: string, public readonly toolShortName: string, public readonly authorName: string, public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
        super(toolName, authorName, collapsibleState);
    }

    iconPath = {
        light: path.join(
            __filename,
            "..",
            "..",
            "..",
            "resources",
            "toolIcons",
            this.toolShortName === "drb" ? "drb.png" : this.toolShortName === "prt" ? "prt.png" : this.toolShortName === "cmt" ? "cmt.png" : this.toolShortName === "pd" ? "pd.png" : "generic.svg",
        ),
        dark: path.join(
            __filename,
            "..",
            "..",
            "..",
            "resources",
            "toolIcons",
            this.toolShortName === "drb" ? "drb.png" : this.toolShortName === "prt" ? "prt.png" : this.toolShortName === "cmt" ? "cmt.png" : this.toolShortName === "pd" ? "pd.png" : "generic.svg",
        ),
    };
}
