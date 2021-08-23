export const extensionName: string = "Dataverse DevTools";
export const extensionPrefix: string = "devtools";
export const activeDirectoryEndpointUrl: string = "https://login.microsoftonline.com/";
export const activeDirectoryResourceId: string = "https://management.core.windows.net/";
export const commonTenantId: string = "common";
export const tokenEndpointUrl: string = `${activeDirectoryEndpointUrl}/organizations/oauth2/v2.0/token`;
export const defaultDataverseClientId: string = `51f81489-12ee-4a9e-aaae-a2591f45987d`;
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
export const portADFS: number = 19472;
export const redirectUrlAAD: string = "https://vscode-redirect.azurewebsites.net/";
export const redirectUrlADFS: string = `http://127.0.0.1:${portADFS}/callback`;

export enum WebResourceType {
    html = 1,
    css = 2,
    script = 3,
}
