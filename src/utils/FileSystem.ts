import * as vscode from "vscode";
import * as os from "os";
import * as path from "path";
import * as fs from "fs-extra";
import { extensionCodeName } from "../utils/Constants";

export function readFileSync(source: string): any {
    return fs.readFileSync(source);
}

export function readFileAsBase64Sync(source: string): any {
    return fs.readFileSync(source, "base64");
}

export function writeFileSync(source: string, data: string): any {
    return fs.writeFileSync(source, data);
}

export async function copyFolderOrFile(source: string, target: string) {
    await fs.copy(source, target, { overwrite: true });
}

export async function createFolder(folderDirPath: string) {
    await fs.ensureDir(folderDirPath);
}

export function getFileName(fullPath: string) {
    return fullPath.replace(/^.*[\\\/]/, "");
}

export function getRelativeFilePath(fullPath: string, currentDirPath: string) {
    return fullPath.replace(currentDirPath, "/").replace(/\\/g, "/").replace(/^\\/g, "");
}

export function getWorkspaceFolder(): vscode.Uri | undefined {
    if (vscode.workspace.workspaceFolders !== undefined) {
        return vscode.workspace.workspaceFolders[0].uri;
        //let f = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
}

export function pathExists(fspath: string) {
    return fs.pathExistsSync(fspath);
}

export function getFileExtension(fullPath: string): string | undefined {
    return fullPath.split(".").pop();
}

export async function createTempDirectory() {
    const scratchDirectory = path.join(os.tmpdir(), extensionCodeName);
    const dayjs = require("dayjs");
    const timestamp = dayjs().format("YYYYMMDD");
    const tempDirectory = path.join(scratchDirectory, timestamp);

    const uri = vscode.Uri.file(tempDirectory);
    await vscode.workspace.fs.createDirectory(uri);

    return uri;
}
