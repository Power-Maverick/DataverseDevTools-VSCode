import * as vscode from "vscode";
import { ToolsTreeItem } from "../tools/toolsDataProvider";
import { connectionCurrentStoreKey } from "../utils/Constants";
import { ErrorMessages } from "../utils/ErrorMessages";
import { IConnection } from "../utils/Interfaces";
import { State } from "../utils/State";
import { DataverseRestBuilderView } from "../views/DataverseRestBuilderView";
import { ERDGeneratorView } from "../views/ERDGeneratorView";
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
        this.launchToolByShortName(toolItem.toolShortName, cliHelper, views);
    }

    public launchToolByShortName(shortName: string, cliHelper: CLIHelper, views: ViewBase) {
        switch (shortName) {
            case "drb":
                this.openDRB(views);
                break;
            case "erd":
                this.openERDGenerator(views);
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

    public async openERDGenerator(view: ViewBase): Promise<void> {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);

        if (connFromWS && connFromWS.currentAccessToken) {
            const webview = await view.getWebView({
                type: "erdGenerator",
                title: "ERD Generator",
            });

            new ERDGeneratorView(webview, this.vscontext, connFromWS.environmentUrl, connFromWS.currentAccessToken);
        } else {
            vscode.window.showErrorMessage("No active Dataverse connection. Please connect first.");
        }
    }
}
