import * as vscode from "vscode";
import { loginWithAzure, loginWithClientIdSecret, loginWithPrompt, loginWithRefreshToken, loginWithUsernamePassword } from "../login/login";
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
    IWebResources,
} from "../utils/Interfaces";
import {
    connectionCurrentStoreKey,
    connectionStoreKey,
    customDataverseClientId,
    entityDefinitionsStoreKey,
    environmentTypes,
    LoginTypes,
    reservedWords,
    solDefinitionsStoreKey,
    wrDefinitionsStoreKey,
} from "../utils/Constants";
import { DataverseConnectionTreeItem } from "../trees/dataverseConnectionDataProvider";
import { RequestHelper } from "./requestHelper";
import { ProgressLocation } from "vscode";
import { openUri } from "../utils/OpenUri";
import { ViewBase } from "../views/ViewBase";
import { ConnectionDetailsView } from "../views/ConnectionDetailsView";
import { EntityDetailsView } from "../views/EntityDetailsView";
import { EntitiesTreeItem } from "../trees/entitiesDataProvider";
import { updateConnectionStatusBar } from "../commands/registerCommands";
import { EntityListView } from "../views/EntityListView";

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

    /**
     * Adds a new connection
     * @returns The connection object.
     */
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

    /**
     * Delete a connection from the list of connections.
     * @param {DataverseConnectionTreeItem} connItem - DataverseConnectionTreeItem
     */
    public async deleteConnection(connItem: DataverseConnectionTreeItem) {
        await this.removeConnection(connItem.label);
        vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
    }

    /**
     * Delete all connections from the connections list.
     */
    public async deleteAllConnections() {
        await this.removeAllConnections();
        vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
    }

    /**
     * Connect to a Dataverse environment and retrieve the entity metadata and web resources.
     * @param {DataverseConnectionTreeItem} connItem - DataverseConnectionTreeItem
     * @returns The connection object.
     */
    public async connectToDataverse(connItem: DataverseConnectionTreeItem): Promise<IConnection | undefined> {
        const conn: IConnection | undefined = this.getConnectionByName(connItem.label);
        if (conn) {
            return vscode.window.withProgress(
                {
                    location: ProgressLocation.Notification,
                    cancellable: true,
                    title: "Connecting to Dataverse",
                },
                async (progress, token) => {
                    token.onCancellationRequested(() => {
                        console.log("User canceled the long running operation");
                        return;
                    });
                    progress.report({ increment: 0, message: "Connecting to environment..." });
                    const tokenResponse = await this.connectInternal(conn.loginType, conn);
                    conn.currentAccessToken = tokenResponse.access_token!;
                    if (tokenResponse.access_token) {
                        switch (conn.loginType) {
                            case LoginTypes.clientIdSecret:
                                conn.userName = JSON.parse(Buffer.from(tokenResponse.access_token.split(".")[1], "base64").toString())?.appid;
                                break;
                            case LoginTypes.userNamePassword:
                            case LoginTypes.azure:
                            case LoginTypes.microsoftLogin:
                            default:
                                conn.userName = JSON.parse(Buffer.from(tokenResponse.access_token.split(".")[1], "base64").toString())?.upn;
                                break;
                        }
                    }
                    conn.refreshToken = tokenResponse.refresh_token!;
                    progress.report({ increment: 10 });
                    this.vsstate.saveInWorkspace(connectionCurrentStoreKey, conn);
                    progress.report({ increment: 30, message: "Getting entity metadata..." });
                    await this.getEntityDefinitions();
                    progress.report({ increment: 70, message: "Getting web resources..." });
                    await this.getWebResources();

                    vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
                    return new Promise<IConnection>((resolve) => {
                        resolve(conn);
                    });
                },
            );
        } else {
            return undefined;
        }
    }

    /**
     * Forget the current workspace connection.
     */
    public forgetCurrentWorkspaceConnection() {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        if (connFromWS) {
            this.vsstate.unsetFromWorkspace(connectionCurrentStoreKey);
            vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
        }
    }

    /**
     * * Get the connection from the workspace if it exists.
     * @returns The connection object.
     */
    public async reloadWorkspaceConnection(): Promise<IConnection | undefined> {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        if (connFromWS) {
            await this.getEntityDefinitions();
            await this.getWebResources();
            return connFromWS;
        }
        return undefined;
    }

    /**
     * Get the current access token from the current connection.
     * @returns The current access token.
     */
    public getTokenFromCurrentConnection(): string | undefined {
        const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
        return connFromWS.currentAccessToken;
    }

    /**
     * Get the entty definition from the current connection.
     */
    public async getEntityDefinitions() {
        const respData = await this.request.requestData<IEntityMetadata>("EntityDefinitions");
        this.vsstate.saveInWorkspace(entityDefinitionsStoreKey, respData);
        vscode.commands.executeCommand("dvdt.explorer.entities.loadEntities");
    }

    /**
     * Get the attributes for an entity from the current connection.
     * @param {string} entityLogicalName - The logical name of the entity to retrieve attributes for.
     * @returns The response data is an array of attribute metadata objects.
     */
    public async getAttributesForEntity(entityLogicalName: string): Promise<IAttributeDefinition[]> {
        const respData = await this.request.requestData<IAttributeMetadata>(`EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`);
        if (respData) {
            return Promise.resolve(respData.value);
        } else {
            return Promise.resolve([]);
        }
    }

    /**
     * Get the OptionSet for an attribute.
     * @param {string} entityLogicalName - The logical name of the entity.
     * @param {string} attrLogicalName - The logical name of the attribute.
     * @returns The optionset for the attribute.
     */
    public async getOptionsetForAttribute(entityLogicalName: string, attrLogicalName: string): Promise<IOptionSet> {

        if (attrLogicalName === 'statecode') {
            return await this.innerGetOptionsetForAttribute(entityLogicalName, attrLogicalName, "Microsoft.Dynamics.CRM.StateAttributeMetadata");
        } else if (attrLogicalName === 'statuscode') {
            return await this.innerGetOptionsetForAttribute(entityLogicalName, attrLogicalName, "Microsoft.Dynamics.CRM.StatusAttributeMetadata");
        } else {
            return await this.innerGetOptionsetForAttribute(entityLogicalName, attrLogicalName, "Microsoft.Dynamics.CRM.PicklistAttributeMetadata");
        }
    }

    /**
     * Get the OptionSet for an multi select attribute.
     * @param {string} entityLogicalName - The logical name of the entity.
     * @param {string} attrLogicalName - The logical name of the attribute.
     * @returns The optionset for the attribute.
     */
    public async getMultiSelectOptionsetForAttribute(entityLogicalName: string, attrLogicalName: string): Promise<IOptionSet> {
        return await this.innerGetOptionsetForAttribute(entityLogicalName, attrLogicalName, "Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata");
    }

    /**
     * Get the solutions from the current connection.
     * @returns The solutions are returned as an array of objects.
     */
    public async getSolutions(): Promise<ISolutions | undefined> {
        const respData = await this.request.requestData<ISolutions>(
            "solutions?$select=description,friendlyname,ismanaged,isvisible,_publisherid_value,solutionid,uniquename,version&$expand=publisherid($select=customizationprefix)&$filter=ismanaged eq false and  isvisible eq true",
        );
        this.vsstate.saveInWorkspace(solDefinitionsStoreKey, respData);
        return respData;
    }

    /**
     * Open the environment URL for the connection.
     * @param {DataverseConnectionTreeItem} connItem - DataverseConnectionTreeItem
     */
    public openEnvironment(connItem: DataverseConnectionTreeItem) {
        const conn: IConnection | undefined = this.getConnectionByName(connItem.label);
        if (conn) {
            openUri(conn.environmentUrl);
        }
    }

    /**
     * Show the details of the environment for the current connection.
     * @param {DataverseConnectionTreeItem} connItem - DataverseConnectionTreeItem
     * @param {ViewBase} view - ViewBase - the view that is calling this method.
     */
    public async showEnvironmentDetails(connItem: DataverseConnectionTreeItem, view: ViewBase) {
        const conn: IConnection | undefined = this.getConnectionByName(connItem.label);
        if (conn) {
            const webview = await view.getWebView({ type: "showEnvironmentDetails", title: "Show Environment Details" });
            new ConnectionDetailsView(conn, webview, this.vscontext);
        }
    }

    /**
     * Show the details of the entity for the current connection.
     * @param {string} entityName - EntityName of tree item that was selected.
     * @param {ViewBase} view - ViewBase - The view that is calling this method.
     */
    public async showEntityDetails(entityName: string, view: ViewBase) {
        const en: IEntityDefinition | undefined = this.getEntityByName(entityName);
        if (en) {
            en.Attributes = { value: await this.getAttributesForEntity(en.LogicalName) };
            const webview = await view.getWebView({ type: "showEntityDetails", title: `Entity Details: ${entityName}` });
            new EntityDetailsView(en, webview, this.vscontext);
        }
    }

    /**
     * Show the details of the entity for the current connection.
     * @param {ViewBase} view - ViewBase - The view that is calling this method.
     */
    public async showMetadataExplorer(view: ViewBase) {
        const vsstate = new State(this.vscontext);
        const jsonConn: IEntityMetadata = vsstate.getFromWorkspace(entityDefinitionsStoreKey);

        let entities: IEntityDefinition[] = [];

        if (jsonConn) {
            entities = jsonConn.value;
        }

        const webview = await view.getWebView({ type: "showEntityList", title: "Show Entity List" });
        new EntityListView(entities, webview, this.vscontext);
    }

    /**
     * Get all the web resources from the CRM system and save them in the VS Code workspace.
     */
    public async getWebResources() {
        const respData = await this.request.requestData<IWebResources>(
            "webresourceset?$filter=(ismanaged%20eq%20false%20and%20iscustomizable/Value%20eq%20true%20)",
        );
        this.vsstate.saveInWorkspace(wrDefinitionsStoreKey, respData);
        vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
    }

    /**
     * Gets the web resource content
     * @param {string} wrId - The ID of the web resource to retrieve.
     * @returns The content of the web resource.
     */
    public async getWebResourceContent(wrId: string): Promise<string | undefined> {
        const selectedWR = await this.request.requestData<IWebResource>(`webresourceset(${wrId})?$select=content`);
        if (selectedWR) {
            return selectedWR.content;
        }
    }

    /**
     * Create a new web resource.
     * @param {IWebResource} wr - IWebResource
     * @returns The webresourceid of the newly created webresource.
     */
    public async createWebResource(wr: IWebResource): Promise<string | undefined> {
        return await this.request.postData("webresourceset?$select=webresourceid", JSON.stringify(wr));
    }

    /**
     * Update the content of a web resource.
     * @param {string} id - The ID of the web resource to update.
     * @param {IWebResource} wr - IWebResource
     * @returns The ID of the web resource.
     */
    public async updateWebResourceContent(id: string, wr: IWebResource): Promise<string | undefined> {
        return await this.request.patchData(`webresourceset(${id})`, JSON.stringify(wr));
    }

    /**
     * Publish a web resource to the site.
     * @param {string} id - The ID of the web resource to publish.
     */
    public async publishWebResource(id: string) {
        var parameters: any = {};
        parameters.ParameterXml = `<importexportxml><webresources><webresource>${id}</webresource></webresources></importexportxml>`;
        let json = JSON.stringify(parameters);
        await this.request.postData("PublishXml", json);
    }

    /**
     * Add a Web Resource to a solution.
     * @param {string} solName - The name of the solution to add the web resource to.
     * @param {string} wrId - The ID of the Web Resource to add to the solution.
     */
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

    /**
     * Fetches entities in a solution
     * @param {string} solutionId - The ID of the solution to fetch components for.
     * @returns The data is returned as a list of objects. Each object represents a component in the
     * solution.
     */
    public async fetchEntitiesInSolution(solutionId: string) {
        return await this.request.requestData<ISolutionComponents>(`solutioncomponents?$filter=(componenttype%20eq%201%20and%20_solutionid_value%20eq%20${solutionId})`);
    }

    /**
     * Fetches the web resources in a solution
     * @param {string} solutionId - The ID of the solution to fetch the components for.
     * @returns The data is returned as a list of objects. Each object represents a single record.
     */
    public async fetchWRsInSolution(solutionId: string) {
        return await this.request.requestData<ISolutionComponents>(`solutioncomponents?$filter=(componenttype%20eq%2061%20and%20_solutionid_value%20eq%20${solutionId})`);
    }

    /**
     * Re-authenticate the current connection.
     * @param {IConnection} currentConnection - IConnection
     * @returns The token response.
     */
    public async reAuthenticate(currentConnection: IConnection): Promise<Token | undefined> {
        let tokenResponse: Token | undefined;

        if (currentConnection.refreshToken) {
            tokenResponse = await loginWithRefreshToken(customDataverseClientId, currentConnection.environmentUrl, currentConnection.refreshToken);
        }

        if (!tokenResponse) {
            switch (currentConnection.loginType) {
                case LoginTypes.userNamePassword:
                    tokenResponse = await loginWithUsernamePassword(currentConnection.environmentUrl, currentConnection.userName!, currentConnection.password!);
                    break;
                case LoginTypes.clientIdSecret:
                    tokenResponse = await loginWithClientIdSecret(currentConnection.environmentUrl, currentConnection.userName!, currentConnection.password!, currentConnection.tenantId!);
                    break;
                case LoginTypes.microsoftLogin:
                    tokenResponse = await loginWithPrompt(customDataverseClientId, false, currentConnection.environmentUrl, openUri, redirectTimeout);
                    break;
                case LoginTypes.azure:
                    tokenResponse = await loginWithAzure(currentConnection.environmentUrl);
                    break;
            }
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
    private async connectionWizard(): Promise<IConnection | undefined> {
        let usernameUserResponse: string | undefined;
        let passwordUserResponse: string | undefined;
        let tenantIdResponse: string | undefined;
        let envUrlUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.dataverseEnvironmentURL));
        if (!envUrlUserResponse) {
            vscode.window.showErrorMessage(ErrorMessages.dataverseEnvironmentUrlRequired);
            return undefined;
        }

        let logintypeOptions: string[] = Object.keys(LoginTypes).map((loginType) => LoginTypes[loginType as keyof typeof LoginTypes]);
        let logintypeOptionsQuickPick: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.logintype);
        let logintypeResponse = (await vscode.window.showQuickPick(logintypeOptions, logintypeOptionsQuickPick)) ?? "";
        const selectedLogin = logintypeResponse as LoginTypes;
        switch (selectedLogin) {
            case LoginTypes.userNamePassword:
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
            case LoginTypes.clientIdSecret:
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
            case LoginTypes.azure:
                logintypeResponse = LoginTypes.azure;
                break;
            case LoginTypes.microsoftLogin:
            default:
                logintypeResponse = LoginTypes.microsoftLogin;
                break;
        }

        let connNameUserResponse: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.connectionName));
        if (connNameUserResponse && reservedWords.includes(connNameUserResponse)) {
            vscode.window.showErrorMessage(ErrorMessages.connNameReservedWords);
            return undefined;
        }
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

    private async connectInternal(loginType: string, conn: IConnection): Promise<Token> {
        switch (loginType) {
            case LoginTypes.userNamePassword:
                return await loginWithUsernamePassword(conn.environmentUrl, conn.userName!, conn.password!);
            case LoginTypes.clientIdSecret:
                return await loginWithClientIdSecret(conn.environmentUrl, conn.userName!, conn.password!, conn.tenantId!);
            case LoginTypes.azure:
                return await loginWithAzure(conn.environmentUrl);
            case LoginTypes.microsoftLogin:
            default:
                return await loginWithPrompt(customDataverseClientId, false, conn.environmentUrl, openUri, redirectTimeout);
        }
    }

    private saveConnection(connDetail: IConnection) {
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

    private async removeConnection(connName: string) {
        const respDeleteConfirm = await vscode.window.showWarningMessage("Are you sure you want to delete this connection?", { detail: "Confirm your selection", modal: true }, "Yes", "No");
        if (respDeleteConfirm === "Yes") {
            this.removeConnectionInternal(connName);
        }
    }

    private async removeAllConnections() {
        const respDeleteConfirm = await vscode.window.showWarningMessage("Are you sure you want to delete ALL connections?", { detail: "Confirm your selection", modal: true }, "Yes", "No");
        if (respDeleteConfirm === "Yes") {
            const jsonConn: string = this.vsstate.getFromGlobal(connectionStoreKey);
            if (jsonConn) {
                const conns: IConnection[] = JSON.parse(jsonConn);
                conns.forEach((c) => {
                    this.removeConnectionInternal(c.connectionName);
                });
            }
        }
    }

    private removeConnectionInternal(connName: string) {
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

            const connFromWS: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
            if (connFromWS && connFromWS.connectionName === connName) {
                this.vsstate.unsetFromWorkspace(connectionCurrentStoreKey);
                updateConnectionStatusBar(undefined);
            }
        }
    }

    private getConnectionByName(connName: string): IConnection | undefined {
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

    private getEntityByName(entityName: string): IEntityDefinition | undefined {
        const jsonEntities: IEntityMetadata = this.vsstate.getFromWorkspace(entityDefinitionsStoreKey);
        if (jsonEntities) {
            return jsonEntities.value.find((e) => e.SchemaName.toLowerCase() === entityName);
        }

        return undefined;
    }


    private async innerGetOptionsetForAttribute(entityLogicalName: string, attrLogicalName: string, metadataType: string): Promise<IOptionSet> {

        let url = `EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${attrLogicalName}')/${metadataType}?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`;

        const respData = await this.request.requestData<IOptionSetMetadata>(url);
        if (respData) {
            return Promise.resolve(respData.OptionSet);
        } else {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            return Promise.resolve({ Options: [] });
        }
    }
    //#endregion Private
}

async function redirectTimeout(): Promise<void> { }
