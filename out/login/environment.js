"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isADFS = exports.getSelectedEnvironment = exports.Environment = void 0;
const Constants_1 = require("../utils/Constants");
const url = require("url");
class Environment {
    constructor(parameters) {
        this.activeDirectoryEndpointUrl = parameters.activeDirectoryEndpointUrl;
        this.activeDirectoryResourceId = parameters.activeDirectoryResourceId;
        this.dataverseUrl = parameters.dataverseUrl;
    }
}
exports.Environment = Environment;
function getSelectedEnvironment(dUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        let eParams = {
            activeDirectoryEndpointUrl: Constants_1.activeDirEndpointURL,
            activeDirectoryResourceId: Constants_1.activeDirResourceId,
            dataverseUrl: dUrl,
        };
        return new Environment(eParams);
    });
}
exports.getSelectedEnvironment = getSelectedEnvironment;
function isADFS(environment) {
    const u = url.parse(environment.activeDirectoryEndpointUrl);
    const pathname = (u.pathname || "").toLowerCase();
    return pathname === "/adfs" || pathname.startsWith("/adfs/");
}
exports.isADFS = isADFS;
//# sourceMappingURL=environment.js.map