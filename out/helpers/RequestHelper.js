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
exports.RequestHelper = void 0;
const node_fetch_1 = require("node-fetch");
const uuid_1 = require("uuid");
const Constants_1 = require("../utils/Constants");
const State_1 = require("../utils/State");
const Login_1 = require("../login/Login");
class RequestHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context, dvHelper) {
        this.dvHelper = dvHelper;
        this.vsstate = new State_1.State(context);
    }
    requestData(query, retries) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentConnection = this.vsstate.getFromWorkspace(Constants_1.connectionCurrentStoreKey);
                const requestUrl = `${currentConnection.environmentUrl}${Constants_1.apiPartUrl}${query}`;
                const response = yield node_fetch_1.default(requestUrl, {
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: `Bearer ${currentConnection.currentAccessToken}`,
                        "x-ms-client-request-id": uuid_1.v4(),
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "Content-Type": "application/json; charset=utf-8",
                    },
                });
                if (response.ok) {
                    return (yield response.json());
                }
                else {
                    if (response.statusText === "Unauthorized" && this.dvHelper) {
                        if (retries && retries > Constants_1.maxRetries) {
                            return undefined;
                        }
                        const tokenResponse = yield Login_1.loginWithUsernamePassword(currentConnection.environmentUrl, currentConnection.userName, currentConnection.password);
                        currentConnection.currentAccessToken = tokenResponse.access_token;
                        this.vsstate.saveInWorkspace(Constants_1.connectionCurrentStoreKey, currentConnection);
                        return this.requestData(query, retries ? retries + 1 : 1);
                    }
                    else {
                        return undefined;
                    }
                }
            }
            catch (err) {
                console.log(err);
                throw err;
            }
        });
    }
    createData(query, data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentConnection = this.vsstate.getFromWorkspace(Constants_1.connectionCurrentStoreKey);
                const requestUrl = `${currentConnection.environmentUrl}${Constants_1.apiPartUrl}${query}`;
                const response = yield node_fetch_1.default(requestUrl, {
                    method: "POST",
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: `Bearer ${currentConnection.currentAccessToken}`,
                        // "x-ms-client-request-id": uuid(),
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "Content-Type": "application/json",
                    },
                    body: data,
                    redirect: "follow",
                });
                if (response.ok) {
                    return response.headers.get("OData-EntityId") !== null ? (_a = response.headers.get("OData-EntityId")) === null || _a === void 0 ? void 0 : _a.toString() : undefined;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    updateData(query, data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentConnection = this.vsstate.getFromWorkspace(Constants_1.connectionCurrentStoreKey);
                const requestUrl = `${currentConnection.environmentUrl}${Constants_1.apiPartUrl}${query}`;
                const response = yield node_fetch_1.default(requestUrl, {
                    method: "PATCH",
                    headers: {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Authorization: `Bearer ${currentConnection.currentAccessToken}`,
                        // "x-ms-client-request-id": uuid(),
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        "Content-Type": "application/json",
                    },
                    body: data,
                    redirect: "follow",
                });
                if (response.ok) {
                    return response.headers.get("OData-EntityId") !== null ? (_a = response.headers.get("OData-EntityId")) === null || _a === void 0 ? void 0 : _a.toString() : undefined;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.RequestHelper = RequestHelper;
//# sourceMappingURL=RequestHelper.js.map