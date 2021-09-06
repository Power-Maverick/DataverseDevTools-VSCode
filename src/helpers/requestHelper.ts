import * as vscode from "vscode";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import { apiPartUrl, connectionCurrentStoreKey, defaultDataverseClientId, loginTypes, maxRetries } from "../utils/Constants";
import { IConnection } from "../utils/Interfaces";
import { State } from "../utils/State";
import { DataverseHelper } from "./dataverseHelper";
import { loginWithPrompt, loginWithRefreshToken, loginWithUsernamePassword } from "../login/login";
import { openUri } from "../utils/OpenUri";

export class RequestHelper {
    private vsstate: State;
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context: vscode.ExtensionContext, private dvHelper: DataverseHelper) {
        this.vsstate = new State(context);
    }

    async requestData<T>(query: string, retries?: number): Promise<T | undefined> {
        try {
            const currentConnection: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);

            const requestUrl = `${currentConnection.environmentUrl}${apiPartUrl}${query}`;
            const response = await fetch(requestUrl, {
                headers: {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Authorization: `Bearer ${currentConnection.currentAccessToken}`,
                    "x-ms-client-request-id": uuid(),
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "Content-Type": "application/json; charset=utf-8",
                },
            });

            if (response.ok) {
                return (await response.json()) as T;
            } else {
                if (response.statusText === "Unauthorized" && this.dvHelper) {
                    if (retries && retries > maxRetries) {
                        return undefined;
                    }
                    let tokenResponse = currentConnection.refreshToken
                        ? await loginWithRefreshToken(defaultDataverseClientId, currentConnection.environmentUrl, currentConnection.refreshToken)
                        : await loginWithUsernamePassword(currentConnection.environmentUrl, currentConnection.userName!, currentConnection.password!);

                    if (!tokenResponse && currentConnection.loginType === loginTypes[1]) {
                        // Try again with no refresh token
                        tokenResponse = await loginWithPrompt(defaultDataverseClientId, false, currentConnection.environmentUrl, openUri, redirectTimeout);
                    }

                    if (tokenResponse) {
                        currentConnection.currentAccessToken = tokenResponse.access_token;
                        currentConnection.refreshToken = tokenResponse.refresh_token;
                    } else {
                        return undefined;
                    }

                    this.vsstate.saveInWorkspace(connectionCurrentStoreKey, currentConnection);
                    return this.requestData(query, retries ? retries + 1 : 1);
                } else {
                    return undefined;
                }
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async createData(query: string, data: string): Promise<string | undefined> {
        try {
            const currentConnection: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
            const requestUrl = `${currentConnection.environmentUrl}${apiPartUrl}${query}`;
            const response = await fetch(requestUrl, {
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
                return response.headers.get("OData-EntityId") !== null ? response.headers.get("OData-EntityId")?.toString() : undefined;
            }
        } catch (err) {
            console.log(err);
        }
    }

    async updateData(query: string, data: string): Promise<string | undefined> {
        try {
            const currentConnection: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);
            const requestUrl = `${currentConnection.environmentUrl}${apiPartUrl}${query}`;
            const response = await fetch(requestUrl, {
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
                return response.headers.get("OData-EntityId") !== null ? response.headers.get("OData-EntityId")?.toString() : undefined;
            }
        } catch (err) {
            console.log(err);
        }
    }
}

async function redirectTimeout(): Promise<void> {}
