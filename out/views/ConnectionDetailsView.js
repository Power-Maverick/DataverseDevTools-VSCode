"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionDetailsView = void 0;
const path = require("path");
const PanelBase_1 = require("./PanelBase");
const FileSystem_1 = require("../utils/FileSystem");
const _ = require("lodash");
class ConnectionDetailsView extends PanelBase_1.Panel {
    constructor(connDetails, webview, vscontext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "connectiondetail.html" });
        this.conn = connDetails;
    }
    getHtmlForWebview(webviewFileName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = FileSystem_1.readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            connName: (_b = (_a = this.conn) === null || _a === void 0 ? void 0 : _a.connectionName) !== null && _b !== void 0 ? _b : "--",
            connType: (_d = (_c = this.conn) === null || _c === void 0 ? void 0 : _c.connectionType) !== null && _d !== void 0 ? _d : "--",
            envUrl: (_f = (_e = this.conn) === null || _e === void 0 ? void 0 : _e.environmentUrl) !== null && _f !== void 0 ? _f : "--",
            userName: (_h = (_g = this.conn) === null || _g === void 0 ? void 0 : _g.userName) !== null && _h !== void 0 ? _h : "--",
            token: (_k = (_j = this.conn) === null || _j === void 0 ? void 0 : _j.currentAccessToken) !== null && _k !== void 0 ? _k : "--",
        };
        // if (this._images && this._images.length > 0) {
        //     Object.keys(this._images).forEach((key) => {
        //         //viewModel.images.push(this._images[key]);
        //         (<any>viewModel.images)[key] = this._images.get(key);
        //     });
        // }
        return super.render(compiled(viewModel));
    }
}
exports.ConnectionDetailsView = ConnectionDetailsView;
//# sourceMappingURL=ConnectionDetailsView.js.map