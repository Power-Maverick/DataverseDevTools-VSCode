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
exports.CommonHelper = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const path = require("path");
const uuid_1 = require("uuid");
const FileSystem_1 = require("../utils/FileSystem");
const Parsers_1 = require("../utils/Parsers");
const State_1 = require("../utils/State");
const Constants_1 = require("../utils/Constants");
const Placeholders_1 = require("../utils/Placeholders");
class CommonHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext, dvHelper) {
        this.vscontext = vscontext;
        this.dvHelper = dvHelper;
        this.vsstate = new State_1.State(vscontext);
    }
    linkWebResource(fullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.dvHelper.getWebResources();
            const jsonWRs = this.vsstate.getFromWorkspace(Constants_1.wrDefinitionsStoreKey);
            if (jsonWRs) {
                let wrQPOptions = jsonWRs.value
                    .filter((w) => w.webresourcetype === Constants_1.WebResourceType.script)
                    .map((w) => {
                    return { label: w.displayname, data: w };
                });
                let wrOptionsQP = Placeholders_1.Placeholders.getQuickPickOptions(Placeholders_1.Placeholders.webResourceSelection);
                let wrQPResponse = yield vscode.window.showQuickPick(wrQPOptions, wrOptionsQP);
                const linkerFile = yield this.createLinkerFile();
                if (linkerFile && wrQPResponse) {
                    const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                    const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                    let foundLink = linkerFileDataJson.DVDT.WebResources.Resource.find((r) => r["@_dvDisplayName"] === (wrQPResponse === null || wrQPResponse === void 0 ? void 0 : wrQPResponse.data.displayname));
                    if (!foundLink) {
                        linkerFileDataJson.DVDT.WebResources.Resource.push({
                            "@_Id": uuid_1.v4(),
                            "@_dvDisplayName": wrQPResponse.data.displayname,
                            "@_dvFilePath": wrQPResponse.data.name,
                            "@_localFileName": FileSystem_1.getFileName(fullPath),
                        });
                        FileSystem_1.writeFileSync(linkerFile.fsPath, Parsers_1.jsonToXML(linkerFileDataJson));
                    }
                }
            }
        });
    }
    getLinkedResourceStrings() {
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFile = yield this.getLinkerFile();
            if (linkerFile) {
                const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                if (linkerFileDataJson.DVDT.WebResources && linkerFileDataJson.DVDT.WebResources.Resource) {
                    return linkerFileDataJson.DVDT.WebResources.Resource.map((r) => r["@_localFileName"]);
                }
            }
        });
    }
    getLinkedResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFile = yield this.createLinkerFile();
            if (linkerFile) {
                const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                if (linkerFileDataJson.DVDT.WebResources && linkerFileDataJson.DVDT.WebResources.Resource) {
                    return linkerFileDataJson.DVDT.WebResources.Resource;
                }
            }
            return undefined;
        });
    }
    createLinkerFile() {
        return __awaiter(this, void 0, void 0, function* () {
            if (vscode.workspace.workspaceFolders) {
                const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
                const linkerFileUri = yield this.getLinkerFile();
                if (!linkerFileUri) {
                    const extPath = this.vscontext.extensionUri.fsPath;
                    const linkerTemplate = path.join(extPath, "resources", "templates", "dvdt.linker.xml");
                    const newLinkerFileUri = vscode.Uri.joinPath(workspaceFolder, "dvdt.linker.xml");
                    yield FileSystem_1.copyFolderOrFile(linkerTemplate, newLinkerFileUri.fsPath);
                    return newLinkerFileUri;
                }
                return linkerFileUri;
            }
            return undefined;
        });
    }
    getLinkerFile() {
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFiles = yield vscode.workspace.findFiles("**/dvdt.linker.xml", "**/node_modules/**");
            if (linkerFiles.length > 0) {
                //console.log(linkerFiles[0]);
                return linkerFiles[0];
            }
            return undefined;
        });
    }
}
exports.CommonHelper = CommonHelper;
//# sourceMappingURL=CommonHelper.js.map