import * as vscode from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";
import { CLIHelper } from "../helpers/cliHelper";
import { WebResourceHelper } from "../helpers/webResourceHelper";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { TemplateHelper } from "../helpers/templateHelper";
import { TypingsHelper } from "../helpers/typingsHelper";
import { DataverseConnectionTreeItem } from "../trees/dataverseConnectionDataProvider";
import { EntitiesTreeItem } from "../trees/entitiesDataProvider";
import { connectionStatusBarUniqueId, extensionName, extensionPrefix, fileExtensions, jsConfigFileName, tsConfigFileName } from "../utils/Constants";
import { ICommand, IConnection } from "../utils/Interfaces";
import { ViewBase } from "../views/ViewBase";
import { addConnection } from "./connections";
import { openUri } from "../utils/OpenUri";
import { ErrorHandler } from "../helpers/errorHandler";
import { DRBHelper } from "../helpers/drbHelper";
import { WebResourcesTreeItem } from "../trees/webResourcesDataProvider";
import { ToolsTreeItem } from "../tools/toolsDataProvider";
import { CliCommandTreeItem } from "../cliCommands/cliCommandsDataProvider";

let dvStatusBarItem: vscode.StatusBarItem;

/**
 * This function registers all the commands that are available in the Dataverse DevTools extension.
 * @param vscontext - The extension context.
 * @param {TelemetryReporter} tr - The TelemetryReporter object.
 */
export async function registerCommands(vscontext: vscode.ExtensionContext, tr: TelemetryReporter): Promise<void> {
    const dvHelper = new DataverseHelper(vscontext);
    const views = new ViewBase(vscontext);
    const cliHelper = new CLIHelper(vscontext);
    const templateHelper = new TemplateHelper(vscontext);
    const wrHelper = new WebResourceHelper(vscontext, dvHelper);
    const typingHelper = new TypingsHelper(vscontext, dvHelper);
    const drbHelper = new DRBHelper(vscontext);
    const errorHandler = new ErrorHandler(tr);

    dvStatusBarItem = vscode.window.createStatusBarItem(connectionStatusBarUniqueId, vscode.StatusBarAlignment.Left);
    vscontext.subscriptions.push(dvStatusBarItem);

    validateEnablingOptions();

    const cmds: Array<ICommand> = new Array(
        {
            command: "dvdt.explorer.connections.addConnection",
            callback: async () => {
                try {
                    await addConnection(dvHelper);
                } catch (error) {
                    errorHandler.log(error, "addConnection");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.deleteConnection",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                try {
                    await dvHelper.deleteConnection(connItem);
                } catch (error) {
                    errorHandler.log(error, "deleteConnection");
                }
            },
        },
        {
            command: "dvdt.commands.deleteAllConnections",
            callback: async () => {
                try {
                    await dvHelper.deleteAllConnections();
                } catch (error) {
                    errorHandler.log(error, "deleteAllConnections");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.openConnection",
            callback: (connItem: DataverseConnectionTreeItem) => {
                try {
                    dvHelper.openEnvironment(connItem);
                } catch (error) {
                    errorHandler.log(error, "openConnection");
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
                    errorHandler.log(error, "connectDataverse");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.forgetConnectionOnWorkspace",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                try {
                    dvHelper.forgetCurrentWorkspaceConnection();
                    updateConnectionStatusBar(undefined);
                } catch (error) {
                    errorHandler.log(error, "connectDataverse");
                }
            },
        },
        {
            command: "dvdt.explorer.connections.showConnectionDetails",
            callback: async (connItem: DataverseConnectionTreeItem) => {
                try {
                    await dvHelper.showEnvironmentDetails(connItem, views);
                } catch (error) {
                    errorHandler.log(error, "showConnectionDetails");
                }
            },
        },
        {
            command: "dvdt.explorer.entities.showEntityDetails",
            callback: async (enItem: EntitiesTreeItem) => {
                try {
                    await dvHelper.showEntityDetails(enItem.desc!, views);
                } catch (error) {
                    errorHandler.log(error, "showEntityDetails");
                }
            },
        },
        {
            command: "dvdt.explorer.entities.showEntityDetailsByEntityName",
            callback: async (entityName: string) => {
                try {
                    await dvHelper.showEntityDetails(entityName, views);
                } catch (error) {
                    errorHandler.log(error, "showEntityDetails");
                }
            },
        },
        {
            command: "dvdt.commands.initTS",
            callback: async (uri: vscode.Uri) => {
                try {
                    await templateHelper.initiateTypeScriptProject(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "initTS");
                }
            },
        },
        {
            command: "dvdt.explorer.webresources.uploadWebResource",
            callback: async (uri: vscode.Uri) => {
                try {
                    await wrHelper.uploadWebResource(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "uploadWebResource");
                }
            },
        },
        {
            command: "dvdt.explorer.entities.generateTyping",
            callback: async (enItem: EntitiesTreeItem) => {
                try {
                    await typingHelper.generateTyping(enItem.desc!);
                } catch (error) {
                    errorHandler.log(error, "generateTyping");
                }
            },
        },
        {
            command: "dvdt.explorer.webresources.smartMatch",
            callback: async () => {
                try {
                    await wrHelper.smartMatchWebResources(views);
                } catch (error) {
                    errorHandler.log(error, "smartMatch");
                }
            },
        },
        {
            command: "dvdt.commands.createTSFile",
            callback: async (uri: vscode.Uri) => {
                try {
                    await templateHelper.addTypeScriptFile(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "createTSFile");
                }
            },
        },
        {
            command: "dvdt.explorer.webresources.compareWebResource",
            callback: async (uri: vscode.Uri) => {
                try {
                    await wrHelper.compareWebResources(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "compareWebResource");
                }
            },
        },
        {
            command: "dvdt.commands.openDRB",
            callback: async () => {
                try {
                    drbHelper.openDRB(views);
                } catch (error) {
                    errorHandler.log(error, "openDRB");
                }
            },
        },
        {
            command: "dvdt.commands.launchPRT",
            callback: async () => {
                try {
                    cliHelper.launchPRT();
                } catch (error) {
                    errorHandler.log(error, "launchPRT");
                }
            },
        },
        {
            command: "dvdt.commands.launchCMT",
            callback: async () => {
                try {
                    cliHelper.launchCMT();
                } catch (error) {
                    errorHandler.log(error, "launchCMT");
                }
            },
        },
        {
            command: "dvdt.commands.launchPD",
            callback: async () => {
                try {
                    cliHelper.launchPD();
                } catch (error) {
                    errorHandler.log(error, "launchPD");
                }
            },
        },
        {
            command: "dvdt.explorer.webresources.linkExistingWebResource",
            callback: async (uri: vscode.Uri) => {
                try {
                    await wrHelper.linkWebResource(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "linkExistingWebResource");
                }
            },
        },
        {
            command: "dvdt.explorer.tools.launchTool",
            callback: async (toolItem: ToolsTreeItem) => {
                try {
                    switch (toolItem.toolShortName) {
                        case "drb":
                            drbHelper.openDRB(views);
                            break;
                        case "prt":
                            cliHelper.launchPRT();
                            break;
                        case "cmt":
                            cliHelper.launchCMT();
                            break;
                        case "pd":
                            cliHelper.launchPD();
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    errorHandler.log(error, "launchTool");
                }
            },
        },
        {
            command: "dvdt.explorer.cli.executeCommand",
            callback: async (cliItem: CliCommandTreeItem) => {
                try {
                    cliHelper.executeCliCommand(cliItem);
                } catch (error) {
                    errorHandler.log(error, "launchTool");
                }
            },
        },
        {
            command: "dvdt.commands.initJS",
            callback: async (uri: vscode.Uri) => {
                try {
                    await templateHelper.initiateJavaScriptProject(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "initJS");
                }
            },
        },
        {
            command: "dvdt.commands.createJSFile",
            callback: async (uri: vscode.Uri) => {
                try {
                    await templateHelper.addJavaScriptFile(uri.fsPath);
                } catch (error) {
                    errorHandler.log(error, "createJSFile");
                }
            },
        },
    );
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });

    updateConnectionStatusBar(await dvHelper.reloadWorkspaceConnection());
    vscode.commands.executeCommand("setContext", `${extensionPrefix}.linkedResources`, await wrHelper.getLinkedResourceStrings("@_localFileName"));
}

/**
 * Update the status bar with the current connection.
 * @param {IConnection | undefined} conn - The connection object.
 */
export function updateConnectionStatusBar(conn: IConnection | undefined): void {
    if (conn) {
        dvStatusBarItem.text = conn.userName ? `Connected to: ${conn.environmentUrl} as ${conn.userName}` : `Connected to: ${conn.environmentUrl}`;
        dvStatusBarItem.show();
    } else {
        dvStatusBarItem.hide();
    }
}

/**
 * This function validates enabling or disabling options for DVDT
 */
export async function validateEnablingOptions() {
    try {
        const folder = vscode.workspace.workspaceFolders?.[0];

        if (folder) {
            const patternTS = new vscode.RelativePattern(folder, `**/${tsConfigFileName}`);
            const filesTS = await vscode.workspace.findFiles(patternTS, "{node_modules,out}", 1);

            if (filesTS.length > 0) {
                await vscode.commands.executeCommand("setContext", `${extensionPrefix}.isTSProject`, true);
            }

            const patternJS = new vscode.RelativePattern(folder, `**/${jsConfigFileName}`);
            const filesJS = await vscode.workspace.findFiles(patternJS, "{node_modules,out}", 1);

            if (filesJS.length > 0) {
                await vscode.commands.executeCommand("setContext", `${extensionPrefix}.isJSProject`, true);
            }
        }
    } catch (e) { }
}
