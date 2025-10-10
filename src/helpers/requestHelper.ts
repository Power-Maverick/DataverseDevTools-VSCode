import * as vscode from "vscode";
import fetch from "node-fetch";
import { v4 as uuid } from "uuid";
import { apiPartUrl, connectionCurrentStoreKey, customDataverseClientId, LoginTypes, maxRetries } from "../utils/Constants";
import { IConnection } from "../utils/Interfaces";
import { State } from "../utils/State";
import { DataverseHelper } from "./dataverseHelper";

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
                    let tokenResponse = await this.dvHelper.reAuthenticate(currentConnection);
                    if (tokenResponse) {
                        return this.requestData(query, retries ? retries + 1 : 1);
                    } else {
                        throw new Error("Unable to finish the requested query");
                    }
                } else {
                    return undefined;
                }
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async postData(query: string, data: string, retries?: number): Promise<string | undefined> {
        const currentConnection: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);

        try {
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
            } else {
                if (response.statusText === "Unauthorized" && this.dvHelper) {
                    if (retries && retries > maxRetries) {
                        return undefined;
                    }
                    let tokenResponse = await this.dvHelper.reAuthenticate(currentConnection);
                    if (tokenResponse) {
                        return this.postData(query, data, retries ? retries + 1 : 1);
                    } else {
                        throw new Error("Unable to finish the requested query");
                    }
                } else {
                    return undefined;
                }
            }
        } catch (err) {
            console.log(err);
            throw err;
        }
    }

    async patchData(query: string, data: string, retries?: number): Promise<string | undefined> {
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
            } else {
                if (response.statusText === "Unauthorized" && this.dvHelper) {
                    if (retries && retries > maxRetries) {
                        return undefined;
                    }
                    let tokenResponse = await this.dvHelper.reAuthenticate(currentConnection);
                    if (tokenResponse) {
                        return this.patchData(query, data, retries ? retries + 1 : 1);
                    } else {
                        throw new Error("Unable to finish the requested query");
                    }
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

async function redirectTimeout(): Promise<void> {}
