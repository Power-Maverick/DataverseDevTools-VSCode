import { observable } from "mobx";
import * as path from "path";
import * as vscode from "vscode";
import { connectionCurrentStoreKey, connectionStoreKey, environmentTypes, extensionPrefix } from "../utils/Constants";
import { groupBy } from "../utils/ExtensionMethods";
import { IConnection, IStore } from "../utils/Interfaces";
import { State } from "../utils/State";
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
            const connExpand = this.connections.find((c) => c.connectionName === element.label);
            if (connExpand) {
                let childTree: DataverseConnectionTreeItem[] = [];
                if (connExpand.userName) {
                    childTree.push(new DataverseConnectionTreeItem(`${connExpand.environmentUrl} (${connExpand.userName})`, undefined, vscode.TreeItemCollapsibleState.None, 3));
                } else {
                    childTree.push(new DataverseConnectionTreeItem(connExpand.environmentUrl, undefined, vscode.TreeItemCollapsibleState.None, 3));
                }
                return Promise.resolve(childTree);
            } else {
                const noExpandCheck = this.connections.find((c) => c.environmentUrl === element.label || c.userName === element.label);
                if (noExpandCheck) {
                    return Promise.resolve([]);
                } else {
                    // Expand Environment
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
        const toConnections = (name: string, version: string, isConnected: boolean, isExpired: boolean): DataverseConnectionTreeItem => {
            if (conns) {
                return new DataverseConnectionTreeItem(name, version, vscode.TreeItemCollapsibleState.Collapsed, 2, isConnected, isExpired);
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

        const finalConnections = filteredConnections.map((fc) => {
            // Check if token is expired
            const isExpired = fc.isCurrentlyConnected && fc.tokenExpiresAt ? Date.now() >= fc.tokenExpiresAt : false;
            return toConnections(fc.connectionName, fc.userName!, fc.isCurrentlyConnected!, isExpired);
        });
        return finalConnections;
    }

    private populateConnections() {
        const vsstate = new State(this.vscontext);
        const jsonConn = vsstate.getFromGlobal(connectionStoreKey);
        if (jsonConn) {
            this.connections = JSON.parse(jsonConn);
            store.noConnections = false;
            const connFromWS: IConnection = vsstate.getFromWorkspace(connectionCurrentStoreKey);
            if (connFromWS) {
                let ind = this.connections.findIndex((c) => c.connectionName === connFromWS.connectionName && c.environmentType === connFromWS.environmentType);
                if (ind !== -1) {
                    this.connections[ind].isCurrentlyConnected = true;
                    // Copy the tokenExpiresAt from workspace connection to show expired state
                    this.connections[ind].tokenExpiresAt = connFromWS.tokenExpiresAt;
                }
            }
        } else {
            this.connections = [];
            store.noConnections = true;
        }
        vscode.commands.executeCommand("setContext", `${extensionPrefix}:noConnections`, store.noConnections);
    }

    readonly onDidChangeTreeData: vscode.Event<DataverseConnectionTreeItem | undefined | void> = this.refreshTreeData.event;
}

export class DataverseConnectionTreeItem extends TreeItemBase {
    constructor(
        public readonly label: string,
        public readonly desc: string | undefined,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly level: number,
        public readonly current: boolean = false,
        public readonly expired: boolean = false,
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
                this.level === 1
                    ? "connection-type.svg"
                    : this.level === 2 && this.current && !this.expired
                    ? "dataverse.svg"
                    : this.level === 2 && this.current && this.expired
                    ? "dataverse-expired.svg"
                    : this.level === 2 && !this.current
                    ? "dataverse-off.svg"
                    : this.level === 3
                    ? "connection-details.svg"
                    : "generic.svg",
            ),
        ),
        dark: vscode.Uri.file(
            path.join(
                __filename,
                "..",
                "resources",
                "dark",
                this.level === 1
                    ? "connection-type.svg"
                    : this.level === 2 && this.current && !this.expired
                    ? "dataverse.svg"
                    : this.level === 2 && this.current && this.expired
                    ? "dataverse-expired.svg"
                    : this.level === 2 && !this.current
                    ? "dataverse-off.svg"
                    : this.level === 3
                    ? "connection-details.svg"
                    : "generic.svg",
            ),
        ),
    };

    contextValue = this.level === 2 ? "connection" : "connection-child";
}

export const store: IStore = observable({});
