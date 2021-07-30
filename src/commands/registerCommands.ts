import * as vscode from "vscode";
import { CLIHelper } from "../helpers/CLIHelper";
import { DataverseHelper } from "../helpers/DataverseHelper";
import { DataverseConnectionTreeItem } from "../trees/DataverseConnectionDataProvider";
import { EntitiesTreeItem } from "../trees/EntitiesDataProvider";
import { connectionStatusBarUniqueId } from "../utils/Constants";
import { ICommand, IConnection } from "../utils/Interfaces";
import { ViewBase } from "../views/ViewBase";
import { addConnection } from "./connections";

let dvStatusBarItem: vscode.StatusBarItem;

export function registerCommands(vscontext: vscode.ExtensionContext): void {
    const dvHelper = new DataverseHelper(vscontext);
    const views = new ViewBase(vscontext);
    const cliHelper = new CLIHelper(vscontext);

    dvStatusBarItem = vscode.window.createStatusBarItem(connectionStatusBarUniqueId, vscode.StatusBarAlignment.Left);
    vscontext.subscriptions.push(dvStatusBarItem);

    const cmds: Array<ICommand> = new Array(
        {
            command: "dvExplorer.addConnection",
            callback: async () => await addConnection(dvHelper),
        },
        {
            command: "dvExplorer.deleteConnection",
            callback: async (connItem: DataverseConnectionTreeItem) => await dvHelper.deleteConnection(connItem),
        },
        {
            command: "dvExplorer.openConnection",
            callback: (connItem: DataverseConnectionTreeItem) => dvHelper.openEnvironment(connItem),
        },
        {
            command: "dvExplorer.connectDataverse",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                const conn = await dvHelper.connectToDataverse(connItem);
                updateConnectionStatusBar(conn);
            },
        },
        {
            command: "dvExplorer.showConnectionDetails",
            callback: async (connItem: DataverseConnectionTreeItem) => await dvHelper.showEnvironmentDetails(connItem, views),
        },
        {
            command: "dvExplorer.showEntityDetails",
            callback: async (enItem: EntitiesTreeItem) => await dvHelper.showEntityDetails(enItem, views),
        },
        {
            command: "dvExplorer.initPlugin",
            callback: (uri: vscode.Uri) => cliHelper.initiatePluginProject(uri.fsPath),
        },
    );
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}

export function updateConnectionStatusBar(conn: IConnection | undefined): void {
    if (conn) {
        dvStatusBarItem.text = `Connected to: ${conn.environmentUrl}`;
        dvStatusBarItem.show();
    } else {
        dvStatusBarItem.hide();
    }
}
