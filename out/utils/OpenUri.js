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
exports.openUri = void 0;
const vscode_1 = require("vscode");
function openUri(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_1.env.openExternal(vscode_1.Uri.parse(uri));
    });
}
exports.openUri = openUri;
//# sourceMappingURL=OpenUri.js.map