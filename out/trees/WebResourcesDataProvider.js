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
const ExtensionMethods_1 = require("../utils/ExtensionMethods");
class WebResourcesDataProvider {
    constructor(vscontext, uploadHelper) {
        this.vscontext = vscontext;
        this.uploadHelper = uploadHelper;
        this.refreshTreeData = new vscode.EventEmitter();
        this.webResource = [];
        this.linkedResources = [];
        this.onDidChangeTreeData = this.refreshTreeData.event;
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.populateWebResources();
            this.refreshTreeData.fire();
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!element) {
                // Parent
                let parentTree = [];
                ExtensionMethods_1.toArray(Constants_1.WebResourceType).map((t) => {
                    parentTree.push(new WebResourcesTreeItem(t, undefined, vscode.TreeItemCollapsibleState.Expanded, 1));
                });
                return Promise.resolve(parentTree);
            }
            else {
                // Child
                const selectedType = Constants_1.WebResourceType[element.label];
                const checkType = this.webResource.filter((w) => w.webresourcetype === selectedType);
                if (checkType) {
                    return Promise.resolve(checkType.sort(this.sortWebResources).map((e) => {
                        let showCheckmark = false;
                        if (this.linkedResources) {
                            let foundLinkedResc = this.linkedResources.find((lr) => lr === e.name);
                            if (foundLinkedResc) {
                                showCheckmark = true;
                            }
                        }
                        return new WebResourcesTreeItem(e.displayname, e.name, vscode.TreeItemCollapsibleState.None, 2, showCheckmark);
                    }));
                }
            }
            return Promise.resolve([]);
        });
    }
    populateWebResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const vsstate = new State_1.State(this.vscontext);
            const jsonConn = vsstate.getFromWorkspace(Constants_1.wrDefinitionsStoreKey);
            if (jsonConn) {
                this.webResource = jsonConn.value;
                this.linkedResources = yield this.uploadHelper.getLinkedResourceStrings("@_dvFilePath");
            }
            else {
                this.webResource = [];
            }
        });
    }
    sortWebResources(w1, w2) {
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
}
exports.WebResourcesDataProvider = WebResourcesDataProvider;
class WebResourcesTreeItem extends TreeItemBase_1.TreeItemBase {
    constructor(label, desc, collapsibleState, level, showCheck) {
        super(label, desc, collapsibleState);
        this.label = label;
        this.desc = desc;
        this.collapsibleState = collapsibleState;
        this.level = level;
        this.showCheck = showCheck;
        this.iconPath = {
            light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "webpack.svg" : this.level === 2 && !this.showCheck ? "layers-off.svg" : this.level === 2 && this.showCheck ? "layers.svg" : "generic.svg"),
            dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "webpack.svg" : this.level === 2 && !this.showCheck ? "layers-off.svg" : this.level === 2 && this.showCheck ? "layers.svg" : "generic.svg"),
        };
        this.contextValue = "webresources";
    }
}
exports.WebResourcesTreeItem = WebResourcesTreeItem;
exports.store = mobx_1.observable({});
//# sourceMappingURL=WebResourcesDataProvider.js.map