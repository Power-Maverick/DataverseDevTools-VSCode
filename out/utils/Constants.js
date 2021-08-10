"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebResourceType = exports.fileExtensions = exports.terminalName = exports.maxRetries = exports.connectionStatusBarUniqueId = exports.environmentTypes = exports.solDefinitionsStoreKey = exports.wrDefinitionsStoreKey = exports.entityDefinitionsStoreKey = exports.connectionCurrentStoreKey = exports.connectionStoreKey = exports.apiPartUrl = exports.environmentVersion = exports.defaultDataverseClientId = exports.tokenEndpointUrl = exports.extensionPrefix = exports.extensionName = void 0;
exports.extensionName = "Dataverse DevTools";
exports.extensionPrefix = "devtools";
exports.tokenEndpointUrl = `https://login.microsoftonline.com/organizations/oauth2/v2.0/token`;
exports.defaultDataverseClientId = `51f81489-12ee-4a9e-aaae-a2591f45987d`;
exports.environmentVersion = `v9.2`;
exports.apiPartUrl = `/api/data/${exports.environmentVersion}/`;
exports.connectionStoreKey = `DataverseConnections`;
exports.connectionCurrentStoreKey = `LiveDVConnection`;
exports.entityDefinitionsStoreKey = `CurrentEntityDefinitions`;
exports.wrDefinitionsStoreKey = `CurrentWRs`;
exports.solDefinitionsStoreKey = `CurrentSolutions`;
exports.environmentTypes = ["Dev", "QA", "UAT", "Prod"];
exports.connectionStatusBarUniqueId = `${exports.extensionPrefix}.StatusBarConnectStatus`;
exports.maxRetries = 3;
exports.terminalName = "Dataverse DevTools";
exports.fileExtensions = [".js", ".html", ".css"];
var WebResourceType;
(function (WebResourceType) {
    WebResourceType[WebResourceType["html"] = 1] = "html";
    WebResourceType[WebResourceType["css"] = 2] = "css";
    WebResourceType[WebResourceType["script"] = 3] = "script";
})(WebResourceType = exports.WebResourceType || (exports.WebResourceType = {}));
//# sourceMappingURL=Constants.js.map