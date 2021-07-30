import * as vscode from "vscode";
import { loginWithUsernamePassword } from "../login/Login";
import { Placeholders } from "../utils/Placeholders";
import { ErrorMessages } from "../utils/ErrorMessages";
import { State } from "../utils/State";
import { IAttributeDefinition, IAttributeMetadata, IConnection, IEntityDefinition, IEntityMetadata, IProgressOptions } from "../utils/Interfaces";
import { connectionCurrentStoreKey, connectionStoreKey, entityDefinitionsStoreKey, environmentTypes, wrDefinitionsStoreKey } from "../utils/Constants";
import { DataverseConnectionTreeItem } from "../trees/DataverseConnectionDataProvider";
import { RequestHelper } from "./RequestHelper";
import { ProgressLocation } from "vscode";
import { EntitiesDataProvider } from "../trees/EntitiesDataProvider";
import { openUri } from "../utils/OpenUri";
import { ViewBase } from "../views/ViewBase";
import { ConnectionDetailsView } from "../views/ConnectionDetailsView";
import { EntityDetailsView } from "../views/EntityDetailsView";

export class DataverseHelper {
    private vsstate: State;
    private request: RequestHelper;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {
        this.vsstate = new State(vscontext);
        this.request = new RequestHelper(vscontext);
    }

    //#region Public

    public async addConnection(): Promise<IConnection | undefined> {
        //vscode.window.showInformationMessage(`${extensionName}: Connecting to Dataverse`);
        const conn = await this.connectionWizard();
        try {
            if (conn) {
                const tokenResponse = await loginWithUsernamePassword(conn.environmentUrl, conn.userName, conn.password);
                conn.currentAccessToken = tokenResponse.access_token!;
                this.vsstate.saveInWorkspace(connectionCurrentStoreKey, conn);
                /*
                const requestUrl = `${conn.environmentUrl}${apiPartUrl}accounts?$select=name,accountnumber&$top=3`;
                const response = await fetch(requestUrl, {
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: `Bearer ${conn.currentAccessToken}`,
                        "x-ms-client-request-id": uuid(),
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });

                if (response.ok) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const json = await response.json();
                    console.log(json);
                }
                */
            }
        } catch (err) {
            throw err;
        } finally {
            vscode.commands.executeCommand("dvExplorer.refreshConnection");
        }

        return conn;
    }

    public async deleteConnection(connItem: DataverseConnectionTreeItem) {
        this.removeConnection(connItem.label);
        vscode.commands.executeCommand("dvExplorer.refreshConnection");
    }

    public async connectToDataverse(connItem: DataverseConnectionTreeItem): Promise<IConnection | undefined> {
        try {
            const conn: IConnection | undefined = this.getConnectionByName(connItem.label);
            if (conn) {
                return vscode.window.withProgress(
                    {
                        location: ProgressLocation.Notification,
                    },
                    async (progress, token) => {
                        token.onCancellationRequested(() => {
                            console.log("User canceled the long running operation");
                            return;
                        });
                        progress.report({ increment: 0, message: "Connecting to environment..." });
                        const tokenResponse = await loginWithUsernamePassword(conn.environmentUrl, conn.userName, conn.password);
                        conn.currentAccessToken = tokenResponse.access_token!;
                        progress.report({ increment: 10 });
                        this.vsstate.saveInWorkspace(connectionCurrentStoreKey, conn);
                        progress.report({ increment: 30, message: "Getting entity metadata..." });
                        await this.getEntityDefinitions();
                        progress.report({ increment: 70, message: "Getting web resources..." });
                        await this.getWebResources();

                        return new Promise<IConnection>((resolve) => {
                            resolve(conn);
                        });
                    },
                );
            } else {
                return undefined;
            }
        } catch (err) {}
    }

    public async getEntityDefinitions() {
        const respData = await this.request.requestData<IEntityMetadata>("EntityDefinitions");
        this.vsstate.saveInWorkspace(entityDefinitionsStoreKey, respData);
        vscode.commands.executeCommand("dvExplorer.loadEntities");
    }

    public async getAttributesForEntity(entityLogicalName: string): Promise<IAttributeDefinition[]> {
        const respData = await this.request.requestData<IAttributeMetadata>(`EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`);
        if (respData) {
            return Promise.resolve(respData.value);
        } else {
            return Promise.resolve([]);
        }
    }

    public openEnvironment(connItem: DataverseConnectionTreeItem) {
        const conn: IConnection | undefined = this.getConnectionByName(connItem.label);
        if (conn) {
            openUri(conn.environmentUrl);
        }
    }

    public async showEnvironmentDetails(connItem: DataverseConnectionTreeItem, view: ViewBase) {
        const conn: IConnection | undefined = this.getConnectionByName(connItem.label);
        if (conn) {
            const webview = await view.getWebView({ type: "showEnvironmentDetails", title: "Show Environment Details" });
            new ConnectionDetailsView(conn, webview, this.vscontext);
        }
    }

    public async showEntityDetails(enItem: DataverseConnectionTreeItem, view: ViewBase) {
        const en: IEntityDefinition | undefined = this.getEntityByName(enItem.desc!);
        if (en) {
            en.Attributes = { value: await this.getAttributesForEntity(en.LogicalName) };
            const webview = await view.getWebView({ type: "showEntityDetails", title: "Show Entity Details" });
            new EntityDetailsView(en, webview, this.vscontext);
        }
    }

    public async getWebResources() {
        const respData = await this.request.requestData<IEntityMetadata>("webresourceset?$filter=(webresourcetype%20eq%203%20and%20ismanaged%20eq%20false%20and%20iscustomizable/Value%20eq%20true%20)");
        this.vsstate.saveInWorkspace(wrDefinitionsStoreKey, respData);
        vscode.commands.executeCommand("dvExplorer.loadWebResources");
    }

    //#endregion Public

    async connectionWizard(): Promise<IConnection | undefined> {
        let envUrlUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.dataverseEnvironmentURL));
        if (!envUrlUserResponse) {
            vscode.window.showErrorMessage(ErrorMessages.dataverseEnvironmentUrlRequired);
            return undefined;
        }

        let usernameUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.userName));
        if (!usernameUserResponse) {
            vscode.window.showErrorMessage(ErrorMessages.usernameRequired);
            return undefined;
        }

        let passwordUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.password));
        if (!passwordUserResponse) {
            vscode.window.showErrorMessage(ErrorMessages.passwordRequired);
            return undefined;
        }

        let connNameUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.connectionName));
        if (!connNameUserResponse) {
            vscode.window.showErrorMessage(ErrorMessages.connNameRequired);
            return undefined;
        }

        let typeOptions: string[] = environmentTypes;
        let typeOptionsQuickPick: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.connectionType);
        let typeResponse: string | undefined = await vscode.window.showQuickPick(typeOptions, typeOptionsQuickPick);

        let conn: IConnection = {
            environmentUrl: envUrlUserResponse,
            userName: usernameUserResponse,
            password: passwordUserResponse,
            connectionName: connNameUserResponse,
        };

        if (typeResponse) {
            conn.connectionType = typeResponse;
        }

        this.saveConnection(conn);
        return conn;
    }

    saveConnection(connDetail: IConnection) {
        if (!this.getConnectionByName(connDetail.connectionName)) {
            const jsonConn: string = this.vsstate.getFromGlobal(connectionStoreKey);
            if (jsonConn) {
                const conns: IConnection[] = JSON.parse(jsonConn);
                conns.push(connDetail);
                this.vsstate.saveInGlobal(connectionStoreKey, JSON.stringify(conns));
            } else {
                const conns: IConnection[] = [];
                conns.push(connDetail);
                this.vsstate.saveInGlobal(connectionStoreKey, JSON.stringify(conns));
            }
        } else {
            vscode.window.showErrorMessage(`Connection with same name already exists. Please re-create the connection with a different name.`);
        }
    }

    async removeConnection(connName: string) {
        const respDeleteConfirm = await vscode.window.showWarningMessage("Are you sure you want to delete this connection?", { detail: "Confirm your selection", modal: true }, "Yes", "No");
        if (respDeleteConfirm === "Yes") {
            const jsonConn: string = this.vsstate.getFromGlobal(connectionStoreKey);
            if (jsonConn) {
                const conns: IConnection[] = JSON.parse(jsonConn);
                const resultConn = conns.find((c) => c.connectionName === connName);

                const indexConnToRemove = conns.indexOf(resultConn!, 0);
                if (indexConnToRemove > -1) {
                    conns.splice(indexConnToRemove, 1);
                }

                if (conns.length > 0) {
                    this.vsstate.saveInGlobal(connectionStoreKey, JSON.stringify(conns));
                } else {
                    this.vsstate.unsetFromGlobal(connectionStoreKey);
                }
            }
        }
    }

    getConnectionByName(connName: string): IConnection | undefined {
        const jsonConn: string = this.vsstate.getFromGlobal(connectionStoreKey);
        if (jsonConn) {
            const conns: IConnection[] = JSON.parse(jsonConn);
            return conns.find((c) => c.connectionName === connName);
        }

        return undefined;
    }

    getEntityByName(entityName: string): IEntityDefinition | undefined {
        const jsonEntities: IEntityMetadata = this.vsstate.getFromWorkspace(entityDefinitionsStoreKey);
        if (jsonEntities) {
            return jsonEntities.value.find((e) => e.SchemaName.toLowerCase() === entityName);
        }

        return undefined;
    }
}
