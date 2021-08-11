import * as vscode from "vscode";
import { CLIHelper } from "../helpers/cliHelper";
import { UploadHelper } from "../helpers/uploadHelper";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { TemplateHelper } from "../helpers/templateHelper";
import { TypingsHelper } from "../helpers/typingsHelper";
import { DataverseConnectionTreeItem } from "../trees/dataverseConnectionDataProvider";
import { EntitiesTreeItem } from "../trees/entitiesDataProvider";
import { connectionStatusBarUniqueId, extensionPrefix, fileExtensions } from "../utils/Constants";
import { ICommand, IConnection } from "../utils/Interfaces";
import { ViewBase } from "../views/ViewBase";
import { addConnection } from "./connections";

let dvStatusBarItem: vscode.StatusBarItem;

export async function registerCommands(vscontext: vscode.ExtensionContext): Promise<void> {
    const dvHelper = new DataverseHelper(vscontext);
    const views = new ViewBase(vscontext);
    const cliHelper = new CLIHelper(vscontext);
    const templateHelper = new TemplateHelper(vscontext);
    const uploadHelper = new UploadHelper(vscontext, dvHelper);
    const typingHelper = new TypingsHelper(vscontext, dvHelper);

    dvStatusBarItem = vscode.window.createStatusBarItem(connectionStatusBarUniqueId, vscode.StatusBarAlignment.Left);
    vscontext.subscriptions.push(dvStatusBarItem);

    const cmds: Array<ICommand> = new Array(
        {
            command: "dvdt.explorer.connections.addConnection",
            callback: async () => await addConnection(dvHelper),
        },
        {
            command: "dvdt.explorer.connections.deleteConnection",
            callback: async (connItem: DataverseConnectionTreeItem) => await dvHelper.deleteConnection(connItem),
        },
        {
            command: "dvdt.explorer.connections.openConnection",
            callback: (connItem: DataverseConnectionTreeItem) => dvHelper.openEnvironment(connItem),
        },
        {
            command: "dvdt.explorer.connections.connectDataverse",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                const conn = await dvHelper.connectToDataverse(connItem);
                updateConnectionStatusBar(conn);
            },
        },
        {
            command: "dvdt.explorer.connections.showConnectionDetails",
            callback: async (connItem: DataverseConnectionTreeItem) => await dvHelper.showEnvironmentDetails(connItem, views),
        },
        {
            command: "dvdt.explorer.entities.showEntityDetails",
            callback: async (enItem: EntitiesTreeItem) => await dvHelper.showEntityDetails(enItem, views),
        },
        // {
        //     command: "dvdt.commands.initPlugin",
        //     callback: (uri: vscode.Uri) => cliHelper.initiatePluginProject(uri.fsPath),
        // },
        {
            command: "dvdt.commands.initTS",
            callback: async (uri: vscode.Uri) => await templateHelper.initiateTypeScriptProject(uri.fsPath),
        },
        {
            command: "dvdt.explorer.webresources.uploadWebResource",
            callback: async (uri: vscode.Uri) => await uploadHelper.uploadWebResource(uri.fsPath),
        },
        {
            command: "dvdt.explorer.entities.generateTyping",
            callback: async (enItem: EntitiesTreeItem) => await typingHelper.generateTyping(enItem.desc!),
        },
    );
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });

    updateConnectionStatusBar(await dvHelper.reloadWorkspaceConnection());
    vscode.commands.executeCommand("setContext", `${extensionPrefix}.resourcesExtn`, fileExtensions);
    vscode.commands.executeCommand("setContext", `${extensionPrefix}.linkedResources`, await uploadHelper.getLinkedResourceStrings("@_localFileName"));
}

export function updateConnectionStatusBar(conn: IConnection | undefined): void {
    if (conn) {
        dvStatusBarItem.text = `Connected to: ${conn.environmentUrl}`;
        dvStatusBarItem.show();
    } else {
        dvStatusBarItem.hide();
    }
}
