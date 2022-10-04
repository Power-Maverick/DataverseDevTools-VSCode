/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as url from "url";
import * as msal from "@azure/msal-node";
import * as axios from "axios";
import * as crypto from "crypto";
import fetch from "node-fetch";
import { error } from "console";
import { ServerResponse } from "http";
import { activeDirectoryEndpointUrl, customDataverseClientId, defaultDataverseClientId, genericTenant, tokenEndpointUrl } from "../utils/Constants";
import { CodeResult, createServer, RedirectResult, startServer } from "./server";
import { Token } from "../utils/Interfaces";
import { AuthenticationScheme } from "@azure/msal-common";
import { useIdentityPlugin, DefaultAzureCredential } from "@azure/identity";
import { vsCodePlugin } from "@azure/identity-vscode";

useIdentityPlugin(vsCodePlugin);

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

export async function loginWithAzure(envUrl: string): Promise<Token> {
    const credential = new DefaultAzureCredential();
    const scope = `${envUrl}/.default`;
    const tokenResponse = await credential.getToken(scope);
    const tokenExpiry = new Date(tokenResponse.expiresOnTimestamp);

    if (tokenResponse !== null) {
        let token: Token = {
            access_token: tokenResponse.token,
            token_type: "bearer",
            scope: scope,
            expires_in: tokenResponse.expiresOnTimestamp !== null ? (tokenExpiry.getTime() - tokenExpiry.getMilliseconds()) / 1000 : 0,
        };
        return token;
    } else {
        throw error("Unable to fetch token");
    }
}

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
                prompt: "login",
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
        } catch (err: any) {
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

export async function loginWithClientIdSecret(dataverseUrl: string, clientId: string, clientSecret: string, tenantId: string): Promise<Token> {
    const clientConfig: msal.Configuration = {
        auth: {
            clientId: clientId,
            authority: `${activeDirectoryEndpointUrl}${tenantId}`,
            clientSecret: clientSecret,
        },
    };
    const cca = new msal.ConfidentialClientApplication(clientConfig);
    const clientCredentialRequest: msal.ClientCredentialRequest = {
        scopes: [`${dataverseUrl}/.default`],
    };

    const tokenRequest = {
        scopes: ["https://graph.microsoft.com/.default"],
    };

    const tokenResponse = await cca.acquireTokenByClientCredential(clientCredentialRequest);
    console.log(tokenResponse?.accessToken);

    // let resp = await pca.acquireTokenByClientCredential(clientCredentialRequest);
    // console.log(resp);

    if (tokenResponse !== null) {
        let token: Token = {
            access_token: tokenResponse.accessToken,
            token_type: tokenResponse.tokenType,
            scope: tokenResponse.scopes[0],
            expires_in: tokenResponse.expiresOn !== null ? (tokenResponse.expiresOn.getTime() - tokenResponse.expiresOn.getMilliseconds()) / 1000 : 0,
        };
        return token;
    } else {
        throw error("Unable to fetch token");
    }

    //throw error("Unable to fetch token");
}

export async function loginWithRefreshToken(clientId: string, dataverseUrl: string, refreshToken: string): Promise<Token | undefined> {
    const requestUrl = tokenEndpointUrl;

    axios.default.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
    const params = new url.URLSearchParams({
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: refreshToken,
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
        return resp.data;
    } else {
        throw error("Unable to fetch token");
    }
}
