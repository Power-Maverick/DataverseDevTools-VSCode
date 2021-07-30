"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.EntitiesTreeItem = exports.EntitiesDataProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const State_1 = require("../utils/State");
const Constants_1 = require("../utils/Constants");
const mobx_1 = require("mobx");
const TreeItemBase_1 = require("./TreeItemBase");
class EntitiesDataProvider {
    constructor(vscontext, dvHelper) {
        this.vscontext = vscontext;
        this.dvHelper = dvHelper;
        this.refreshTreeData = new vscode.EventEmitter();
        this.entities = [];
        this.onDidChangeTreeData = this.refreshTreeData.event;
    }
    refresh() {
        this.populateEntities();
        this.refreshTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (element) {
                // Child
                const check = this.entities.find((e) => { var _a; return ((_a = e.DisplayName.UserLocalizedLabel) === null || _a === void 0 ? void 0 : _a.Label) === element.label; });
                if (check) {
                    let attributes = yield this.dvHelper.getAttributesForEntity(check.LogicalName);
                    return Promise.resolve(attributes.map((a) => new EntitiesTreeItem(a.LogicalName, a.SchemaName, vscode.TreeItemCollapsibleState.None, 2)));
                    // Promise.bind(()=>{
                    //     const attrs = await this.dvHelper.getAttributesForEntity(check.LogicalName);
                    // });
                    // Promise.resolve(this.dvHelper.getAttributesForEntity(check.LogicalName);
                    // childTree.push(new DataverseConnectionTreeItem(check1.environmentUrl, undefined, vscode.TreeItemCollapsibleState.None, 3));
                    // childTree.push(new DataverseConnectionTreeItem(check1.userName, undefined, vscode.TreeItemCollapsibleState.None, 3));
                    // return Promise.resolve(childTree);
                }
            }
            else {
                // Parent
                return Promise.resolve(this.entities
                    .sort((e1, e2) => {
                    var _a, _b, _c, _d;
                    if (((_a = e1.DisplayName.UserLocalizedLabel) === null || _a === void 0 ? void 0 : _a.Label) > ((_b = e2.DisplayName.UserLocalizedLabel) === null || _b === void 0 ? void 0 : _b.Label)) {
                        return 1;
                    }
                    if (((_c = e1.DisplayName.UserLocalizedLabel) === null || _c === void 0 ? void 0 : _c.Label) < ((_d = e2.DisplayName.UserLocalizedLabel) === null || _d === void 0 ? void 0 : _d.Label)) {
                        return -1;
                    }
                    return 0;
                })
                    .filter((e) => e.IsCustomizable.Value)
                    .map((e) => { var _a; return new EntitiesTreeItem((_a = e.DisplayName.UserLocalizedLabel) === null || _a === void 0 ? void 0 : _a.Label, e.SchemaName.toLowerCase(), vscode.TreeItemCollapsibleState.Collapsed, 1); }));
            }
            return Promise.resolve([]);
        });
    }
    /*private getConnectionItems(connType: string, conns: Connection[]): EntitiesTreeItem[] {
        const toConnections = (name: string, version: string): EntitiesTreeItem => {
            if (conns) {
                return new EntitiesTreeItem(name, version, vscode.TreeItemCollapsibleState.Collapsed, 2);
            } else {
                return new EntitiesTreeItem(name, version, vscode.TreeItemCollapsibleState.None, 0, {
                    command: "dvExplorer.Connect",
                    title: "Create New Connection",
                });
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
    }*/
    populateEntities() {
        const vsstate = new State_1.State(this.vscontext);
        const jsonConn = vsstate.getFromWorkspace(Constants_1.entityDefinitionsStoreKey);
        if (jsonConn) {
            this.entities = jsonConn.value;
        }
        else {
            this.entities = [];
        }
    }
}
exports.EntitiesDataProvider = EntitiesDataProvider;
class EntitiesTreeItem extends TreeItemBase_1.TreeItemBase {
    constructor(label, desc, collapsibleState, level, command) {
        super(label, desc, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.collapsibleState = collapsibleState;
        this.level = level;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "table.svg" : this.level === 2 ? "column.svg" : "generic.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "table.svg" : this.level === 2 ? "column.svg" : "generic.svg"),
        };
        this.contextValue = "entitymedata";
    }
}
exports.EntitiesTreeItem = EntitiesTreeItem;
exports.store = mobx_1.observable({});
//# sourceMappingURL=EntitiesDataProvider.js.map