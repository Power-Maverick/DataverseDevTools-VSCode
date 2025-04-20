import { observable } from "mobx";
import * as path from "path";
import * as vscode from "vscode";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { flowsDefinitionsStoreKey } from "../utils/Constants";
import { IFlowDefinition, IFlowsMetadata, IStore } from "../utils/Interfaces";
import { State } from "../utils/State";
import { TreeItemBase } from "./treeItemBase";

export class FlowsDataProvider implements vscode.TreeDataProvider<FlowsTreeItem> {
    private refreshTreeData: vscode.EventEmitter<FlowsTreeItem | undefined | void> = new vscode.EventEmitter<FlowsTreeItem | undefined | void>();
    private flows: IFlowDefinition[] = [];

    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) { }

    refresh(): void {
        this.populateFlows();
        this.refreshTreeData.fire();
    }

    getTreeItem(element: FlowsTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FlowsTreeItem): Promise<FlowsTreeItem[]> {
        return Promise.resolve(
            this.flows
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((e) => {
                    const treeItem = new FlowsTreeItem(e.workflowid, e.name, e.description, e.statecode, e.createdon, e.modifiedon);

                    return treeItem;
                }),
        );
    }

    //#region Private

    private populateFlows() {
        const vsstate = new State(this.vscontext);
        const jsonConn: IFlowsMetadata = vsstate.getFromWorkspace(flowsDefinitionsStoreKey);
        if (jsonConn) {
            this.flows = jsonConn.value;
        } else {
            this.flows = [];
        }
    }

    //#endregion

    readonly onDidChangeTreeData: vscode.Event<FlowsTreeItem | undefined | void> = this.refreshTreeData.event;
}

export enum FlowStatus {
    Off = 0,
    On = 1
}

export class FlowsTreeItem extends TreeItemBase {
    constructor(
        public readonly id: string,
        public readonly label: string,
        public readonly description: string | undefined,
        public readonly status: FlowStatus,
        public readonly createdon: Date,
        public readonly modifiedon: Date,
        public readonly command?: vscode.Command,

    ) {
        super(label, undefined, vscode.TreeItemCollapsibleState.None);
    }

    iconPath = {
        light: vscode.Uri.file(path.join(__filename, "..", "resources", "light", this.status === FlowStatus.On ? "flow.svg" : "flow_off.svg")),
        dark: vscode.Uri.file(path.join(__filename, "..", "resources", "dark", this.status === FlowStatus.On ? "flow.svg" : "flow_off.svg")),
    };

    contextValue = "flowdata";
}

export const store: IStore = observable({});
