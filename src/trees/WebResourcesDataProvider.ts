import * as vscode from "vscode";
import * as path from "path";
import { State } from "../utils/State";
import { WebResourceType, wrDefinitionsStoreKey } from "../utils/Constants";
import { ILinkerRes, IStore, IWebResource, IWebResources } from "../utils/Interfaces";
import { observable } from "mobx";
import { TreeItemBase } from "./TreeItemBase";
import { toArray } from "../utils/ExtensionMethods";
import { UploadHelper } from "../helpers/UploadHelper";

export class WebResourcesDataProvider implements vscode.TreeDataProvider<WebResourcesTreeItem> {
    private refreshTreeData: vscode.EventEmitter<WebResourcesTreeItem | undefined | void> = new vscode.EventEmitter<WebResourcesTreeItem | undefined | void>();
    private webResource: IWebResource[] = [];
    private linkedResources: string[] | undefined = [];

    constructor(private vscontext: vscode.ExtensionContext, private uploadHelper: UploadHelper) {}

    async refresh(): Promise<void> {
        await this.populateWebResources();
        this.refreshTreeData.fire();
    }

    getTreeItem(element: WebResourcesTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WebResourcesTreeItem): Promise<WebResourcesTreeItem[]> {
        if (!element) {
            // Parent
            let parentTree: WebResourcesTreeItem[] = [];
            toArray(WebResourceType).map((t) => {
                parentTree.push(new WebResourcesTreeItem(t, undefined, vscode.TreeItemCollapsibleState.Expanded, 1));
            });

            return Promise.resolve(parentTree);
        } else {
            // Child
            const selectedType: WebResourceType = (<any>WebResourceType)[element.label];
            const checkType = this.webResource.filter((w) => w.webresourcetype === selectedType);

            if (checkType) {
                return Promise.resolve(
                    checkType.sort(this.sortWebResources).map((e) => {
                        let showCheckmark = false;
                        if (this.linkedResources) {
                            let foundLinkedResc = this.linkedResources.find((lr) => lr === e.name);
                            if (foundLinkedResc) {
                                showCheckmark = true;
                            }
                        }

                        return new WebResourcesTreeItem(e.displayname, e.name, vscode.TreeItemCollapsibleState.None, 2, showCheckmark);
                    }),
                );
            }
        }
        return Promise.resolve([]);
    }

    private async populateWebResources() {
        const vsstate = new State(this.vscontext);
        const jsonConn: IWebResources = vsstate.getFromWorkspace(wrDefinitionsStoreKey);
        if (jsonConn) {
            this.webResource = jsonConn.value;
            this.linkedResources = await this.uploadHelper.getLinkedResourceStrings("@_dvFilePath");
        } else {
            this.webResource = [];
        }
    }

    private sortWebResources(w1: IWebResource, w2: IWebResource) {
        if (w1.displayname > w2.displayname) {
            return 1;
        }
        if (w1.displayname < w2.displayname) {
            return -1;
        }
        return 0;
    }

    readonly onDidChangeTreeData: vscode.Event<WebResourcesTreeItem | undefined | void> = this.refreshTreeData.event;
}

export class WebResourcesTreeItem extends TreeItemBase {
    constructor(
        public readonly label: string,
        public readonly desc: string | undefined,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly level: number,
        public readonly showCheck?: boolean,
    ) {
        super(label, desc, collapsibleState);
    }

    iconPath = {
        light: path.join(
            __filename,
            "..",
            "..",
            "..",
            "resources",
            "light",
            this.level === 1 ? "webpack.svg" : this.level === 2 && !this.showCheck ? "layers-off.svg" : this.level === 2 && this.showCheck ? "layers.svg" : "generic.svg",
        ),
        dark: path.join(
            __filename,
            "..",
            "..",
            "..",
            "resources",
            "dark",
            this.level === 1 ? "webpack.svg" : this.level === 2 && !this.showCheck ? "layers-off.svg" : this.level === 2 && this.showCheck ? "layers.svg" : "generic.svg",
        ),
    };

    contextValue = "webresources";
}

export const store: IStore = observable({});
