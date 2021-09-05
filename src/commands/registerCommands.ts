import * as vscode from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";
import { CLIHelper } from "../helpers/cliHelper";
import { UploadHelper } from "../helpers/uploadHelper";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { TemplateHelper } from "../helpers/templateHelper";
import { TypingsHelper } from "../helpers/typingsHelper";
import { DataverseConnectionTreeItem } from "../trees/dataverseConnectionDataProvider";
import { EntitiesTreeItem } from "../trees/entitiesDataProvider";
import { connectionStatusBarUniqueId, extensionName, extensionPrefix, fileExtensions } from "../utils/Constants";
import { ICommand, IConnection } from "../utils/Interfaces";
import { ViewBase } from "../views/ViewBase";
import { addConnection } from "./connections";
import { openUri } from "../utils/OpenUri";

let dvStatusBarItem: vscode.StatusBarItem;
let reporter: TelemetryReporter;

export async function registerCommands(vscontext: vscode.ExtensionContext, tr: TelemetryReporter): Promise<void> {
    reporter = tr;
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
            callback: async () => {
                try {
                    await addConnection(dvHelper);
                } catch (error) {
                    handleErrors(error, "addConnection");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.deleteConnection",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                try {
                    await dvHelper.deleteConnection(connItem);
                } catch (error) {
                    handleErrors(error, "deleteConnection");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.openConnection",
            callback: (connItem: DataverseConnectionTreeItem) => {
                try {
                    dvHelper.openEnvironment(connItem);
                } catch (error) {
                    handleErrors(error, "openConnection");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.connectDataverse",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                try {
                    const conn = await dvHelper.connectToDataverse(connItem);
                    updateConnectionStatusBar(conn);
                } catch (error) {
                    handleErrors(error, "connectDataverse");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.showConnectionDetails",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                try {
                    await dvHelper.showEnvironmentDetails(connItem, views);
                } catch (error) {
                    handleErrors(error, "showConnectionDetails");
                }
            },
        },
        {
            command: "dvdt.explorer.entities.showEntityDetails",
            callback: async (enItem: EntitiesTreeItem) => {
                try {
                    await dvHelper.showEntityDetails(enItem, views);
                } catch (error) {
                    handleErrors(error, "showEntityDetails");
                }
            },
        },
        // {
        //     command: "dvdt.commands.initPlugin",
        //     callback: (uri: vscode.Uri) => cliHelper.initiatePluginProject(uri.fsPath),
        // },
        {
            command: "dvdt.commands.initTS",
            callback: async (uri: vscode.Uri) => {
                try {
                    await templateHelper.initiateTypeScriptProject(uri.fsPath);
                } catch (error) {
                    handleErrors(error, "initTS");
                }
            },
        },
        {
            command: "dvdt.explorer.webresources.uploadWebResource",
            callback: async (uri: vscode.Uri) => {
                try {
                    await uploadHelper.uploadWebResource(uri.fsPath);
                } catch (error) {
                    handleErrors(error, "uploadWebResource");
                }
            },
        },
        {
            command: "dvdt.explorer.entities.generateTyping",
            callback: async (enItem: EntitiesTreeItem) => {
                try {
                    await typingHelper.generateTyping(enItem.desc!);
                } catch (error) {
                    handleErrors(error, "generateTyping");
                }
            },
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

export function handleErrors(err: any, cmd: string) {
    const btnLogError: vscode.MessageItem = { title: "Log error on GitHub" };
    vscode.window
        .showErrorMessage(`${extensionName}: Error occured. Please report it on GitHub with the activity you tried to perform along with Date & Time.`, btnLogError)
        .then(async (result: vscode.MessageItem | undefined) => {
            if (result === btnLogError) {
                await openUri("https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/new/choose");
            }
        });
    reporter.sendTelemetryException(err, { command: cmd });
}
