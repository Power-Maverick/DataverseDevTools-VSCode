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
exports.loginWithUsernamePassword = void 0;
const url = require("url");
const Constants_1 = require("../utils/Constants");
const node_fetch_1 = require("node-fetch");
function loginWithUsernamePassword(envUrl, un, p) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestUrl = Constants_1.tokenEndpointUrl;
        var urlencoded = new url.URLSearchParams();
        urlencoded.append("client_id", Constants_1.defaultDataverseClientId);
        urlencoded.append("scope", `${envUrl}/user_impersonation`);
        urlencoded.append("username", un);
        urlencoded.append("password", p);
        urlencoded.append("grant_type", "password");
        const response = yield node_fetch_1.default(requestUrl, {
            headers: {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
            body: urlencoded,
        });
        if (response.ok) {
            let jsonResponse = yield response.json();
            return jsonResponse;
        }
        else {
            console.log(response.statusText);
            throw response.statusText;
        }
    });
}
exports.loginWithUsernamePassword = loginWithUsernamePassword;
//# sourceMappingURL=Login.js.map