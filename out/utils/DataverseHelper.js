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
const login_1 = require("../login/login");
const Placeholders_1 = require("./Placeholders");
const ErrorMessages_1 = require("./ErrorMessages");
const State_1 = require("./State");
const Constants_1 = require("./Constants");
const RequestHelper_1 = require("./RequestHelper");
const vscode_1 = require("vscode");
const OpenUri_1 = require("./OpenUri");
const ConnectionDetailsView_1 = require("../views/ConnectionDetailsView");
const EntityDetailsView_1 = require("../views/EntityDetailsView");
class DataverseHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext) {
        this.vscontext = vscontext;
        this.vsstate = new State_1.State(vscontext);
        this.request = new RequestHelper_1.RequestHelper(vscontext);
    }
    addConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            //vscode.window.showInformationMessage(`${extensionName}: Connecting to Dataverse`);
            const conn = yield this.connectionWizard();
            try {
                if (conn) {
                    const tokenResponse = yield login_1.loginWithUsernamePassword(conn.environmentUrl, conn.userName, conn.password);
                    conn.currentAccessToken = tokenResponse.access_token;
                    this.vsstate.saveInWorkspace(Constants_1.connectionCurrentStoreKey, conn);
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
            }
            catch (err) {
                throw err;
            }
            finally {
                vscode.commands.executeCommand("dvExplorer.refreshConnection");
            }
            return conn;
        });
    }
    deleteConnection(connItem) {
        return __awaiter(this, void 0, void 0, function* () {
            this.removeConnection(connItem.label);
            vscode.commands.executeCommand("dvExplorer.refreshConnection");
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
                        const tokenResponse = yield login_1.loginWithUsernamePassword(conn.environmentUrl, conn.userName, conn.password);
                        conn.currentAccessToken = tokenResponse.access_token;
                        progress.report({ increment: 30 });
                        this.vsstate.saveInWorkspace(Constants_1.connectionCurrentStoreKey, conn);
                        progress.report({ increment: 50, message: "Getting entity metadata..." });
                        yield this.getEntityDefinitions();
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
    getEntityDefinitions() {
        return __awaiter(this, void 0, void 0, function* () {
            const respData = yield this.request.requestData("EntityDefinitions");
            // let inc: number = 30,
            //     cnt: number = respData!.value.length,
            //     incValue: number = (100 - inc) / cnt;
            // console.log(incValue);
            // respData?.value.forEach(async (ed) => {
            //     pg.progress.report({ increment: inc + incValue, message: "Getting attributes: " + ed.LogicalName });
            //     ed.Attributes = await this.getAttributesForEntity(ed);
            //     inc = inc + incValue;
            // });
            this.vsstate.saveInWorkspace(Constants_1.entityDefinitionsStoreKey, respData);
            vscode.commands.executeCommand("dvExplorer.loadEntities");
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
        const jsonConn = this.vsstate.getFromGlobal(Constants_1.connectionStoreKey);
        if (jsonConn) {
            const conns = JSON.parse(jsonConn);
            return conns.find((c) => c.connectionName === connName);
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