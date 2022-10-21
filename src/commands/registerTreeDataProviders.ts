import * as vscode from "vscode";
import { WebResourceHelper } from "../helpers/webResourceHelper";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { DataverseConnectionDataProvider } from "../trees/dataverseConnectionDataProvider";
import { EntitiesDataProvider } from "../trees/entitiesDataProvider";
import { WebResourcesDataProvider } from "../trees/webResourcesDataProvider";
import { ICommand } from "../utils/Interfaces";
import { ToolsDataProvider } from "../tools/toolsDataProvider";
import { CliCommandDataProvider } from "../cliCommands/cliCommandsDataProvider";

/**
 * This function registers all the commands for Tree Data Provider that are available in the Dataverse DevTools extension.
 * @param vscontext - vscode.ExtensionContext
 */
export function registerTreeDataProviders(vscontext: vscode.ExtensionContext): void {
    const dvHelper = new DataverseHelper(vscontext);
    const uploadHelper = new WebResourceHelper(vscontext, dvHelper);

    const dataverseConnProvider = new DataverseConnectionDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("dvConnections", dataverseConnProvider);

    const entityMetadataProvider = new EntitiesDataProvider(vscontext, dvHelper);
    vscode.window.registerTreeDataProvider("dvEntities", entityMetadataProvider);

    const wrProvider = new WebResourcesDataProvider(vscontext, dvHelper, uploadHelper);
    vscode.window.registerTreeDataProvider("dvWebResources", wrProvider);

    const toolsProvider = new ToolsDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("ppToolBox", toolsProvider);

    const cliProvider = new CliCommandDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("ppCLICommands", cliProvider);

    const cmds: Array<ICommand> = new Array(
        {
            command: "dvdt.explorer.connections.refreshConnection",
            callback: () => dataverseConnProvider.refresh(),
        },
        {
            command: "dvdt.explorer.entities.loadEntities",
            callback: () => entityMetadataProvider.refresh(),
        },
        {
            command: "dvdt.explorer.entities.filteron",
            callback: () => entityMetadataProvider.filter(),
        },
        {
            command: "dvdt.explorer.entities.filteroff",
            callback: () => entityMetadataProvider.filter(),
        },
        {
            command: "dvdt.explorer.webresources.loadWebResources",
            callback: () => wrProvider.refresh(),
        },
        {
            command: "dvdt.explorer.webresources.filteron",
            callback: () => wrProvider.filter(),
        },
        {
            command: "dvdt.explorer.webresources.filteroff",
            callback: () => wrProvider.filter(),
        },
        {
            command: "dvdt.explorer.entities.searchon",
            callback: () => entityMetadataProvider.search(),
        },
        {
            command: "dvdt.explorer.entities.searchoff",
            callback: () => entityMetadataProvider.search(),
        },
        {
            command: "dvdt.explorer.webresources.searchon",
            callback: () => wrProvider.search(),
        },
        {
            command: "dvdt.explorer.webresources.searchoff",
            callback: () => wrProvider.search(),
        },
    );
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}
