import { observable } from "mobx";
import * as path from "path";
import * as vscode from "vscode";
import { DataverseHelper } from "../helpers/dataverseHelper";
import { entityDefinitionsStoreKey, extensionName, extensionPrefix } from "../utils/Constants";
import { IEntityDefinition, IEntityMetadata, ISolutionComponent, IStore } from "../utils/Interfaces";
import { Placeholders } from "../utils/Placeholders";
import { State } from "../utils/State";
import { TreeItemBase } from "./treeItemBase";

export class EntitiesDataProvider implements vscode.TreeDataProvider<EntitiesTreeItem> {
    private refreshTreeData: vscode.EventEmitter<EntitiesTreeItem | undefined | void> = new vscode.EventEmitter<EntitiesTreeItem | undefined | void>();
    private entities: IEntityDefinition[] = [];
    private areEntitiesFiltered: boolean = false;
    private areEntitiesSearched: boolean = false;

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
            this.areEntitiesFiltered = false;
        } else {
            await this.filterWizard(jsonConn.value);
            this.areEntitiesFiltered = true;
        }
        this.refreshTreeData.fire();
        vscode.commands.executeCommand("setContext", `${extensionPrefix}.entitiesFiltered`, this.areEntitiesFiltered);
    }

    async search(): Promise<void> {
        const vsstate = new State(this.vscontext);
        const jsonConn: IEntityMetadata = vsstate.getFromWorkspace(entityDefinitionsStoreKey);

        if (!jsonConn) {
            vscode.window.showErrorMessage(`${extensionName}: No entities found.`);
            return;
        }

        if (this.areEntitiesSearched) {
            this.entities = jsonConn.value;
            this.areEntitiesSearched = false;
        } else {
            await this.searchWizard(jsonConn.value);
            this.areEntitiesSearched = true;
        }

        this.refreshTreeData.fire();
        vscode.commands.executeCommand("setContext", `${extensionPrefix}.entitiesSearched`, this.areEntitiesSearched);
    }

    //#region Private

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

    private async searchWizard(entityArray: IEntityDefinition[]) {
        let entQPOptions = entityArray.sort(this.sortEntities).map((e) => {
            return { label: e.DisplayName.UserLocalizedLabel?.Label ?? e.LogicalName, data: e };
        });
        let entitiesOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.entitiesSearch);
        let entQPResponse = await vscode.window.showQuickPick(entQPOptions, {
            placeHolder: entitiesOptionsQP.placeHolder,
            title: entitiesOptionsQP.title,
            ignoreFocusOut: entitiesOptionsQP.ignoreFocusOut,
            canPickMany: true,
        });

        if (entQPResponse) {
            this.entities = entQPResponse.map((resp) => resp.data);
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

    //#endregion

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
        light: vscode.Uri.file(path.join(__filename, "..", "resources", "light", this.level === 1 ? "table.svg" : this.level === 2 ? "column.svg" : "generic.svg")),
        dark: vscode.Uri.file(path.join(__filename, "..", "resources", "dark", this.level === 1 ? "table.svg" : this.level === 2 ? "column.svg" : "generic.svg")),
    };

    contextValue = "entitymedata";
}

export const store: IStore = observable({});
