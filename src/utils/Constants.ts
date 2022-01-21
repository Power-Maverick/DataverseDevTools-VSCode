export const extensionName: string = "Dataverse DevTools";
export const extensionPrefix: string = "devtools";
export const extensionCodeName: string = "dataverse-devtools";
export const extensionUniqueName: string = "danish-naglekar.dataverse-devtools";
export const aiKey: string = "490f2bf6-8f2a-4cc1-873b-c2a62d0a2ec8";
export const activeDirectoryEndpointUrl: string = "https://login.microsoftonline.com/";
export const genericTenant: string = "organizations";
export const tokenEndpointUrl: string = `${activeDirectoryEndpointUrl}${genericTenant}/oauth2/v2.0/token`;
export const defaultDataverseClientId: string = `51f81489-12ee-4a9e-aaae-a2591f45987d`;
export const customDataverseClientId: string = `12c47861-4bb0-48dd-8949-83df0a3fecc5`;
export const environmentVersion: string = `v9.2`;
export const apiPartUrl: string = `/api/data/${environmentVersion}/`;
export const connectionStoreKey: string = `DataverseConnections`;
export const connectionCurrentStoreKey: string = `LiveDVConnection`;
export const entityDefinitionsStoreKey: string = `CurrentEntityDefinitions`;
export const wrDefinitionsStoreKey: string = `CurrentWRs`;
export const solDefinitionsStoreKey: string = `CurrentSolutions`;
export const smartMatchStoreKey: string = `CurrentSmartMatch`;
export const environmentTypes: string[] = ["Dev", "QA", "UAT", "Prod"];
export const loginTypes: string[] = ["Username/Password", "Microsoft Login Prompt", "Client Id and Secret"];
export const tsTemplateType: string[] = ["Plain TypeScript", "Webpack"];
export const connectionStatusBarUniqueId: string = `${extensionPrefix}.StatusBarConnectStatus`;
export const maxRetries: number = 5;
export const terminalName: string = "Dataverse DevTools";
export const fileExtensions: string[] = [".js", ".html", ".css"];
export const portADFS: number = 29827;
export const redirectUrl: string = `http://localhost:${portADFS}/callback/`;
export const configSectionName: string = "dataverse-devtools";
export const reservedWords: string[] = ["Dev", "QA", "UAT", "Prod"];

export enum WebResourceType {
    html = 1,
    css = 2,
    script = 3,
}

export enum ConfidenceScores {
    _90 = 90,
    _80 = 80,
    _75 = 75,
    _60 = 60,
}
