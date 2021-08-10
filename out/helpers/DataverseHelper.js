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
exports.DataverseHelper = void 0;
const vscode = require("vscode");
const Login_1 = require("../login/Login");
const Placeholders_1 = require("../utils/Placeholders");
const ErrorMessages_1 = require("../utils/ErrorMessages");
const State_1 = require("../utils/State");
const Constants_1 = require("../utils/Constants");
const RequestHelper_1 = require("./RequestHelper");
const vscode_1 = require("vscode");
const OpenUri_1 = require("../utils/OpenUri");
const ConnectionDetailsView_1 = require("../views/ConnectionDetailsView");
const EntityDetailsView_1 = require("../views/EntityDetailsView");
class DataverseHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext) {
        this.vscontext = vscontext;
        this.vsstate = new State_1.State(vscontext);
        this.request = new RequestHelper_1.RequestHelper(vscontext, this);
    }
    //#region Public
    addConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            //vscode.window.showInformationMessage(`${extensionName}: Connecting to Dataverse`);
            const conn = yield this.connectionWizard();
            try {
                if (conn) {
                    const tokenResponse = yield Login_1.loginWithUsernamePassword(conn.environmentUrl, conn.userName, conn.password);
                    conn.currentAccessToken = tokenResponse.access_token;
                    this.vsstate.saveInWorkspace(Constants_1.connectionCurrentStoreKey, conn);
                }
            }
            catch (err) {
                throw err;
            }
            finally {
                vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
            }
            return conn;
        });
    }
    deleteConnection(connItem) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeConnection(connItem.label);
            vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
        });
    }
    connectToDataverse(connItem) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const conn = this.getConnectionByName(connItem.label);
                if (conn) {
                    return vscode.window.withProgress({
                        location: vscode_1.ProgressLocation.Notification,
                    }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                        token.onCancellationRequested(() => {
                            console.log("User canceled the long running operation");
                            return;
                        });
                        progress.report({ increment: 0, message: "Connecting to environment..." });
                        const tokenResponse = yield Login_1.loginWithUsernamePassword(conn.environmentUrl, conn.userName, conn.password);
                        conn.currentAccessToken = tokenResponse.access_token;
                        progress.report({ increment: 10 });
                        this.vsstate.saveInWorkspace(Constants_1.connectionCurrentStoreKey, conn);
                        progress.report({ increment: 30, message: "Getting entity metadata..." });
                        yield this.getEntityDefinitions();
                        progress.report({ increment: 70, message: "Getting web resources..." });
                        yield this.getWebResources();
                        return new Promise((resolve) => {
                            resolve(conn);
                        });
                    }));
                }
                else {
                    return undefined;
                }
            }
            catch (err) { }
        });
    }
    reloadWorkspaceConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            const connFromWS = this.vsstate.getFromWorkspace(Constants_1.connectionCurrentStoreKey);
            if (connFromWS) {
                yield this.getEntityDefinitions();
                yield this.getWebResources();
                return connFromWS;
            }
            return undefined;
        });
    }
    getEntityDefinitions() {
        return __awaiter(this, void 0, void 0, function* () {
            const respData = yield this.request.requestData("EntityDefinitions");
            this.vsstate.saveInWorkspace(Constants_1.entityDefinitionsStoreKey, respData);
            vscode.commands.executeCommand("dvdt.explorer.entities.loadEntities");
        });
    }
    getAttributesForEntity(entityLogicalName) {
        return __awaiter(this, void 0, void 0, function* () {
            const respData = yield this.request.requestData(`EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes`);
            if (respData) {
                return Promise.resolve(respData.value);
            }
            else {
                return Promise.resolve([]);
            }
        });
    }
    getOptionsetForAttribute(entityLogicalName, attrLogicalName) {
        return __awaiter(this, void 0, void 0, function* () {
            const respData = yield this.request.requestData(`EntityDefinitions(LogicalName='${entityLogicalName}')/Attributes(LogicalName='${attrLogicalName}')/Microsoft.Dynamics.CRM.PicklistAttributeMetadata?$select=LogicalName&$expand=OptionSet($select=Options),GlobalOptionSet($select=Options)`);
            if (respData) {
                return Promise.resolve(respData.OptionSet);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                return Promise.resolve({ Options: [] });
            }
        });
    }
    getSolutions() {
        return __awaiter(this, void 0, void 0, function* () {
            const respData = yield this.request.requestData("solutions?$select=description,friendlyname,ismanaged,isvisible,_publisherid_value,solutionid,uniquename,version&$expand=publisherid($select=customizationprefix)&$filter=ismanaged eq false and  isvisible eq true");
            this.vsstate.saveInWorkspace(Constants_1.solDefinitionsStoreKey, respData);
            return respData;
        });
    }
    openEnvironment(connItem) {
        const conn = this.getConnectionByName(connItem.label);
        if (conn) {
            OpenUri_1.openUri(conn.environmentUrl);
        }
    }
    showEnvironmentDetails(connItem, view) {
        return __awaiter(this, void 0, void 0, function* () {
            const conn = this.getConnectionByName(connItem.label);
            if (conn) {
                const webview = yield view.getWebView({ type: "showEnvironmentDetails", title: "Show Environment Details" });
                new ConnectionDetailsView_1.ConnectionDetailsView(conn, webview, this.vscontext);
            }
        });
    }
    showEntityDetails(enItem, view) {
        return __awaiter(this, void 0, void 0, function* () {
            const en = this.getEntityByName(enItem.desc);
            if (en) {
                en.Attributes = { value: yield this.getAttributesForEntity(en.LogicalName) };
                const webview = yield view.getWebView({ type: "showEntityDetails", title: "Show Entity Details" });
                new EntityDetailsView_1.EntityDetailsView(en, webview, this.vscontext);
            }
        });
    }
    getWebResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const respData = yield this.request.requestData("webresourceset?$filter=(Microsoft.Dynamics.CRM.In(PropertyName=%27webresourcetype%27,PropertyValues=[%271%27,%272%27,%273%27])%20and%20ismanaged%20eq%20false%20and%20iscustomizable/Value%20eq%20true%20)");
            this.vsstate.saveInWorkspace(Constants_1.wrDefinitionsStoreKey, respData);
            vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
        });
    }
    createWebResource(wr) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.request.createData("webresourceset?$select=webresourceid", JSON.stringify(wr));
        });
    }
    addWRToSolution(solName, wrId) {
        return __awaiter(this, void 0, void 0, function* () {
            const solComp = {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                ComponentId: wrId,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                SolutionUniqueName: solName,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                AddRequiredComponents: false,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                ComponentType: 61, // Web Resources (https://docs.microsoft.com/en-us/dynamics365/customer-engagement/web-api/solutioncomponent?view=dynamics-ce-odata-9)
            };
            yield this.request.createData("AddSolutionComponent", JSON.stringify(solComp));
        });
    }
    //#endregion Public
    connectionWizard() {
        return __awaiter(this, void 0, void 0, function* () {
            let envUrlUserResponse = yield vscode.window.showInputBox(Placeholders_1.Placeholders.getInputBoxOptions(Placeholders_1.Placeholders.dataverseEnvironmentURL));
            if (!envUrlUserResponse) {
                vscode.window.showErrorMessage(ErrorMessages_1.ErrorMessages.dataverseEnvironmentUrlRequired);
                return undefined;
            }
            let usernameUserResponse = yield vscode.window.showInputBox(Placeholders_1.Placeholders.getInputBoxOptions(Placeholders_1.Placeholders.userName));
            if (!usernameUserResponse) {
                vscode.window.showErrorMessage(ErrorMessages_1.ErrorMessages.usernameRequired);
                return undefined;
            }
            let passwordUserResponse = yield vscode.window.showInputBox(Placeholders_1.Placeholders.getInputBoxOptions(Placeholders_1.Placeholders.password));
            if (!passwordUserResponse) {
                vscode.window.showErrorMessage(ErrorMessages_1.ErrorMessages.passwordRequired);
                return undefined;
            }
            let connNameUserResponse = yield vscode.window.showInputBox(Placeholders_1.Placeholders.getInputBoxOptions(Placeholders_1.Placeholders.connectionName));
            if (!connNameUserResponse) {
                vscode.window.showErrorMessage(ErrorMessages_1.ErrorMessages.connNameRequired);
                return undefined;
            }
            let typeOptions = Constants_1.environmentTypes;
            let typeOptionsQuickPick = Placeholders_1.Placeholders.getQuickPickOptions(Placeholders_1.Placeholders.connectionType);
            let typeResponse = yield vscode.window.showQuickPick(typeOptions, typeOptionsQuickPick);
            let conn = {
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
        });
    }
    saveConnection(connDetail) {
        if (!this.getConnectionByName(connDetail.connectionName)) {
            const jsonConn = this.vsstate.getFromGlobal(Constants_1.connectionStoreKey);
            if (jsonConn) {
                const conns = JSON.parse(jsonConn);
                conns.push(connDetail);
                this.vsstate.saveInGlobal(Constants_1.connectionStoreKey, JSON.stringify(conns));
            }
            else {
                const conns = [];
                conns.push(connDetail);
                this.vsstate.saveInGlobal(Constants_1.connectionStoreKey, JSON.stringify(conns));
            }
        }
        else {
            vscode.window.showErrorMessage(`Connection with same name already exists. Please re-create the connection with a different name.`);
        }
    }
    removeConnection(connName) {
        return __awaiter(this, void 0, void 0, function* () {
            const respDeleteConfirm = yield vscode.window.showWarningMessage("Are you sure you want to delete this connection?", { detail: "Confirm your selection", modal: true }, "Yes", "No");
            if (respDeleteConfirm === "Yes") {
                const jsonConn = this.vsstate.getFromGlobal(Constants_1.connectionStoreKey);
                if (jsonConn) {
                    const conns = JSON.parse(jsonConn);
                    const resultConn = conns.find((c) => c.connectionName === connName);
                    const indexConnToRemove = conns.indexOf(resultConn, 0);
                    if (indexConnToRemove > -1) {
                        conns.splice(indexConnToRemove, 1);
                    }
                    if (conns.length > 0) {
                        this.vsstate.saveInGlobal(Constants_1.connectionStoreKey, JSON.stringify(conns));
                    }
                    else {
                        this.vsstate.unsetFromGlobal(Constants_1.connectionStoreKey);
                    }
                }
            }
        });
    }
    getConnectionByName(connName) {
        const connFromWS = this.vsstate.getFromWorkspace(Constants_1.connectionCurrentStoreKey);
        if (connFromWS && connFromWS.connectionName === connName) {
            return connFromWS;
        }
        else {
            const jsonConn = this.vsstate.getFromGlobal(Constants_1.connectionStoreKey);
            if (jsonConn) {
                const conns = JSON.parse(jsonConn);
                return conns.find((c) => c.connectionName === connName);
            }
        }
        return undefined;
    }
    getEntityByName(entityName) {
        const jsonEntities = this.vsstate.getFromWorkspace(Constants_1.entityDefinitionsStoreKey);
        if (jsonEntities) {
            return jsonEntities.value.find((e) => e.SchemaName.toLowerCase() === entityName);
        }
        return undefined;
    }
}
exports.DataverseHelper = DataverseHelper;
//# sourceMappingURL=DataverseHelper.js.map