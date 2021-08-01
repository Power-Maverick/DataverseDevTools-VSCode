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
exports.createFolder = exports.copyFolderOrFile = exports.readFileSync = void 0;
const fs = require("fs-extra");
function readFileSync(source) {
    return fs.readFileSync(source);
}
exports.readFileSync = readFileSync;
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
//# sourceMappingURL=FileSystem.js.map