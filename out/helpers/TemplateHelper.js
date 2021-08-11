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
exports.TemplateHelper = void 0;
const vscode = require("vscode");
const path = require("path");
const FileSystem_1 = require("../utils/FileSystem");
const commands_1 = require("../terminals/commands");
const console_1 = require("../terminals/console");
const Constants_1 = require("../utils/Constants");
class TemplateHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext) {
        this.vscontext = vscontext;
    }
    initiateTypeScriptProject(wsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const extPath = this.vscontext.extensionUri.fsPath;
            const tsFolderUri = path.join(extPath, "resources", "templates", "TypeScript");
            if (wsPath) {
                yield FileSystem_1.copyFolderOrFile(tsFolderUri, wsPath);
            }
            let commands = Array();
            commands.push(commands_1.Commands.LoadNpmPackages());
            commands.push(commands_1.Commands.LinkGlobalTypeScript());
            console_1.Console.runCommand(commands);
            vscode.window.showInformationMessage(`${Constants_1.extensionName}: TypeScript project initialized.`);
        });
    }
}
exports.TemplateHelper = TemplateHelper;
//# sourceMappingURL=templateHelper.js.map