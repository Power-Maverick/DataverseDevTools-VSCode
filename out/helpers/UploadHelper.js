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
exports.UploadHelper = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
const vscode = require("vscode");
const path = require("path");
const FileSystem_1 = require("../utils/FileSystem");
const Parsers_1 = require("../utils/Parsers");
const State_1 = require("../utils/State");
const Constants_1 = require("../utils/Constants");
const Placeholders_1 = require("../utils/Placeholders");
const ErrorMessages_1 = require("../utils/ErrorMessages");
const conditional_reduce_1 = require("conditional-reduce");
const ExtensionMethods_1 = require("../utils/ExtensionMethods");
class UploadHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext, dvHelper) {
        this.vscontext = vscontext;
        this.dvHelper = dvHelper;
        this.vsstate = new State_1.State(vscontext);
    }
    uploadWebResource(fullPath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let resourceToUpload = yield this.getLinkedResourceByLocalFileName(fullPath);
            if (!resourceToUpload) {
                let wrLinkQPOptions = ["Link to existing web resource & upload", "Upload as new web resource"];
                let wrLinkOptionsQP = Placeholders_1.Placeholders.getQuickPickOptions(Placeholders_1.Placeholders.webResourceLinkSelection);
                let wrLinkQPResponse = yield vscode.window.showQuickPick(wrLinkQPOptions, wrLinkOptionsQP);
                if (wrLinkQPResponse) {
                    if (wrLinkQPResponse === wrLinkQPOptions[0]) {
                        resourceToUpload = yield this.linkWebResource(fullPath);
                        yield this.uploadWebResourceInternal(fullPath, resourceToUpload);
                    }
                    else if (wrLinkQPResponse === wrLinkQPOptions[1]) {
                        const wr = yield this.uploadWebResourceInternal(fullPath);
                        if (wr) {
                            const localFileName = FileSystem_1.getFileName(fullPath);
                            const localRelativePath = FileSystem_1.getRelativeFilePath(fullPath, (_a = FileSystem_1.getWorkspaceFolder()) === null || _a === void 0 ? void 0 : _a.fsPath);
                            const resc = {
                                "@_Id": wr.webresourceid,
                                "@_dvDisplayName": wr.displayname,
                                "@_dvFilePath": wr.name,
                                "@_localFileName": localFileName,
                                "@_localFilePath": localRelativePath,
                            };
                            this.addInLinkerFile(resc);
                        }
                    }
                }
            }
            else {
                yield this.uploadWebResourceInternal(fullPath, resourceToUpload);
            }
        });
    }
    getLinkedResourceStrings(attrName) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFile = yield this.getLinkerFile();
            if (linkerFile) {
                const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                    return linkerFileDataJson.DVDT.WebResources.Resource.map((r) => r[attrName]);
                }
                else {
                    return [linkerFileDataJson.DVDT.WebResources.Resource[attrName]];
                }
            }
        });
    }
    linkWebResource(fullPath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const localFileName = FileSystem_1.getFileName(fullPath);
            const localRelativePath = FileSystem_1.getRelativeFilePath(fullPath, (_a = FileSystem_1.getWorkspaceFolder()) === null || _a === void 0 ? void 0 : _a.fsPath);
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
                if (wrQPResponse) {
                    const resc = {
                        "@_Id": wrQPResponse.data.webresourceid,
                        "@_dvDisplayName": wrQPResponse.data.displayname,
                        "@_dvFilePath": wrQPResponse.data.name,
                        "@_localFileName": localFileName,
                        "@_localFilePath": localRelativePath,
                    };
                    return this.addInLinkerFile(resc);
                }
            }
        });
    }
    addInLinkerFile(resc) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFile = yield this.createLinkerFile();
            if (linkerFile) {
                const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                if (!linkerFileDataJson.DVDT.WebResources) {
                    linkerFileDataJson.DVDT.WebResources = {
                        Resource: [],
                    };
                }
                if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                    linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
                }
                else {
                    const tResc = linkerFileDataJson.DVDT.WebResources.Resource;
                    linkerFileDataJson.DVDT.WebResources.Resource = [];
                    linkerFileDataJson.DVDT.WebResources.Resource.push(tResc);
                    linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
                }
                FileSystem_1.writeFileSync(linkerFile.fsPath, Parsers_1.jsonToXML(linkerFileDataJson));
                vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
                return resc;
            }
        });
    }
    createWebResourceInLinkerFile(resc) {
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFile = yield this.createLinkerFile();
            if (linkerFile) {
                const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                if (!linkerFileDataJson.DVDT.WebResources) {
                    linkerFileDataJson.DVDT.WebResources = {
                        Resource: [],
                    };
                }
                if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                    linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
                }
                else {
                    const tResc = linkerFileDataJson.DVDT.WebResources.Resource;
                    linkerFileDataJson.DVDT.WebResources.Resource = [];
                    linkerFileDataJson.DVDT.WebResources.Resource.push(tResc);
                    linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
                }
                FileSystem_1.writeFileSync(linkerFile.fsPath, Parsers_1.jsonToXML(linkerFileDataJson));
                vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
            }
        });
    }
    uploadWebResourceInternal(fullPath, resc) {
        return __awaiter(this, void 0, void 0, function* () {
            if (resc) {
                const wr = {
                    content: ExtensionMethods_1.encodeToBase64(FileSystem_1.readFileSync(fullPath)),
                };
                yield this.dvHelper.updateWebResourceContent(resc["@_Id"], wr);
            }
            else {
                const wr = yield this.webResourceCreateWizard(fullPath);
                if (wr) {
                    const solutionUniqueName = wr.description;
                    wr.description = null;
                    let wrId = yield this.dvHelper.createWebResource(wr);
                    if (wrId) {
                        wrId = ExtensionMethods_1.extractGuid(wrId);
                        this.dvHelper.addWRToSolution(solutionUniqueName, wrId);
                        wr.webresourceid = wrId;
                        return wr;
                    }
                }
            }
        });
    }
    getLinkedResourceByLocalFileName(fullFilePath) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const linkerFile = yield this.getLinkerFile();
            if (linkerFile) {
                const localFileName = FileSystem_1.getFileName(fullFilePath);
                const localRelativePath = FileSystem_1.getRelativeFilePath(fullFilePath, (_a = FileSystem_1.getWorkspaceFolder()) === null || _a === void 0 ? void 0 : _a.fsPath);
                const linkerFileData = FileSystem_1.readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = Parsers_1.xmlToJSON(linkerFileData);
                if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                    return linkerFileDataJson.DVDT.WebResources.Resource.find((r) => r["@_localFileName"] === localFileName && r["@_localFilePath"] === localRelativePath);
                }
                else {
                    if (linkerFileDataJson.DVDT.WebResources.Resource) {
                        const linkFileName = linkerFileDataJson.DVDT.WebResources.Resource["@_localFileName"];
                        const linkFilePath = linkerFileDataJson.DVDT.WebResources.Resource["@_localFilePath"];
                        return linkFileName === localFileName && linkFilePath === localRelativePath ? linkerFileDataJson.DVDT.WebResources.Resource : undefined;
                    }
                }
            }
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
    webResourceCreateWizard(fullPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get solutions (need prefix on that)
            const solutions = yield this.dvHelper.getSolutions();
            if (solutions) {
                let solQPOptions = solutions.value.map((s) => {
                    return { label: s.friendlyname, data: s };
                });
                let solOptionsQP = Placeholders_1.Placeholders.getQuickPickOptions(Placeholders_1.Placeholders.solutionSelection);
                let solQPResponse = yield vscode.window.showQuickPick(solQPOptions, solOptionsQP);
                if (solQPResponse) {
                    const prefix = solQPResponse.data.publisherid.customizationprefix;
                    const solId = solQPResponse.data.solutionid;
                    const solName = solQPResponse.data.uniquename;
                    let wrDisplayNameUR = yield vscode.window.showInputBox(Placeholders_1.Placeholders.getInputBoxOptions(Placeholders_1.Placeholders.wrDisplayName));
                    if (!wrDisplayNameUR) {
                        vscode.window.showErrorMessage(ErrorMessages_1.ErrorMessages.wrDisplayNameRequired);
                        return undefined;
                    }
                    let wrNameUR = yield vscode.window.showInputBox(Placeholders_1.Placeholders.getInputBoxOptions(Placeholders_1.Placeholders.wrUniqueName));
                    if (!wrNameUR) {
                        wrNameUR = wrDisplayNameUR;
                    }
                    const wrType = conditional_reduce_1.reduce(FileSystem_1.getFileExtension(fullPath), {
                        js: () => Constants_1.WebResourceType.script,
                        css: () => Constants_1.WebResourceType.css,
                        html: () => Constants_1.WebResourceType.html,
                        htm: () => Constants_1.WebResourceType.html,
                    });
                    const wrContent = ExtensionMethods_1.encodeToBase64(FileSystem_1.readFileSync(fullPath));
                    return { displayname: wrDisplayNameUR, name: `${prefix}_${wrNameUR}`, webresourcetype: wrType, content: wrContent, solutionid: solId, description: solName };
                }
            }
            // Ask for
            //  Display Name
            //  Name
            //  Web Resource Type (infer it from file extension)
            //  Content (get it from the file & convert it to base64)
        });
    }
}
exports.UploadHelper = UploadHelper;
/**
 * private convertType(t: string): dom.Type {
        return reduce<dom.Type>(
            t,
            {
                string: () => dom.type.string,
                integer: () => dom.type.number,
                double: () => dom.type.number,
                uniqueidentifier: () => dom.type.string,
                memo: () => dom.type.string,
                money: () => dom.type.number,
                boolean: () => dom.type.boolean,
                bigint: () => dom.type.number,
                decimal: () => dom.type.number,
                datetime: () => dom.type.string,
            },
            () => dom.type.object,
        );
    }
 */
//# sourceMappingURL=UploadHelper.js.map