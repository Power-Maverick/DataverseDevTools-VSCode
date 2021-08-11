"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTreeDataProviders = void 0;
const vscode = require("vscode");
const uploadHelper_1 = require("../helpers/uploadHelper");
const dataverseHelper_1 = require("../helpers/dataverseHelper");
const dataverseConnectionDataProvider_1 = require("../trees/dataverseConnectionDataProvider");
const entitiesDataProvider_1 = require("../trees/entitiesDataProvider");
const webResourcesDataProvider_1 = require("../trees/webResourcesDataProvider");
function registerTreeDataProviders(vscontext) {
    const dvHelper = new dataverseHelper_1.DataverseHelper(vscontext);
    const uploadHelper = new uploadHelper_1.UploadHelper(vscontext, dvHelper);
    const dataverseConnProvider = new dataverseConnectionDataProvider_1.DataverseConnectionDataProvider(vscontext);
    vscode.window.registerTreeDataProvider("dvConnections", dataverseConnProvider);
    const entityMetadataProvider = new entitiesDataProvider_1.EntitiesDataProvider(vscontext, dvHelper);
    vscode.window.registerTreeDataProvider("dvEntities", entityMetadataProvider);
    const wrProvider = new webResourcesDataProvider_1.WebResourcesDataProvider(vscontext, uploadHelper);
    vscode.window.registerTreeDataProvider("dvWebResources", wrProvider);
    const cmds = new Array({
        command: "dvdt.explorer.connections.refreshConnection",
        callback: () => dataverseConnProvider.refresh(),
    }, {
        command: "dvdt.explorer.entities.loadEntities",
        callback: () => entityMetadataProvider.refresh(),
    }, {
        command: "dvdt.explorer.webresources.loadWebResources",
        callback: () => wrProvider.refresh(),
    });
    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}
exports.registerTreeDataProviders = registerTreeDataProviders;
//# sourceMappingURL=registerTreeDataProviders.js.map