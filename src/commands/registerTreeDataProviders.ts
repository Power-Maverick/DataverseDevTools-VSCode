import * as vscode from "vscode";
import { WebResourceHelper } from "../helpers/webResourceHelper";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { DataverseConnectionDataProvider } from "../trees/dataverseConnectionDataProvider";
import { EntitiesDataProvider } from "../trees/entitiesDataProvider";
import { WebResourcesDataProvider } from "../trees/webResourcesDataProvider";
import { ICommand } from "../utils/Interfaces";

export function registerTreeDataProviders(vscontext: vscode.ExtensionContext): void {
    const dvHelper = new DataverseHelper(vscontext);
    const uploadHelper = new WebResourceHelper(vscontext, dvHelper);

    const dataverseConnProvider = new DataverseConnectionDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("dvConnections", dataverseConnProvider);

    const entityMetadataProvider = new EntitiesDataProvider(vscontext, dvHelper);
    vscode.window.registerTreeDataProvider("dvEntities", entityMetadataProvider);

    const wrProvider = new WebResourcesDataProvider(vscontext, dvHelper, uploadHelper);
    vscode.window.registerTreeDataProvider("dvWebResources", wrProvider);

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
    );
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}
