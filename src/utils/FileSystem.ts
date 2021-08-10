import * as vscode from "vscode";
import * as fs from "fs-extra";

export function readFileSync(source: string): any {
    return fs.readFileSync(source);
}

export function writeFileSync(source: string, data: string): any {
    return fs.writeFileSync(source, data);
}

export async function copyFolderOrFile(source: string, target: string) {
    await fs.copy(source, target);
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

export function getFileExtension(fullPath: string): string | undefined {
    return fullPath.split(".").pop();
}
