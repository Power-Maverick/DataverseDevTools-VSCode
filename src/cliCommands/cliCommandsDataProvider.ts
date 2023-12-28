import * as path from "path";
import * as vscode from "vscode";
import { ICliCommandList, ICliCommandVerb } from "../utils/Interfaces";
import cliInJson from "./cliCommands.json";
import { CliCommandItemBase } from "./cliCommandsItemBase";

export class CliCommandDataProvider implements vscode.TreeDataProvider<CliCommandTreeItem> {
    private cliCommands: ICliCommandList | undefined;

    constructor(private vscontext: vscode.ExtensionContext) {
        this.cliCommands = cliInJson;
    }

    getTreeItem(element: CliCommandTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: CliCommandTreeItem): vscode.ProviderResult<CliCommandTreeItem[]> {
        //if (config.get("enableEarlyAccessPreview")) {
        if (element) {
            let cliCommandTree: CliCommandTreeItem[] = [];
            const cliExpand = this.cliCommands?.commands.find((c) => c.name === element.label);
            if (cliExpand) {
                cliExpand.verbs?.map((verb) => {
                    cliCommandTree.push(new CliCommandTreeItem(verb.name, verb.help, vscode.TreeItemCollapsibleState.None, 2, cliExpand.name, verb));
                });
            }

            return Promise.resolve(cliCommandTree);
        } else {
            let parentTree: CliCommandTreeItem[] = [];
            this.cliCommands?.commands.map((t) => {
                if (t.name) {
                    parentTree.push(new CliCommandTreeItem(t.name, t.help, vscode.TreeItemCollapsibleState.Collapsed, 1, undefined, undefined));
                }
            });
            return Promise.resolve(parentTree);
        }
        //}
    }

    //#endregion
}

export class CliCommandTreeItem extends CliCommandItemBase {
    constructor(
        public readonly cmdName: string,
        public readonly group: string | undefined,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly level: number,
        public readonly cmd: string | undefined,
        public readonly cmdVerb: ICliCommandVerb | undefined,
    ) {
        super(cmdName, group, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, "..", "resources", "light", this.level === 1 ? "folder.svg" : this.level === 2 ? "cli.svg" : "generic.svg"),
        dark: path.join(__filename, "..", "resources", "dark", this.level === 1 ? "folder.svg" : this.level === 2 ? "cli.svg" : "generic.svg"),
    };

    contextValue = this.level === 2 ? "cli-command" : "cli-group";
}
