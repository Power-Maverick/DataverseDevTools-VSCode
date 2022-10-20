import * as vscode from "vscode";
import * as path from "path";
import { IPowerPlatformCLIDetails, IPowerPlatformCLIs } from "../utils/Interfaces";
import { CliCommandItemBase } from "./cliCommandsItemBase";
import cliInJson from "./cliCommands.json";
import { groupBy } from "../utils/ExtensionMethods";

export class CliCommandDataProvider implements vscode.TreeDataProvider<CliCommandTreeItem> {
    private cliCommands: IPowerPlatformCLIs | undefined;

    constructor(private vscontext: vscode.ExtensionContext) {
        this.cliCommands = cliInJson;
    }

    getTreeItem(element: CliCommandTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: CliCommandTreeItem): vscode.ProviderResult<CliCommandTreeItem[]> {
        if (element) {
            // Child
            let cliCommandTree: CliCommandTreeItem[] = [];

            this.cliCommands?.commands.map((cmd) => {
                if (cmd.group === element.label) {
                    cliCommandTree.push(new CliCommandTreeItem(cmd.subcommand, cmd.group, vscode.TreeItemCollapsibleState.None, 2, cmd));
                }
            });
            return Promise.resolve(cliCommandTree);
        } else {
            // Parent
            const results = groupBy(this.cliCommands?.commands!, (c) => c.group);
            const keys = Object.keys(results) as Array<string>;
            let parentTree: CliCommandTreeItem[] = [];

            keys.map((t) => {
                if (results[t]) {
                    parentTree.push(new CliCommandTreeItem(t, undefined, vscode.TreeItemCollapsibleState.Collapsed, 1, undefined));
                }
            });
            return Promise.resolve(parentTree);
        }
    }
}

export class CliCommandTreeItem extends CliCommandItemBase {
    constructor(
        public readonly cmdName: string,
        public readonly group: string | undefined,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly level: number,
        public readonly cliDetails: IPowerPlatformCLIDetails | undefined,
    ) {
        super(cmdName, group, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "folder.svg" : this.level === 2 ? "cli.svg" : "generic.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "folder.svg" : this.level === 2 ? "cli.svg" : "generic.svg"),
    };

    contextValue = this.level === 2 ? "cli-command" : "cli-group";
}
