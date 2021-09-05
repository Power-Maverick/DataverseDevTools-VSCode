/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as url from "url";
import * as msal from "@azure/msal-node";
import * as axios from "axios";
import * as crypto from "crypto";
import fetch from "node-fetch";
import { error } from "console";
import { ServerResponse } from "http";
import { activeDirectoryEndpointUrl, defaultDataverseClientId, genericTenant, tokenEndpointUrl } from "../utils/Constants";
import { CodeResult, createServer, RedirectResult, startServer } from "./server";
import { Token } from "../utils/Interfaces";

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
/*async function exchangeCodeForToken(clientId: string, environment: Environment, tenantId: string, callbackUri: string, state: string): Promise<TokenResponse> {
    let uriEventListener: vscode.Disposable;
    return new Promise((resolve: (value: TokenResponse) => void, reject) => {
        uriEventListener = handler.event(async (uri: vscode.Uri) => {
            try {
                const query = parseQuery(uri);
                const code = query.code;
                // Workaround double encoding issues of state
                if (query.state !== state && decodeURIComponent(query.state) !== state) {
                    throw new Error("State does not match.");
                }
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
}*/

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

/*async function loginWithoutLocalServer(clientId: string, environment: Environment, adfs: boolean, tenantId: string): Promise<TokenResponse> {
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
}*/

export async function loginWithPrompt(clientId: string, adfs: boolean, dataverseUrl: string, openUri: (url: string) => Promise<void>, redirectTimeout: () => Promise<void>): Promise<Token> {
    const nonce: string = crypto.randomBytes(16).toString("base64");
    const { server, redirectPromise, codePromise } = createServer(nonce);
    const port: number = await startServer(server, adfs);
    const requestUrl = tokenEndpointUrl;
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
                authority: `${activeDirectoryEndpointUrl}${genericTenant}/`,
            },
        };
        const pca = new msal.PublicClientApplication(clientConfig);
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

        const authCodeUrlParameters: msal.AuthorizationUrlRequest = {
            scopes: [`${dataverseUrl}/user_impersonation`],
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

        const codeResult: CodeResult = await codePromise;
        const serverResponse: ServerResponse = codeResult.res;
        try {
            if ("err" in codeResult) {
                throw codeResult.err;
            }

            axios.default.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
            const params = new url.URLSearchParams({
                grant_type: "authorization_code",
                code: codeResult.code,
                redirect_uri: redirectUrl,
                client_id: clientId,
                code_verifier: pkceCodes.verifier,
            });
            const config = {
                headers: {
                    Origin: "http://localhost",
                },
            };

            let resp = await axios.default.post(requestUrl, params.toString(), config).catch((error) => {
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
