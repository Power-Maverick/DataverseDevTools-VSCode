import * as vscode from "vscode";
import * as path from "path";
import { State } from "../utils/State";
import { entityDefinitionsStoreKey, extensionName, extensionPrefix } from "../utils/Constants";
import { IStore, IEntityDefinition, IEntityMetadata, ISolutionComponents, ISolutionComponent } from "../utils/Interfaces";
import { observable } from "mobx";
import { TreeItemBase } from "./treeItemBase";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { Placeholders } from "../utils/Placeholders";

export class EntitiesDataProvider implements vscode.TreeDataProvider<EntitiesTreeItem> {
    private refreshTreeData: vscode.EventEmitter<EntitiesTreeItem | undefined | void> = new vscode.EventEmitter<EntitiesTreeItem | undefined | void>();
    private entities: IEntityDefinition[] = [];
    private areEntitiesFiltered: boolean = false;

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

    async filter(): Promise<void> {
        const vsstate = new State(this.vscontext);
        const jsonConn: IEntityMetadata = vsstate.getFromWorkspace(entityDefinitionsStoreKey);

        if (!jsonConn) {
            vscode.window.showErrorMessage(`${extensionName}: No entities found.`);
            return;
        }

        if (this.areEntitiesFiltered) {
            this.entities = jsonConn.value;
        } else {
            await this.filterWizard(jsonConn.value);
            this.areEntitiesFiltered = true;
        }
        this.refreshTreeData.fire();
        vscode.commands.executeCommand("setContext", `${extensionPrefix}.entitiesFiltered`, this.areEntitiesFiltered);
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

    private async filterWizard(entityArray: IEntityDefinition[]) {
        const solutions = await this.dvHelper.getSolutions();
        if (solutions) {
            let solQPOptions = solutions.value.map((s) => {
                return { label: s.friendlyname, data: s };
            });
            let solOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.solutionSelection);
            let solQPResponse = await vscode.window.showQuickPick(solQPOptions, solOptionsQP);

            if (solQPResponse) {
                const resp = await this.dvHelper.fetchEntitiesInSolution(solQPResponse.data.solutionid);
                if (entityArray && resp) {
                    this.entities = this.filterArrayBySolution(entityArray, resp.value);
                }
            }
        }
    }

    private filterArrayBySolution(a1: IEntityDefinition[], a2: ISolutionComponent[]) {
        let res = [];
        res = a1.filter((el) => {
            return a2.find((element) => {
                return element.objectid === el.MetadataId;
            });
        });
        return res;
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
