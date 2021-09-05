export const extensionName: string = "Dataverse DevTools";
export const extensionPrefix: string = "devtools";
export const activeDirectoryEndpointUrl: string = "https://login.microsoftonline.com/";
export const genericTenant: string = "organizations";
export const tokenEndpointUrl: string = `${activeDirectoryEndpointUrl}${genericTenant}/oauth2/v2.0/token`;
export const defaultDataverseClientId: string = `12c47861-4bb0-48dd-8949-83df0a3fecc5`;
export const environmentVersion: string = `v9.2`;
export const apiPartUrl: string = `/api/data/${environmentVersion}/`;
export const connectionStoreKey: string = `DataverseConnections`;
export const connectionCurrentStoreKey: string = `LiveDVConnection`;
export const entityDefinitionsStoreKey: string = `CurrentEntityDefinitions`;
export const wrDefinitionsStoreKey: string = `CurrentWRs`;
export const solDefinitionsStoreKey: string = `CurrentSolutions`;
export const environmentTypes: string[] = ["Dev", "QA", "UAT", "Prod"];
export const loginTypes: string[] = ["Username/Password", "Microsoft Login Prompt"];
export const connectionStatusBarUniqueId: string = `${extensionPrefix}.StatusBarConnectStatus`;
export const maxRetries: number = 3;
export const terminalName: string = "Dataverse DevTools";
export const fileExtensions: string[] = [".js", ".html", ".css"];
export const portADFS: number = 29827;
export const redirectUrl: string = `http://localhost:${portADFS}/callback/`;

export enum WebResourceType {
    html = 1,
    css = 2,
    script = 3,
}
