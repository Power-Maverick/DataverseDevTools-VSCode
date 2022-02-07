import * as vscode from "vscode";
import { WebResourceHelper } from "../helpers/webResourceHelper";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { DataverseConnectionDataProvider } from "../trees/dataverseConnectionDataProvider";
import { ICommand } from "../utils/Interfaces";
import { ToolsDataProvider, ToolsTreeItem } from "../tools/toolsDataProvider";

/**
 * This function registers all the commands for Tree Data Provider that are available in the Dataverse DevTools extension.
 * @param vscontext - vscode.ExtensionContext
 */
export function registerTreeDataProviders(vscontext: vscode.ExtensionContext): void {
    const toolsProvider = new ToolsDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("ppToolBox", toolsProvider);
}
