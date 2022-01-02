import * as vscode from "vscode";
import { State } from "../utils/State";
import { DataverseRestBuilderView } from "../views/DataverseRestBuilderView";
import { ViewBase } from "../views/ViewBase";

export class DRBHelper {
    private vsstate: State;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {
        this.vsstate = new State(vscontext);
    }

    public async openDRB(view: ViewBase): Promise<void> {
        const webview = await view.getWebView({ type: "openDRB", title: "Dataverse REST Builder" });
        new DataverseRestBuilderView(webview, this.vscontext);
    }
}
