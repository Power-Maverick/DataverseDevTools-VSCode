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
exports.store = exports.WebResourcesTreeItem = exports.WebResourcesDataProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const State_1 = require("../utils/State");
const Constants_1 = require("../utils/Constants");
const mobx_1 = require("mobx");
const TreeItemBase_1 = require("./TreeItemBase");
class WebResourcesDataProvider {
    constructor(vscontext, dvHelper) {
        this.vscontext = vscontext;
        this.dvHelper = dvHelper;
        this.refreshTreeData = new vscode.EventEmitter();
        this.webResource = [];
        this.onDidChangeTreeData = this.refreshTreeData.event;
    }
    refresh() {
        this.populateWebResources();
        this.refreshTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                // Parent
                return Promise.resolve(this.webResource
                    .sort((e1, e2) => {
                    if (e1.displayname > e2.displayname) {
                        return 1;
                    }
                    if (e1.displayname < e2.displayname) {
                        return -1;
                    }
                    return 0;
                })
                    .map((e) => new WebResourcesTreeItem(e.displayname, e.name, vscode.TreeItemCollapsibleState.None)));
            }
            return Promise.resolve([]);
        });
    }
    populateWebResources() {
        const vsstate = new State_1.State(this.vscontext);
        const jsonConn = vsstate.getFromWorkspace(Constants_1.wrDefinitionsStoreKey);
        if (jsonConn) {
            this.webResource = jsonConn.value;
        }
        else {
            this.webResource = [];
        }
    }
}
exports.WebResourcesDataProvider = WebResourcesDataProvider;
class WebResourcesTreeItem extends TreeItemBase_1.TreeItemBase {
    constructor(label, desc, collapsibleState, command) {
        super(label, desc, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.collapsibleState = collapsibleState;
        this.command = command;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", "webpack.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", "webpack.svg"),
        };
        this.contextValue = "webresources";
    }
}
exports.WebResourcesTreeItem = WebResourcesTreeItem;
exports.store = mobx_1.observable({});
//# sourceMappingURL=WebResourcesDataProvider.js.map