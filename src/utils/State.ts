import * as vscode from "vscode";

export class State {
    private vscontext: vscode.ExtensionContext;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context: vscode.ExtensionContext) {
        this.vscontext = context;
    }

    public saveInGlobal(key: string, value: any) {
        this.vscontext.globalState.update(key, value);
    }

    public saveInWorkspace(key: string, value: any) {
        this.vscontext.workspaceState.update(key, value);
    }

    public getFromGlobal(key: string): any | undefined {
        return this.vscontext.globalState.get(key);
    }

    public getFromWorkspace(key: string): any | undefined {
        return this.vscontext.workspaceState.get(key);
    }

    public unsetFromGlobal(key: string) {
        this.vscontext.globalState.update(key, undefined);
    }

    public unsetFromWorkspace(key: string) {
        this.vscontext.workspaceState.update(key, undefined);
    }
}
