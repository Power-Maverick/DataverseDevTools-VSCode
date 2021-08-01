import * as fs from "fs-extra";

export function readFileSync(source: string): any {
    return fs.readFileSync(source);
}

export async function copyFolderOrFile(source: string, target: string) {
    await fs.copy(source, target);
}

export async function createFolder(folderDirPath: string) {
    await fs.ensureDir(folderDirPath);
}
