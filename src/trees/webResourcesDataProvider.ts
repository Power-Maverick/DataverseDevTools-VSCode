import { observable } from "mobx";
import * as path from "path";
import * as vscode from "vscode";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { WebResourceHelper } from "../helpers/webResourceHelper";
import { extensionName, extensionPrefix, WebResourceType, wrDefinitionsStoreKey } from "../utils/Constants";
import { toArray } from "../utils/ExtensionMethods";
import { ISolutionComponent, IStore, IWebResource, IWebResources } from "../utils/Interfaces";
import { Placeholders } from "../utils/Placeholders";
import { State } from "../utils/State";
import { TreeItemBase } from "./treeItemBase";

export class WebResourcesDataProvider implements vscode.TreeDataProvider<WebResourcesTreeItem> {
    private refreshTreeData: vscode.EventEmitter<WebResourcesTreeItem | undefined | void> = new vscode.EventEmitter<WebResourcesTreeItem | undefined | void>();
    private webResource: IWebResource[] = [];
    private linkedResources: string[] | undefined = [];
    private areWRFiltered: boolean = false;
    private areWRSearched: boolean = false;

    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper, private uploadHelper: WebResourceHelper) {}

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

            const allowedFolder = ["html", "css", "script", "others"];

            let parentTree: WebResourcesTreeItem[] = [];
            toArray(WebResourceType).map((t: WebResourceType) => {
                if (allowedFolder.indexOf(t.toString()) > WebResourceType.others) {
                    parentTree.push(new WebResourcesTreeItem(t.toString(), undefined, vscode.TreeItemCollapsibleState.Expanded, 1));
                }
            });

            return Promise.resolve(parentTree);
        } else {
            // Child
            const selectedType: WebResourceType = (<any>WebResourceType)[element.label];
            let checkType: Array<IWebResource> | undefined = undefined;

            if (selectedType === WebResourceType.others) {
                checkType = this.webResource.filter((w) => w.webresourcetype !== undefined && w.webresourcetype > WebResourceType.script);
            } else {
                checkType = this.webResource.filter((w) => w.webresourcetype === selectedType);
            }

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
                        return new WebResourcesTreeItem(e.displayname!, e.name, vscode.TreeItemCollapsibleState.None, 2, showCheckmark);
                    }),
                );
            }
        }
        return Promise.resolve([]);
    }

    async filter(): Promise<void> {
        const vsstate = new State(this.vscontext);
        const jsonConn: IWebResources = vsstate.getFromWorkspace(wrDefinitionsStoreKey);

        if (!jsonConn) {
            vscode.window.showErrorMessage(`${extensionName}: No web-resources found.`);
            return;
        }

        if (this.areWRFiltered) {
            this.webResource = jsonConn.value;
            this.areWRFiltered = false;
        } else {
            await this.filterWizard(jsonConn.value);
            this.areWRFiltered = true;
        }
        this.refreshTreeData.fire();
        vscode.commands.executeCommand("setContext", `${extensionPrefix}.wrFiltered`, this.areWRFiltered);
    }

    async search(): Promise<void> {
        const vsstate = new State(this.vscontext);
        const jsonConn: IWebResources = vsstate.getFromWorkspace(wrDefinitionsStoreKey);

        if (!jsonConn) {
            vscode.window.showErrorMessage(`${extensionName}: No web-resources found.`);
            return;
        }

        if (this.areWRSearched) {
            this.webResource = jsonConn.value;
            this.areWRSearched = false;
        } else {
            await this.searchWizard(jsonConn.value);
            this.areWRSearched = true;
        }
        this.refreshTreeData.fire();
        vscode.commands.executeCommand("setContext", `${extensionPrefix}.wrSearched`, this.areWRSearched);
    }

    //#region Private

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
        if (!w1.displayname) {
            return -1;
        }
        if (!w2.displayname) {
            return 1;
        }
        if (w1.displayname > w2.displayname) {
            return 1;
        }
        if (w1.displayname < w2.displayname) {
            return -1;
        }
        return 0;
    }

    private async filterWizard(wrArray: IWebResource[]) {
        const solutions = await this.dvHelper.getSolutions();
        if (solutions) {
            let solQPOptions = solutions.value.map((s) => {
                return { label: s.friendlyname, data: s };
            });
            let solOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.solutionSelection);
            let solQPResponse = await vscode.window.showQuickPick(solQPOptions, solOptionsQP);

            if (solQPResponse) {
                const resp = await this.dvHelper.fetchWRsInSolution(solQPResponse.data.solutionid);
                if (wrArray && resp) {
                    this.webResource = this.filterArrayBySolution(wrArray, resp.value);
                }
            }
        }
    }

    private async searchWizard(wrArray: IWebResource[]) {
        let wrQPOptions = wrArray.sort(this.sortWebResources).map((w) => {
            return { label: w.displayname!, data: w };
        });
        let wrOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.wrSearch);
        let wrQPResponse = await vscode.window.showQuickPick(wrQPOptions, {
            placeHolder: wrOptionsQP.placeHolder,
            title: wrOptionsQP.title,
            ignoreFocusOut: wrOptionsQP.ignoreFocusOut,
            canPickMany: true,
        });

        if (wrQPResponse) {
            this.webResource = wrQPResponse.map((resp) => resp.data);
        }
    }

    private filterArrayBySolution(a1: IWebResource[], a2: ISolutionComponent[]) {
        let res = [];
        res = a1.filter((el) => {
            return a2.find((element) => {
                return element.objectid === el.webresourceid;
            });
        });
        return res;
    }

    //#endregion

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
        light: vscode.Uri.file(
            path.join(
                __filename,
                "..",
                "resources",
                "light",
                this.label === "html"
                    ? "html.svg"
                    : this.label === "css"
                    ? "css.svg"
                    : this.label === "script"
                    ? "js.svg"
                    : this.level === 2 && !this.showCheck
                    ? "file-red.svg"
                    : this.level === 2 && this.showCheck
                    ? "file-green.svg"
                    : "generic.svg",
            ),
        ),
        dark: vscode.Uri.file(
            path.join(
                __filename,
                "..",
                "resources",
                "dark",
                this.label === "html"
                    ? "html.svg"
                    : this.label === "css"
                    ? "css.svg"
                    : this.label === "script"
                    ? "js.svg"
                    : this.level === 2 && !this.showCheck
                    ? "file-red.svg"
                    : this.level === 2 && this.showCheck
                    ? "file-green.svg"
                    : "generic.svg",
            ),
        ),
    };

    contextValue = "webresources";
}

export const store: IStore = observable({});
