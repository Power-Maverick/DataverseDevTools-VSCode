import { AuthenticationContext, TokenResponse } from "adal-node";
import { Environment, isADFS } from "./environment";

/* eslint-disable @typescript-eslint/naming-convention */
export interface Token {
    token_type: string;
    scope: string;
    expires_in: number;
    ext_expires_in: number;
    access_token: string;
    refresh_token?: string;
}

export async function getTokenWithAuthorizationCode(clientId: string, environment: Environment, redirectUrl: string, tenantId: string, code: string): Promise<TokenResponse> {
    return new Promise<TokenResponse>((resolve, reject) => {
        const context: AuthenticationContext = new AuthenticationContext(`${environment.activeDirectoryEndpointUrl}${tenantId}`, !isADFS(environment));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context.acquireTokenWithAuthorizationCode(code, redirectUrl, environment.activeDirectoryResourceId, clientId, <any>undefined, (err, response) => {
            if (err) {
                reject(err);
            }
            if (response && response.error) {
                reject(new Error(`${response.error}: ${response.errorDescription}`));
            } else {
                resolve(<TokenResponse>response);
            }
        });
    });
}
