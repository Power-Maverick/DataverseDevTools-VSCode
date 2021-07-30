import * as vscode from "vscode";
import { DataverseHelper } from "../helpers/DataverseHelper";
import { DataverseConnectionDataProvider } from "../trees/DataverseConnectionDataProvider";
import { EntitiesDataProvider } from "../trees/EntitiesDataProvider";
import { WebResourcesDataProvider } from "../trees/WebResourcesDataProvider";
import { ICommand } from "../utils/Interfaces";

export function registerTreeDataProviders(vscontext: vscode.ExtensionContext): void {
    const dvHelper = new DataverseHelper(vscontext);

    const dataverseConnProvider = new DataverseConnectionDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("dvConnections", dataverseConnProvider);

    const entityMetadataProvider = new EntitiesDataProvider(vscontext, dvHelper);
    vscode.window.registerTreeDataProvider("dvEntities", entityMetadataProvider);

    const wrProvider = new WebResourcesDataProvider(vscontext, dvHelper);
    vscode.window.registerTreeDataProvider("dvWebResources", wrProvider);

    const cmds: Array<ICommand> = new Array(
        {
            command: "dvExplorer.refreshConnection",
            callback: () => dataverseConnProvider.refresh(),
        },
        {
            command: "dvExplorer.loadEntities",
            callback: () => entityMetadataProvider.refresh(),
        },
        {
            command: "dvExplorer.loadWebResources",
            callback: () => wrProvider.refresh(),
        },
    );
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}
