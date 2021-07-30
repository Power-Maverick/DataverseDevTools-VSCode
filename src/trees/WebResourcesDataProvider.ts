import * as vscode from "vscode";
import * as path from "path";
import { State } from "../utils/State";
import { wrDefinitionsStoreKey } from "../utils/Constants";
import { IStore, IWebResource, IWebResources } from "../utils/Interfaces";
import { observable } from "mobx";
import { TreeItemBase } from "./TreeItemBase";
import { DataverseHelper } from "../helpers/DataverseHelper";

export class WebResourcesDataProvider implements vscode.TreeDataProvider<WebResourcesTreeItem> {
    private refreshTreeData: vscode.EventEmitter<WebResourcesTreeItem | undefined | void> = new vscode.EventEmitter<WebResourcesTreeItem | undefined | void>();
    private webResource: IWebResource[] = [];

    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {}

    refresh(): void {
        this.populateWebResources();
        this.refreshTreeData.fire();
    }

    getTreeItem(element: WebResourcesTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WebResourcesTreeItem): Promise<WebResourcesTreeItem[]> {
        if (!element) {
            // Parent
            return Promise.resolve(
                this.webResource
                    .sort((e1, e2) => {
                        if (e1.displayname > e2.displayname) {
                            return 1;
                        }
                        if (e1.displayname < e2.displayname) {
                            return -1;
                        }
                        return 0;
                    })
                    .map((e) => new WebResourcesTreeItem(e.displayname, e.name, vscode.TreeItemCollapsibleState.None)),
            );
        }
        return Promise.resolve([]);
    }

    private populateWebResources() {
        const vsstate = new State(this.vscontext);
        const jsonConn: IWebResources = vsstate.getFromWorkspace(wrDefinitionsStoreKey);
        if (jsonConn) {
            this.webResource = jsonConn.value;
        } else {
            this.webResource = [];
        }
    }

    readonly onDidChangeTreeData: vscode.Event<WebResourcesTreeItem | undefined | void> = this.refreshTreeData.event;
}

export class WebResourcesTreeItem extends TreeItemBase {
    constructor(public readonly label: string, public readonly desc: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly command?: vscode.Command) {
        super(label, desc, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", "webpack.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", "webpack.svg"),
    };

    contextValue = "webresources";
}

export const store: IStore = observable({});
