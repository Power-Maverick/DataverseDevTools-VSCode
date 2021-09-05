/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as url from "url";
import { activeDirectoryEndpointUrl, activeDirectoryResourceId, commonTenantId, defaultDataverseClientId, redirectUrlAAD, redirectUrlADFS, tokenEndpointUrl } from "../utils/Constants";
import { getTokenWithAuthorizationCode, Token } from "./tokens";
import fetch, { Headers, RequestInfo, RequestInit, Response } from "node-fetch";
import * as crypto from "crypto";
import { CodeResult, createServer, RedirectResult, startServer } from "./server";
import { openUri } from "../utils/OpenUri";
import { AuthenticationContext, TokenResponse } from "adal-node";
import { request, ServerResponse } from "http";
import { Environment } from "./environment";
import * as msal from "@azure/msal-node";
import * as axios from "axios";
import { RequestOptions } from "https";
import * as https from "https";
import { error, log } from "console";

export async function loginWithUsernamePassword(envUrl: string, un: string, p: string): Promise<Token> {
    const requestUrl = tokenEndpointUrl;

    var urlencoded = new url.URLSearchParams();
    urlencoded.append("client_id", defaultDataverseClientId);
    urlencoded.append("scope", `${envUrl}/user_impersonation`);
    urlencoded.append("username", un);
    urlencoded.append("password", p);
    urlencoded.append("grant_type", "password");

    const response = await fetch(requestUrl, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        body: urlencoded,
    });

    if (response.ok) {
        let jsonResponse = await response.json();
        return jsonResponse;
    } else {
        console.log(response.statusText);
        throw response.statusText;
    }
}

class UriEventHandler extends vscode.EventEmitter<vscode.Uri> implements vscode.UriHandler {
    public handleUri(uri: vscode.Uri) {
        this.fire(uri);
    }
}
const handler: UriEventHandler = new UriEventHandler();
vscode.window.registerUriHandler(handler);
let terminateServer: () => Promise<void>;
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
function parseQuery(uri: vscode.Uri): any {
    return uri.query.split("&").reduce((prev: any, current) => {
        const queryString: string[] = current.split("=");
        prev[queryString[0]] = queryString[1];
        return prev;
    }, {});
}
/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access */
async function exchangeCodeForToken(clientId: string, environment: Environment, tenantId: string, callbackUri: string, state: string): Promise<TokenResponse> {
    let uriEventListener: vscode.Disposable;
    return new Promise((resolve: (value: TokenResponse) => void, reject) => {
        uriEventListener = handler.event(async (uri: vscode.Uri) => {
            try {
                /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
                const query = parseQuery(uri);
                const code = query.code;
                // Workaround double encoding issues of state
                if (query.state !== state && decodeURIComponent(query.state) !== state) {
                    throw new Error("State does not match.");
                }
                /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
                resolve(await getTokenWithAuthorizationCode(clientId, environment, callbackUri, tenantId, code));
            } catch (err) {
                reject(err);
            }
        });
    })
        .then((result) => {
            uriEventListener.dispose();
            return result;
        })
        .catch((err) => {
            uriEventListener.dispose();
            throw err;
        });
}
function getCallbackEnvironment(callbackUri: vscode.Uri): string {
    if (callbackUri.authority.endsWith(".workspaces.github.com") || callbackUri.authority.endsWith(".github.dev")) {
        return `${callbackUri.authority},`;
    }
    switch (callbackUri.authority) {
        case "online.visualstudio.com":
            return "vso,";
        case "online-ppe.core.vsengsaas.visualstudio.com":
            return "vsoppe,";
        case "online.dev.core.vsengsaas.visualstudio.com":
            return "vsodev,";
        case "canary.online.visualstudio.com":
            return "vsocanary,";
        default:
            return "";
    }
}

async function loginWithoutLocalServer(clientId: string, environment: Environment, adfs: boolean, tenantId: string): Promise<TokenResponse> {
    const callbackUri: vscode.Uri = await vscode.env.asExternalUri(vscode.Uri.parse(`${vscode.env.uriScheme}://ms-vscode.azure-account`));
    const nonce: string = crypto.randomBytes(16).toString("base64");
    const port: string | number = (callbackUri.authority.match(/:([0-9]*)$/) || [])[1] || (callbackUri.scheme === "https" ? 443 : 80);
    const callbackEnvironment: string = getCallbackEnvironment(callbackUri);
    const state: string = `${callbackEnvironment}${port},${encodeURIComponent(nonce)},${encodeURIComponent(callbackUri.query)}`;
    const signInUrl: string = `${environment.activeDirectoryEndpointUrl}${adfs ? "" : `${tenantId}/`}oauth2/authorize`;
    let uri: vscode.Uri = vscode.Uri.parse(signInUrl);
    uri = uri.with({
        query: `response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUrlAAD}&state=${state}&resource=${environment.activeDirectoryResourceId}&prompt=select_account`,
    });
    void vscode.env.openExternal(uri);
    const timeoutPromise = new Promise((_resolve: (value: TokenResponse) => void, reject) => {
        const wait = setTimeout(() => {
            clearTimeout(wait);
            reject("Login timed out.");
        }, 1000 * 60 * 5);
    });
    return Promise.race([exchangeCodeForToken(clientId, environment, tenantId, redirectUrlAAD, state), timeoutPromise]);
}

export async function loginWithPrompt(clientId: string, environment: Environment, adfs: boolean, tenantId: string, openUri: (url: string) => Promise<void>, redirectTimeout: () => Promise<void>): Promise<Token> {
    const nonce: string = crypto.randomBytes(16).toString("base64");
    const { server, redirectPromise, codePromise } = createServer(nonce);
    const port: number = await startServer(server, adfs);
    const redirectUrl: string = `http://localhost:${port}/callback/`;

    if (vscode.env.uiKind === vscode.UIKind.Web) {
        //return loginWithoutLocalServer(clientId, environment, adfs, tenantId);
    }
    if (adfs && terminateServer) {
        await terminateServer();
    }

    if (adfs) {
        //terminateServer = createTerminateServer(server);
    }
    try {
        const clientConfig: msal.Configuration = {
            auth: {
                clientId: clientId,
                authority: "https://login.microsoftonline.com/organizations/",
                //redirectUri: `http://localhost:${port}/callback?nonce=${encodeURIComponent(nonce)}`,
                //authority: `${activeDirEndpointURL}/31c20a23-2ed2-468d-baab-42edf998128b`,
            },
        };
        const pca = new msal.PublicClientApplication(clientConfig);
        //const redirectUrl: string = `https://vscode-redirect.azurewebsites.net/`; //`http://localhost:${port}/callback?nonce=${encodeURIComponent(nonce)}`;

        // var request = {
        //     scopes: [`${environment.dataverseUrl}/user_impersonation`],
        // };
        // msalInstance
        //     .acquireTokenSilent(request)
        //     .then((tokenResponse) => {
        //         // Do something with the tokenResponse
        //         console.log(tokenResponse);
        //     })
        //     .catch((error) => {
        //         if (error instanceof InteractionRequiredAuthError) {
        //             // fallback to interaction when silent call fails
        //             return msalInstance.acquireTokenRedirect(request);
        //         }
        //     });

        //const redirectUrl: string = `https://vscode-redirect.azurewebsites.net/`; //`http://localhost:${port}/callback?nonce=${encodeURIComponent(nonce)}`;
        ////const redirectUrl: string = adfs ? redirectUrlADFS : redirectUrlAAD;

        const pkceCodes = {
            challengeMethod: "S256", // Use SHA256 Algorithm
            verifier: "", // Generate a code verifier for the Auth Code Request first
            challenge: "", // Generate a code challenge from the previously generated code verifier
        };
        const cryptoProvider = new msal.CryptoProvider();

        const generatedCodes = await cryptoProvider.generatePkceCodes();

        // Set generated PKCE Codes as app variables
        pkceCodes.verifier = generatedCodes.verifier;
        pkceCodes.challenge = generatedCodes.challenge;

        console.log(pkceCodes);

        const authCodeUrlParameters: msal.AuthorizationUrlRequest = {
            scopes: [`https://powermaverick.crm.dynamics.com/user_impersonation`],
            //scopes: ["https://globaldisco.crm.dynamics.com/user_impersonation"],
            redirectUri: redirectUrl,
            codeChallenge: pkceCodes.challenge, // PKCE Code Challenge
            codeChallengeMethod: pkceCodes.challengeMethod, // PKCE Code Challenge Method
        };

        await openUri(`http://localhost:${port}/signin?nonce=${encodeURIComponent(nonce)}`);
        pca.getAuthCodeUrl(authCodeUrlParameters)
            .then(async (response) => {
                console.log(response);
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                const redirectTimer = setTimeout(() => redirectTimeout().catch(console.error), 10 * 1000);
                const redirectResult: RedirectResult = await redirectPromise;
                if ("err" in redirectResult) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const { err, res } = redirectResult;
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    res.writeHead(302, { Location: `/?error=${encodeURIComponent((err && err.message) || "Unknown error")}` });
                    res.end();
                    throw err;
                }
                clearTimeout(redirectTimer);
                const signInUrl: string = response;
                redirectResult.res.writeHead(302, { Location: signInUrl });
                redirectResult.res.end();
            })
            .catch((error) => {
                console.log(JSON.stringify(error));
                throw error;
            });

        /*await openUri(`http://localhost:${port}/signin?nonce=${encodeURIComponent(nonce)}`);
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const redirectTimer = setTimeout(() => redirectTimeout().catch(console.error), 10 * 1000);
        const redirectResult: RedirectResult = await redirectPromise;
        if ("err" in redirectResult) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const { err, res } = redirectResult;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            res.writeHead(302, { Location: `/?error=${encodeURIComponent((err && err.message) || "Unknown error")}` });
            res.end();
            throw err;
        }
        clearTimeout(redirectTimer);
        const host: string = redirectResult.req.headers.host || "";
        const updatedPortStr: string = (/^[^:]+:(\d+)$/.exec(Array.isArray(host) ? host[0] : host) || [])[1];
        const updatedPort: number = updatedPortStr ? parseInt(updatedPortStr, 10) : port;
        const state: string = `${updatedPort},${encodeURIComponent(nonce)}`;
        const redirectUrl: string = adfs ? redirectUrlADFS : redirectUrlAAD;

        // Testing
        const signInUrl: string = `https://login.microsoftonline.com/organizations/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
            redirectUrl,
        )}&state=${state}&scope=${encodeURIComponent(environment.dataverseUrl + "/user_impersonation")}&prompt=select_account`;

        // const signInUrl: string = `${environment.activeDirectoryEndpointUrl}${adfs ? "" : `${tenantId}/`}oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
        //     redirectUrl,
        // )}&state=${state}&scope=${encodeURIComponent(environment.dataverseUrl + "/user_impersonation")}&prompt=select_account`;

        // Samples
        // const signInUrl: string = `${environment.activeDirectoryEndpointUrl}${adfs ? "" : `${tenantId}/`}oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(
        //     redirectUrl,
        // )}&state=${state}&resource=${encodeURIComponent(environment.dataverseUrl)}&prompt=select_account`;

        // const signInUrl: string = `${environment.activeDirectoryEndpointUrl}${adfs ? "" : `${tenantId}/`}oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&resource=${encodeURIComponent(
        //     environment.dataverseUrl,
        // )}&state=${state}&redirect_uri=${encodeURIComponent(redirectUrl)}&prompt=select_account`;
        // const signInUrl: string = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&redirect_uri=${encodeURIComponent(
        //     redirectUrl,
        // )}&response_mode=query&scope=${encodeURIComponent(environment.dataverseUrl + "/user_impersonation")}&state=${state}&prompt=select_account`;
        redirectResult.res.writeHead(302, { Location: signInUrl });
        redirectResult.res.end();
*/
        const codeResult: CodeResult = await codePromise;
        const serverResponse: ServerResponse = codeResult.res;
        try {
            if ("err" in codeResult) {
                throw codeResult.err;
            }
            //const tokenResponse: TokenResponse = await getTokenWithAuthorizationCode(clientId, environment, redirectUrl, tenantId, codeResult.code);

            // const tokenRequest: msal.AuthorizationCodeRequest = {
            //     code: codeResult.code,
            //     //scopes: [`https://powermaverick.crm.dynamics.com/user_impersonation`],
            //     scopes: ["https://globaldisco.crm.dynamics.com/user_impersonation"],
            //     redirectUri: redirectUrl,
            //     codeVerifier: pkceCodes.verifier, // PKCE Code Verifier
            //     //clientInfo: req.query.client_info,
            // };

            // const authResult = await pca.acquireTokenByCode(tokenRequest);

            /*var options: axios.AxiosRequestConfig = {
                method: "POST",
                url: "https://login.microsoftonline.com/organizations/oauth2/v2.0/token",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    // prettier-ignore
                    "Origin": "http://localhost",
                },
                data: {
                    grant_type: "authorization_code",
                    client_id: clientId,
                    code_verifier: pkceCodes.verifier,
                    code: codeResult.code,
                    redirect_uri: redirectUrl,
                },
            };

            axios.default
                .request(options)
                .then(function (response) {
                    console.log(response.data);
                })
                .catch(function (error) {
                    console.error(error);
                });*/

            /*let headers = new Headers();
            headers.append("Origin", "http://localhost");
            headers.append("Content-Type", "application/x-www-form-urlencoded");
            let urlencoded = new url.URLSearchParams();
            urlencoded.append("grant_type", "authorization_code");
            urlencoded.append("code", codeResult.code);
            urlencoded.append("redirect_uri", "http://localhost:${port}/callback2/");
            urlencoded.append("client_id", clientId);
            urlencoded.append("code_verifier", pkceCodes.verifier);

            let requestOptions: RequestInit = {
                method: "POST",
                headers: headers,
                body: urlencoded,
                redirect: "follow",
            };

            let resp: Response = await fetch("https://login.microsoftonline.com/organizations/oauth2/v2.0/token", requestOptions);
            const { data, errors } = await resp.json();
            if (resp.ok) {
                console.log(data);
            } else {
                console.log(errors);
            }*/

            axios.default.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            const params = new url.URLSearchParams({
                grant_type: "authorization_code",
                code: codeResult.code,
                redirect_uri: redirectUrl,
                client_id: clientId,
                code_verifier: pkceCodes.verifier,
            });
            // params.append("grant_type", "authorization_code");
            // params.append("code", codeResult.code);
            // params.append("redirect_uri", "http://localhost:${port}/callback/");
            // params.append("client_id", clientId);
            // params.append("code_verifier", pkceCodes.verifier);

            const config = {
                headers: {
                    Origin: "http://localhost",
                },
            };

            let resp = await axios.default.post("https://login.microsoftonline.com/organizations/oauth2/v2.0/token", params.toString(), config).catch((error) => {
                console.log(`ERROR: ${JSON.stringify(error.response.data)}`);
                throw error;
            });
            if (resp) {
                console.log(resp.data.access_token);
                serverResponse.writeHead(302, { Location: "/" });
                serverResponse.end();
                return resp.data;
            } else {
                throw error("Unable to fetch token");
            }

            // serverResponse.writeHead(302, { Location: "/" });
            // serverResponse.end();
            //return tokenResponse;
            //return authResult?.accessToken!;
            //return "";
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            serverResponse.writeHead(302, {
                Location: `/?error=${encodeURIComponent((err && err.message) || "Unknown error")}`,
            });
            serverResponse.end();
            throw err;
        }
    } finally {
        setTimeout(() => {
            server.close();
        }, 5000);
    }
}
