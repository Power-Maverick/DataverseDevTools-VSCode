import * as vscode from "vscode";
import * as path from "path";
import { State } from "../utils/State";
import { entityDefinitionsStoreKey } from "../utils/Constants";
import { IStore, IEntityDefinition, IEntityMetadata } from "../utils/Interfaces";
import { observable } from "mobx";
import { TreeItemBase } from "./TreeItemBase";
import { DataverseHelper } from "../helpers/DataverseHelper";

export class EntitiesDataProvider implements vscode.TreeDataProvider<EntitiesTreeItem> {
    private refreshTreeData: vscode.EventEmitter<EntitiesTreeItem | undefined | void> = new vscode.EventEmitter<EntitiesTreeItem | undefined | void>();
    private entities: IEntityDefinition[] = [];

    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {}

    refresh(): void {
        this.populateEntities();
        this.refreshTreeData.fire();
    }

    getTreeItem(element: EntitiesTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: EntitiesTreeItem): Promise<EntitiesTreeItem[]> {
        if (element) {
            // Child
            const check = this.entities.find((e) => e.DisplayName.UserLocalizedLabel?.Label === element.label);
            if (check) {
                let attributes = await this.dvHelper.getAttributesForEntity(check.LogicalName);
                return Promise.resolve(attributes.map((a) => new EntitiesTreeItem(a.LogicalName, a.SchemaName, vscode.TreeItemCollapsibleState.None, 2)));
            }
        } else {
            // Parent
            return Promise.resolve(
                this.entities
                    .sort(this.sortEntities)
                    .filter((e) => e.IsCustomizable.Value)
                    .map((e) => new EntitiesTreeItem(e.DisplayName.UserLocalizedLabel?.Label, e.SchemaName.toLowerCase(), vscode.TreeItemCollapsibleState.Collapsed, 1)),
            );
        }

        return Promise.resolve([]);
    }

    private populateEntities() {
        const vsstate = new State(this.vscontext);
        const jsonConn: IEntityMetadata = vsstate.getFromWorkspace(entityDefinitionsStoreKey);
        if (jsonConn) {
            this.entities = jsonConn.value;
        } else {
            this.entities = [];
        }
    }

    private sortEntities(e1: IEntityDefinition, e2: IEntityDefinition) {
        if (e1.DisplayName.UserLocalizedLabel?.Label > e2.DisplayName.UserLocalizedLabel?.Label) {
            return 1;
        }
        if (e1.DisplayName.UserLocalizedLabel?.Label < e2.DisplayName.UserLocalizedLabel?.Label) {
            return -1;
        }
        if (e1.DisplayName.UserLocalizedLabel === null || e1.DisplayName.UserLocalizedLabel === undefined) {
            return 1;
        }
        if (e2.DisplayName.UserLocalizedLabel === null || e2.DisplayName.UserLocalizedLabel === undefined) {
            return -1;
        }
        return 0;
    }

    readonly onDidChangeTreeData: vscode.Event<EntitiesTreeItem | undefined | void> = this.refreshTreeData.event;
}

export class EntitiesTreeItem extends TreeItemBase {
    constructor(
        public readonly label: string,
        public readonly desc: string | undefined,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly level: number,
        public readonly command?: vscode.Command,
    ) {
        super(label, desc, collapsibleState);
    }

    iconPath = {
        light: path.join(__filename, "..", "..", "..", "resources", "light", this.level === 1 ? "table.svg" : this.level === 2 ? "column.svg" : "generic.svg"),
        dark: path.join(__filename, "..", "..", "..", "resources", "dark", this.level === 1 ? "table.svg" : this.level === 2 ? "column.svg" : "generic.svg"),
    };

    contextValue = "entitymedata";
}

export const store: IStore = observable({});
