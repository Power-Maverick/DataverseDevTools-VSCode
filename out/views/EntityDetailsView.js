"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityDetailsView = void 0;
const path = require("path");
const PanelBase_1 = require("./PanelBase");
const FileSystem_1 = require("../utils/FileSystem");
const _ = require("lodash");
class EntityDetailsView extends PanelBase_1.Panel {
    constructor(enDetails, webview, vscontext) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "entitydetail.html" });
        this.entity = enDetails;
        // Set the webview's initial html content
        super.update();
    }
    getHtmlForWebview(webviewFileName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = FileSystem_1.readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            entityLogicalName: (_b = (_a = this.entity) === null || _a === void 0 ? void 0 : _a.LogicalName) !== null && _b !== void 0 ? _b : "--",
            entitySchemaName: (_d = (_c = this.entity) === null || _c === void 0 ? void 0 : _c.SchemaName) !== null && _d !== void 0 ? _d : "--",
            description: (_f = (_e = this.entity) === null || _e === void 0 ? void 0 : _e.Description.UserLocalizedLabel.Label) !== null && _f !== void 0 ? _f : "--",
            sla: ((_g = this.entity) === null || _g === void 0 ? void 0 : _g.IsSLAEnabled) ? "Enabled" : "Disabled",
            entityType: ((_h = this.entity) === null || _h === void 0 ? void 0 : _h.IsActivity) ? "Activity" : "Standard",
            objectTypeCode: (_k = (_j = this.entity) === null || _j === void 0 ? void 0 : _j.ObjectTypeCode) !== null && _k !== void 0 ? _k : "--",
            idAttr: (_m = (_l = this.entity) === null || _l === void 0 ? void 0 : _l.PrimaryIdAttribute) !== null && _m !== void 0 ? _m : "--",
            nameAttr: (_p = (_o = this.entity) === null || _o === void 0 ? void 0 : _o.PrimaryNameAttribute) !== null && _p !== void 0 ? _p : "--",
            setName: (_r = (_q = this.entity) === null || _q === void 0 ? void 0 : _q.EntitySetName) !== null && _r !== void 0 ? _r : "--",
            attributes: "",
        };
        if (((_s = this.entity) === null || _s === void 0 ? void 0 : _s.Attributes) && ((_t = this.entity) === null || _t === void 0 ? void 0 : _t.Attributes.value.length) > 0) {
            (_u = this.entity) === null || _u === void 0 ? void 0 : _u.Attributes.value.forEach((a) => {
                viewModel.attributes += `<tr>`;
                viewModel.attributes += `<td>${a.MetadataId}</td>`;
                viewModel.attributes += `<td>${a.LogicalName}</td>`;
                viewModel.attributes += `<td>${a.SchemaName}</td>`;
                viewModel.attributes += `<td>${a.AttributeType}</td>`;
                viewModel.attributes += `<td>${a.RequiredLevel.Value}</td>`;
                viewModel.attributes += `</tr>`;
            });
        }
        return super.render(compiled(viewModel));
    }
}
exports.EntityDetailsView = EntityDetailsView;
//# sourceMappingURL=EntityDetailsView.js.map