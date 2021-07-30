import * as vscode from "vscode";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import { apiPartUrl, connectionCurrentStoreKey, maxRetries } from "../utils/Constants";
import { IConnection } from "../utils/Interfaces";
import { State } from "../utils/State";
import { DataverseHelper } from "./DataverseHelper";
import { loginWithUsernamePassword } from "../login/Login";

export class RequestHelper {
    private vsstate: State;
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context: vscode.ExtensionContext, private dvHelper?: DataverseHelper) {
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
                    const tokenResponse = await loginWithUsernamePassword(currentConnection.environmentUrl, currentConnection.userName, currentConnection.password);
                    currentConnection.currentAccessToken = tokenResponse.access_token;
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
}
