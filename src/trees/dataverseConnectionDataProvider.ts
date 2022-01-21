import * as vscode from "vscode";
import * as path from "path";
import { State } from "../utils/State";
import { connectionStoreKey, environmentTypes, extensionPrefix } from "../utils/Constants";
import { IConnection, IStore } from "../utils/Interfaces";
import { observable } from "mobx";
import { groupBy } from "../utils/ExtensionMethods";
import { TreeItemBase } from "./treeItemBase";

export class DataverseConnectionDataProvider implements vscode.TreeDataProvider<DataverseConnectionTreeItem> {
    private refreshTreeData: vscode.EventEmitter<DataverseConnectionTreeItem | undefined | void> = new vscode.EventEmitter<DataverseConnectionTreeItem | undefined | void>();
    private connections: IConnection[] = [];

    constructor(private vscontext: vscode.ExtensionContext) {
        this.populateConnections();
    }

    refresh(): void {
        this.populateConnections();
        this.refreshTreeData.fire();
    }

    getTreeItem(element: DataverseConnectionTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: DataverseConnectionTreeItem): Thenable<DataverseConnectionTreeItem[]> {
        if (element) {
            // Child
            const check1 = this.connections.find((c) => c.connectionName === element.label);
            if (check1) {
                let childTree: DataverseConnectionTreeItem[] = [];
                childTree.push(new DataverseConnectionTreeItem(check1.environmentUrl, undefined, vscode.TreeItemCollapsibleState.None, 3));
                childTree.push(new DataverseConnectionTreeItem(check1.userName!, undefined, vscode.TreeItemCollapsibleState.None, 3));
                return Promise.resolve(childTree);
            } else {
                const check2 = this.connections.find((c) => c.environmentUrl === element.label || c.userName === element.label);
                if (check2) {
                    return Promise.resolve([]);
                } else {
                    // Here element will have the environmentType
                    return Promise.resolve(this.getConnectionItems(element.label, this.connections));
                }
            }
        } else {
            // Parent
            const results = groupBy(this.connections, (c) => c.environmentType!);
            let parentTree: DataverseConnectionTreeItem[] = [];
            environmentTypes.map((t) => {
                if (results[t]) {
                    parentTree.push(new DataverseConnectionTreeItem(t, undefined, vscode.TreeItemCollapsibleState.Expanded, 1));
                }
            });

            return Promise.resolve(parentTree);
        }
    }

    private getConnectionItems(connType: string, conns: IConnection[]): DataverseConnectionTreeItem[] {
        const toConnections = (name: string, version: string): DataverseConnectionTreeItem => {
            if (conns) {
                return new DataverseConnectionTreeItem(name, version, vscode.TreeItemCollapsibleState.Collapsed, 2);
            } else {
                return new DataverseConnectionTreeItem(name, version, vscode.TreeItemCollapsibleState.None, 0);
            }
        };

        // prettier-ignore
        const filteredConnections = conns
            ? conns.filter((c) => {
                if (c.environmentType === connType) {
                    return c;
                }
            })
            : [];

        const finalConnections = filteredConnections.map((fc) => toConnections(fc.connectionName, fc.userName!));
        return finalConnections;
    }

    private populateConnections() {
        const vsstate = new State(this.vscontext);
        const jsonConn = vsstate.getFromGlobal(connectionStoreKey);
        if (jsonConn) {
            this.connections = JSON.parse(jsonConn);
            store.noConnections = false;
        } else {
            this.connections = [];
            store.noConnections = true;
        }
        vscode.commands.executeCommand("setContext", `${extensionPrefix}:noConnections`, store.noConnections);
    }

    readonly onDidChangeTreeData: vscode.Event<DataverseConnectionTreeItem | undefined | void> = this.refreshTreeData.event;
}

export class DataverseConnectionTreeItem extends TreeItemBase {
    constructor(public readonly label: string, public readonly desc: string | undefined, public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly level: number) {
        super(label, desc, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "connection-type.svg" : this.level === 2 ? "dataverse.svg" : this.level === 3 ? "connection-details.svg" : "generic.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "connection-type.svg" : this.level === 2 ? "dataverse.svg" : this.level === 3 ? "connection-details.svg" : "generic.svg"),
    };

    contextValue = this.level === 2 ? "connection" : "connection-child";
}

export const store: IStore = observable({});
