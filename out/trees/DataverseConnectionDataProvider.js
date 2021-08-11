"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.DataverseConnectionTreeItem = exports.DataverseConnectionDataProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const State_1 = require("../utils/State");
const Constants_1 = require("../utils/Constants");
const mobx_1 = require("mobx");
const ExtensionMethods_1 = require("../utils/ExtensionMethods");
const treeItemBase_1 = require("./treeItemBase");
class DataverseConnectionDataProvider {
    constructor(vscontext) {
        this.vscontext = vscontext;
        this.refreshTreeData = new vscode.EventEmitter();
        this.connections = [];
        this.onDidChangeTreeData = this.refreshTreeData.event;
        this.populateConnections();
    }
    refresh() {
        this.populateConnections();
        this.refreshTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            // Child
            const check1 = this.connections.find((c) => c.connectionName === element.label);
            if (check1) {
                let childTree = [];
                childTree.push(new DataverseConnectionTreeItem(check1.environmentUrl, undefined, vscode.TreeItemCollapsibleState.None, 3));
                childTree.push(new DataverseConnectionTreeItem(check1.userName, undefined, vscode.TreeItemCollapsibleState.None, 3));
                return Promise.resolve(childTree);
            }
            else {
                const check2 = this.connections.find((c) => c.environmentUrl === element.label || c.userName === element.label);
                if (check2) {
                    return Promise.resolve([]);
                }
                else {
                    // Here element will have the environmentType
                    return Promise.resolve(this.getConnectionItems(element.label, this.connections));
                }
            }
        }
        else {
            // Parent
            const results = ExtensionMethods_1.groupBy(this.connections, (c) => c.connectionType);
            let parentTree = [];
            Constants_1.environmentTypes.map((t) => {
                if (results[t]) {
                    parentTree.push(new DataverseConnectionTreeItem(t, undefined, vscode.TreeItemCollapsibleState.Expanded, 1));
                }
            });
            return Promise.resolve(parentTree);
        }
    }
    getConnectionItems(connType, conns) {
        const toConnections = (name, version) => {
            if (conns) {
                return new DataverseConnectionTreeItem(name, version, vscode.TreeItemCollapsibleState.Collapsed, 2);
            }
            else {
                return new DataverseConnectionTreeItem(name, version, vscode.TreeItemCollapsibleState.None, 0);
            }
        };
        // prettier-ignore
        const filteredConnections = conns
            ? conns.filter((c) => {
                if (c.connectionType === connType) {
                    return c;
                }
            })
            : [];
        const finalConnections = filteredConnections.map((fc) => toConnections(fc.connectionName, fc.userName));
        return finalConnections;
    }
    populateConnections() {
        const vsstate = new State_1.State(this.vscontext);
        const jsonConn = vsstate.getFromGlobal(Constants_1.connectionStoreKey);
        if (jsonConn) {
            this.connections = JSON.parse(jsonConn);
            exports.store.noConnections = false;
        }
        else {
            this.connections = [];
            exports.store.noConnections = true;
        }
        vscode.commands.executeCommand("setContext", `${Constants_1.extensionPrefix}:noConnections`, exports.store.noConnections);
    }
}
exports.DataverseConnectionDataProvider = DataverseConnectionDataProvider;
class DataverseConnectionTreeItem extends treeItemBase_1.TreeItemBase {
    constructor(label, desc, collapsibleState, level) {
        super(label, desc, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.collapsibleState = collapsibleState;
        this.level = level;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "connection-type.svg" : this.level === 2 ? "connection.svg" : this.level === 3 ? "connection-details.svg" : "generic.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "connection-type.svg" : this.level === 2 ? "connection.svg" : this.level === 3 ? "connection-details.svg" : "generic.svg"),
        };
        this.contextValue = this.level === 2 ? "connection" : "connection-child";
    }
}
exports.DataverseConnectionTreeItem = DataverseConnectionTreeItem;
exports.store = mobx_1.observable({});
//# sourceMappingURL=dataverseConnectionDataProvider.js.map