import * as vscode from "vscode";
import { ToolsTreeItem } from "../tools/toolsDataProvider";
import { connectionCurrentStoreKey } from "../utils/Constants";
import { ErrorMessages } from "../utils/ErrorMessages";
import { IConnection } from "../utils/Interfaces";
import { State } from "../utils/State";
import { DataverseRestBuilderView } from "../views/DataverseRestBuilderView";
import { ViewBase } from "../views/ViewBase";
import { CLIHelper } from "./cliHelper";

export class ToolsHelper {
    private vsstate: State;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {
        this.vsstate = new State(vscontext);
    }

    public openTool(toolItem: ToolsTreeItem) {
        const views = new ViewBase(this.vscontext);
        const cliHelper = new CLIHelper(this.vscontext);

        switch (toolItem.toolShortName) {
            case "drb":
                this.openDRB(views);
                break;
            // case "erd":
            //     this.openERDGenerator();
            //     break;
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
    }

    public async openDRB(view: ViewBase): Promise<void> {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        if (connFromWS && connFromWS.currentAccessToken) {
            const webview = await view.getWebView({ type: "openDRB", title: "Dataverse REST Builder" });
            new DataverseRestBuilderView(webview, this.vscontext, connFromWS.currentAccessToken);
        } else {
            vscode.window.showErrorMessage(ErrorMessages.drbConnectionError);
        }
    }

    // public openERDGenerator(): void {
    //     const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
    //     if (connFromWS && connFromWS.currentAccessToken) {
    //         showERDPanel(this.vscontext.extensionUri, connFromWS.environmentUrl, connFromWS.currentAccessToken);
    //     } else {
    //         vscode.window.showErrorMessage(ErrorMessages.commonToolsError);
    //     }
    // }
}
