import * as vscode from "vscode";
import { loginWithClientIdSecret, loginWithPrompt, loginWithRefreshToken, loginWithUsernamePassword } from "../login/login";
import { Placeholders } from "../utils/Placeholders";
import { ErrorMessages } from "../utils/ErrorMessages";
import { State } from "../utils/State";
import {
    IAttributeDefinition,
    IAttributeMetadata,
    IConnection,
    IEntityDefinition,
    IEntityMetadata,
    IOptionSet,
    IOptionSetMetadata,
    IComponentUpdate,
    ISolutions,
    IWebResource,
    ISolutionComponents,
    Token,
} from "../utils/Interfaces";
import { connectionCurrentStoreKey, connectionStoreKey, customDataverseClientId, entityDefinitionsStoreKey, environmentTypes, loginTypes, solDefinitionsStoreKey, wrDefinitionsStoreKey } from "../utils/Constants";
import { DataverseConnectionTreeItem } from "../trees/dataverseConnectionDataProvider";
import { RequestHelper } from "./requestHelper";
import { ProgressLocation } from "vscode";
import { openUri } from "../utils/OpenUri";
import { ViewBase } from "../views/ViewBase";
import { ConnectionDetailsView } from "../views/ConnectionDetailsView";
import { EntityDetailsView } from "../views/EntityDetailsView";
import * as config from "../utils/Config";

export class DataverseHelper {
    private vsstate: State;
    private request: RequestHelper;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {
        this.vsstate = new State(vscontext);
        this.request = new RequestHelper(vscontext, this);
    }

    //#region Public

    public async addConnection(): Promise<IConnection | undefined> {
        //vscode.window.showInformationMessage(`${extensionName}: Connecting to Dataverse`);
        const conn = await this.connectionWizard();
        try {
            if (conn) {
                const tokenResponse = await this.connectInternal(conn.loginType, conn);
                conn.currentAccessToken = tokenResponse.access_token!;
                conn.refreshToken = tokenResponse.refresh_token!;
                this.vsstate.saveInWorkspace(connectionCurrentStoreKey, conn);
            }
        } catch (err) {
            throw err;
        } finally {
            vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
            await this.reloadWorkspaceConnection();
        }

        return conn;
    }

    public async deleteConnection(connItem: DataverseConnectionTreeItem) {
        await this.removeConnection(connItem.label);
        vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
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
                        const tokenResponse = await this.connectInternal(conn.loginType, conn);
                        conn.currentAccessToken = tokenResponse.access_token!;
                        conn.refreshToken = tokenResponse.refresh_token!;
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

    public async reloadWorkspaceConnection(): Promise<IConnection | undefined> {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        if (connFromWS) {
            await this.getEntityDefinitions();
            await this.getWebResources();
            return connFromWS;
        }
        return undefined;
    }

    public getTokenFromCurrentConnection(): string | undefined {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        return connFromWS.currentAccessToken;
    }

    public async getEntityDefinitions() {
        const respData = await this.request.requestData<IEntityMetadata>("EntityDefinitions");
        this.vsstate.saveInWorkspace(entityDefinitionsStoreKey, respData);
        vscode.commands.executeCommand("dvdt.explorer.entities.loadEntities");
    }

    public async getAttributesForEntity(entityLogicalName: string): Promise<IAttributeDefinition[]> {
        const respData = await this.request.requestData<IAttributeMetadata>(`EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`);
        if (respData) {
            return Promise.resolve(respData.value);
        } else {
            return Promise.resolve([]);
        }
    }

    public async getOptionsetForAttribute(entityLogicalName: string, attrLogicalName: string): Promise<IOptionSet> {
        const respData = await this.request.requestData<IOptionSetMetadata>(
            `EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${attrLogicalName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`,
        );
        if (respData) {
            return Promise.resolve(respData.OptionSet);
        } else {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            return Promise.resolve({ Options: [] });
        }
    }

    public async getSolutions(): Promise<ISolutions | undefined> {
        const respData = await this.request.requestData<ISolutions>(
            "solutions?$select=description,friendlyname,ismanaged,isvisible,_publisherid_value,solutionid,uniquename,version&$expand=publisherid($select=customizationprefix)&$filter=ismanaged eq false and  isvisible eq true",
        );
        this.vsstate.saveInWorkspace(solDefinitionsStoreKey, respData);
        return respData;
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
        const respData = await this.request.requestData<IEntityMetadata>(
            "webresourceset?$filter=(Microsoft.Dynamics.CRM.In(PropertyName=%27webresourcetype%27,PropertyValues=[%271%27,%272%27,%273%27])%20and%20ismanaged%20eq%20false%20and%20iscustomizable/Value%20eq%20true%20)",
        );
        this.vsstate.saveInWorkspace(wrDefinitionsStoreKey, respData);
        vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
    }

    public async createWebResource(wr: IWebResource): Promise<string | undefined> {
        return await this.request.postData("webresourceset?$select=webresourceid", JSON.stringify(wr));
    }

    public async updateWebResourceContent(id: string, wr: IWebResource): Promise<string | undefined> {
        return await this.request.patchData(`webresourceset(${id})`, JSON.stringify(wr));
    }

    public async publishWebResource(id: string) {
        var parameters: any = {};
        parameters.ParameterXml = `<importexportxml><webresources><webresource>${id}</webresource></webresources></importexportxml>`;
        let json = JSON.stringify(parameters);
        await this.request.postData("PublishXml", json);
    }

    public async addWRToSolution(solName: string, wrId: string) {
        const solComp: IComponentUpdate = {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ComponentId: wrId,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            SolutionUniqueName: solName,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            AddRequiredComponents: false,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            ComponentType: 61, // Web Resources (https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/solutioncomponent?view=dynamics-ce-odata-9)
        };
        await this.request.postData("AddSolutionComponent", JSON.stringify(solComp));
    }

    public async fetchEntitiesInSolution(solutionId: string) {
        return await this.request.requestData<ISolutionComponents>(`solutioncomponents?$filter=(componenttype%20eq%201%20and%20_solutionid_value%20eq%20${solutionId})`);
    }

    public async fetchWRsInSolution(solutionId: string) {
        return await this.request.requestData<ISolutionComponents>(`solutioncomponents?$filter=(componenttype%20eq%2061%20and%20_solutionid_value%20eq%20${solutionId})`);
    }

    public async reAuthenticate(currentConnection: IConnection): Promise<Token | undefined> {
        let tokenResponse: Token | undefined;

        switch (currentConnection.loginType) {
            case loginTypes[0]:
                tokenResponse = await loginWithUsernamePassword(currentConnection.environmentUrl, currentConnection.userName!, currentConnection.password!);
            case "Client Id and Secret":
                tokenResponse = await loginWithClientIdSecret(currentConnection.environmentUrl, currentConnection.userName!, currentConnection.password!, currentConnection.tenantId!);
            case loginTypes[1]:
                tokenResponse = currentConnection.refreshToken
                    ? await loginWithRefreshToken(customDataverseClientId, currentConnection.environmentUrl, currentConnection.refreshToken)
                    : await loginWithPrompt(customDataverseClientId, false, currentConnection.environmentUrl, openUri, redirectTimeout);
        }

        if (tokenResponse) {
            currentConnection.currentAccessToken = tokenResponse.access_token;
            currentConnection.refreshToken = tokenResponse.refresh_token;
        }

        this.vsstate.saveInWorkspace(connectionCurrentStoreKey, currentConnection);
        return tokenResponse;
    }

    //#endregion Public

    //#region Private
    async connectionWizard(): Promise<IConnection | undefined> {
        let usernameUserResponse: string | undefined;
        let passwordUserResponse: string | undefined;
        let tenantIdResponse: string | undefined;
        let envUrlUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.dataverseEnvironmentURL));
        if (!envUrlUserResponse) {
            vscode.window.showErrorMessage(ErrorMessages.dataverseEnvironmentUrlRequired);
            return undefined;
        }

        let logintypeOptions: string[] = loginTypes;
        if (config.get("enableEarlyAccessPreview") && !logintypeOptions.includes("Client Id and Secret")) {
            logintypeOptions.push("Client Id and Secret");
        }
        let logintypeOptionsQuickPick: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.logintype);
        let logintypeResponse: string | undefined = await vscode.window.showQuickPick(logintypeOptions, logintypeOptionsQuickPick);

        switch (logintypeResponse) {
            case loginTypes[0]:
                // Username/Password
                usernameUserResponse = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.userName));
                if (!usernameUserResponse) {
                    vscode.window.showErrorMessage(ErrorMessages.usernameRequired);
                    return undefined;
                }

                passwordUserResponse = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.password));
                if (!passwordUserResponse) {
                    vscode.window.showErrorMessage(ErrorMessages.passwordRequired);
                    return undefined;
                }
                break;
            case "Client Id and Secret":
                // Client Id / Secret
                usernameUserResponse = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.clientId));
                if (!usernameUserResponse) {
                    vscode.window.showErrorMessage(ErrorMessages.clientIdRequired);
                    return undefined;
                }

                passwordUserResponse = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.clientSecret));
                if (!passwordUserResponse) {
                    vscode.window.showErrorMessage(ErrorMessages.clientSecretRequired);
                    return undefined;
                }

                tenantIdResponse = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.tenantId));
                if (!tenantIdResponse) {
                    vscode.window.showErrorMessage(ErrorMessages.tenantIdRequired);
                    return undefined;
                }
                break;
            case loginTypes[1]:
            default:
                logintypeResponse = loginTypes[1];
                break;
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
            loginType: logintypeResponse,
            userName: usernameUserResponse,
            password: passwordUserResponse,
            tenantId: tenantIdResponse,
            connectionName: connNameUserResponse,
        };

        if (typeResponse) {
            conn.environmentType = typeResponse;
        }

        this.saveConnection(conn);
        return conn;
    }

    async connectInternal(loginType: string, conn: IConnection): Promise<Token> {
        switch (loginType) {
            case loginTypes[0]:
                return await loginWithUsernamePassword(conn.environmentUrl, conn.userName!, conn.password!);
            case "Client Id and Secret":
                return await loginWithClientIdSecret(conn.environmentUrl, conn.userName!, conn.password!, conn.tenantId!);
            case loginTypes[1]:
            default:
                return await loginWithPrompt(customDataverseClientId, false, conn.environmentUrl, openUri, redirectTimeout);
        }
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
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        if (connFromWS && connFromWS.connectionName === connName) {
            return connFromWS;
        } else {
            const jsonConn: string = this.vsstate.getFromGlobal(connectionStoreKey);
            if (jsonConn) {
                const conns: IConnection[] = JSON.parse(jsonConn);
                return conns.find((c) => c.connectionName === connName);
            }
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
    //#endregion Private
}

async function redirectTimeout(): Promise<void> {}
