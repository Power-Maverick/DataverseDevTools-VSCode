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
exports.getFileExtension = exports.getWorkspaceFolder = exports.getRelativeFilePath = exports.getFileName = exports.createFolder = exports.copyFolderOrFile = exports.writeFileSync = exports.readFileSync = void 0;
const vscode = require("vscode");
const fs = require("fs-extra");
function readFileSync(source) {
    return fs.readFileSync(source);
}
exports.readFileSync = readFileSync;
function writeFileSync(source, data) {
    return fs.writeFileSync(source, data);
}
exports.writeFileSync = writeFileSync;
function copyFolderOrFile(source, target) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.copy(source, target);
    });
}
exports.copyFolderOrFile = copyFolderOrFile;
function createFolder(folderDirPath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield fs.ensureDir(folderDirPath);
    });
}
exports.createFolder = createFolder;
function getFileName(fullPath) {
    return fullPath.replace(/^.*[\\\/]/, "");
}
exports.getFileName = getFileName;
function getRelativeFilePath(fullPath, currentDirPath) {
    return fullPath.replace(currentDirPath, "/").replace(/\\/g, "/").replace(/^\\/g, "");
}
exports.getRelativeFilePath = getRelativeFilePath;
function getWorkspaceFolder() {
    if (vscode.workspace.workspaceFolders !== undefined) {
        return vscode.workspace.workspaceFolders[0].uri;
        //let f = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
}
exports.getWorkspaceFolder = getWorkspaceFolder;
function getFileExtension(fullPath) {
    return fullPath.split(".").pop();
}
exports.getFileExtension = getFileExtension;
//# sourceMappingURL=FileSystem.js.map