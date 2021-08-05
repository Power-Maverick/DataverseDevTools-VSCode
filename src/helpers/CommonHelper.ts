/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";
import { v4 as uuid } from "uuid";
import { copyFolderOrFile, getFileName, readFileSync, writeFileSync } from "../utils/FileSystem";
import { jsonToXML, xmlToJSON } from "../utils/Parsers";
import { ILinkerFile, ILinkerRes, IWebResources } from "../utils/Interfaces";
import { DataverseHelper } from "./DataverseHelper";
import { State } from "../utils/State";
import { WebResourceType, wrDefinitionsStoreKey } from "../utils/Constants";
import { Placeholders } from "../utils/Placeholders";

export class CommonHelper {
    private vsstate: State;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {
        this.vsstate = new State(vscontext);
    }

    public async linkWebResource(fullPath: string) {
        await this.dvHelper.getWebResources();
        const jsonWRs: IWebResources = this.vsstate.getFromWorkspace(wrDefinitionsStoreKey);

        if (jsonWRs) {
            let wrQPOptions = jsonWRs.value
                .filter((w) => w.webresourcetype === WebResourceType.script)
                .map((w) => {
                    return { label: w.displayname, data: w };
                });
            let wrOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.webResourceSelection);
            let wrQPResponse = await vscode.window.showQuickPick(wrQPOptions, wrOptionsQP);

            const linkerFile = await this.createLinkerFile();
            if (linkerFile && wrQPResponse) {
                const linkerFileData = readFileSync(linkerFile.fsPath).toString();
                const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

                let foundLink = linkerFileDataJson.DVDT.WebResources.Resource.find((r) => r["@_dvDisplayName"] === wrQPResponse?.data.displayname);
                if (!foundLink) {
                    linkerFileDataJson.DVDT.WebResources.Resource.push({
                        "@_Id": uuid(),
                        "@_dvDisplayName": wrQPResponse.data.displayname,
                        "@_dvFilePath": wrQPResponse.data.name,
                        "@_localFileName": getFileName(fullPath),
                    });
                    writeFileSync(linkerFile.fsPath, jsonToXML(linkerFileDataJson));
                }
            }
        }
    }

    public async getLinkedResourceStrings(): Promise<string[] | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (linkerFileDataJson.DVDT.WebResources && linkerFileDataJson.DVDT.WebResources.Resource) {
                return linkerFileDataJson.DVDT.WebResources.Resource.map((r) => r["@_localFileName"]);
            }
        }
    }

    public async getLinkedResources(): Promise<ILinkerRes[] | undefined> {
        const linkerFile = await this.createLinkerFile();
        if (linkerFile) {
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (linkerFileDataJson.DVDT.WebResources && linkerFileDataJson.DVDT.WebResources.Resource) {
                return linkerFileDataJson.DVDT.WebResources.Resource;
            }
        }
        return undefined;
    }

    async createLinkerFile(): Promise<vscode.Uri | undefined> {
        if (vscode.workspace.workspaceFolders) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
            const linkerFileUri = await this.getLinkerFile();
            if (!linkerFileUri) {
                const extPath = this.vscontext.extensionUri.fsPath;
                const linkerTemplate = path.join(extPath, "resources", "templates", "dvdt.linker.xml");
                const newLinkerFileUri = vscode.Uri.joinPath(workspaceFolder, "dvdt.linker.xml");
                await copyFolderOrFile(linkerTemplate, newLinkerFileUri.fsPath);
                return newLinkerFileUri;
            }
            return linkerFileUri;
        }
        return undefined;
    }

    async getLinkerFile(): Promise<vscode.Uri | undefined> {
        const linkerFiles = await vscode.workspace.findFiles("**/dvdt.linker.xml", "**/node_modules/**");
        if (linkerFiles.length > 0) {
            //console.log(linkerFiles[0]);
            return linkerFiles[0];
        }

        return undefined;
    }
}
