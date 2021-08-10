/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";
import { copyFolderOrFile, getFileExtension, getFileName, getRelativeFilePath, getWorkspaceFolder, readFileSync, writeFileSync } from "../utils/FileSystem";
import { jsonToXML, xmlToJSON } from "../utils/Parsers";
import { ILinkerFile, ILinkerRes, IWebResource, IWebResources } from "../utils/Interfaces";
import { DataverseHelper } from "./DataverseHelper";
import { State } from "../utils/State";
import { WebResourceType, wrDefinitionsStoreKey } from "../utils/Constants";
import { Placeholders } from "../utils/Placeholders";
import { ErrorMessages } from "../utils/ErrorMessages";
import { reduce } from "conditional-reduce";
import { encodeToBase64, extractGuid } from "../utils/ExtensionMethods";

export class UploadHelper {
    private vsstate: State;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {
        this.vsstate = new State(vscontext);
    }

    public async uploadWebResource(fullPath: string) {
        let resourceToUpload: ILinkerRes | undefined = await this.getLinkedResourceByLocalFileName(fullPath);
        //const fileName = await this.linkWebResource(fullPath);
        if (!resourceToUpload) {
            // Link not found
            let wrLinkQPOptions = ["Link to existing web resource & upload", "Upload as new web resource"];
            let wrLinkOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.webResourceLinkSelection);
            let wrLinkQPResponse = await vscode.window.showQuickPick(wrLinkQPOptions, wrLinkOptionsQP);

            if (wrLinkQPResponse) {
                if (wrLinkQPResponse === wrLinkQPOptions[0]) {
                    // Link to existing
                    resourceToUpload = await this.linkWebResource(fullPath);

                    //this.uploadWebResourceInternal();
                } else if (wrLinkQPResponse === wrLinkQPOptions[1]) {
                    // Create new and add a link
                    //this.uploadWebResourceInternal();
                    // Create linker Resc object and pass it to below function
                    //this.createWebResourceInLinkerFile();
                }
            }
        } else {
            await this.uploadWebResourceInternal(fullPath, resourceToUpload);
        }
    }

    public async getLinkedResourceStrings(attrName: string): Promise<string[] | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                return linkerFileDataJson.DVDT.WebResources.Resource.map((r) => r[attrName as keyof ILinkerRes]);
            } else {
                return [linkerFileDataJson.DVDT.WebResources.Resource[attrName as keyof ILinkerRes]];
            }
        }
    }

    async linkWebResource(fullPath: string): Promise<ILinkerRes | undefined> {
        const localFileName = getFileName(fullPath);
        const localRelativePath = getRelativeFilePath(fullPath, getWorkspaceFolder()?.fsPath!);
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

                if (!linkerFileDataJson.DVDT.WebResources) {
                    linkerFileDataJson.DVDT.WebResources = {
                        Resource: [],
                    };
                }
                const resc: ILinkerRes = {
                    "@_Id": wrQPResponse.data.webresourceid!,
                    "@_dvDisplayName": wrQPResponse.data.displayname,
                    "@_dvFilePath": wrQPResponse.data.name,
                    "@_localFileName": localFileName,
                    "@_localFilePath": localRelativePath,
                };
                if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                    linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
                } else {
                    const tResc: ILinkerRes = linkerFileDataJson.DVDT.WebResources.Resource;
                    linkerFileDataJson.DVDT.WebResources.Resource = [];
                    linkerFileDataJson.DVDT.WebResources.Resource.push(tResc);
                    linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
                }
                writeFileSync(linkerFile.fsPath, jsonToXML(linkerFileDataJson));
                vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
                return resc;
            }
        }

        // const localFileName = getFileName(fullPath);
        // const localRelativePath = getRelativeFilePath(fullPath, getWorkspaceFolder()?.fsPath!);
        // const linkedFileNames = await this.getLinkedResourceStrings("@_localFileName");
        // const foundLink = linkedFileNames ? linkedFileNames.find((r) => r === localFileName) : false;

        // if (!foundLink) {

        // } else {
        //     return foundLink;
        // }
    }

    async createWebResourceInLinkerFile(resc: ILinkerRes) {
        const linkerFile = await this.createLinkerFile();
        if (linkerFile) {
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (!linkerFileDataJson.DVDT.WebResources) {
                linkerFileDataJson.DVDT.WebResources = {
                    Resource: [],
                };
            }

            if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
            } else {
                const tResc: ILinkerRes = linkerFileDataJson.DVDT.WebResources.Resource;
                linkerFileDataJson.DVDT.WebResources.Resource = [];
                linkerFileDataJson.DVDT.WebResources.Resource.push(tResc);
                linkerFileDataJson.DVDT.WebResources.Resource.push(resc);
            }
            writeFileSync(linkerFile.fsPath, jsonToXML(linkerFileDataJson));
            vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
        }
    }

    async uploadWebResourceInternal(fullPath: string, resc: ILinkerRes) {
        const wr = await this.webResourceCreateWizard(fullPath);
        if (wr) {
            const solutionUniqueName = wr.description!;
            wr.description = null;
            const wrId = await this.dvHelper.createWebResource(wr);
            if (wrId) {
                console.log(extractGuid(wrId));
                this.dvHelper.addWRToSolution(solutionUniqueName, extractGuid(wrId)!);
            }
        }

        //await this.dvHelper.createWebResource(resc);
    }

    async getLinkedResourceByLocalFileName(fullFilePath: string): Promise<ILinkerRes | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const localFileName = getFileName(fullFilePath);
            const localRelativePath = getRelativeFilePath(fullFilePath, getWorkspaceFolder()?.fsPath!);
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                return linkerFileDataJson.DVDT.WebResources.Resource.find((r) => r["@_localFileName"] === localFileName && r["@_localFilePath"] === localRelativePath);
            } else {
                const linkFileName = linkerFileDataJson.DVDT.WebResources.Resource["@_localFileName"];
                const linkFilePath = linkerFileDataJson.DVDT.WebResources.Resource["@_localFilePath"];
                return linkFileName === localFileName && linkFilePath === localRelativePath ? linkerFileDataJson.DVDT.WebResources.Resource : undefined;
            }
        }
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

    async webResourceCreateWizard(fullPath: string): Promise<IWebResource | undefined> {
        // Get solutions (need prefix on that)
        const solutions = await this.dvHelper.getSolutions();
        if (solutions) {
            let solQPOptions = solutions.value.map((s) => {
                return { label: s.friendlyname, data: s };
            });
            let solOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.solutionSelection);
            let solQPResponse = await vscode.window.showQuickPick(solQPOptions, solOptionsQP);

            if (solQPResponse) {
                const prefix = solQPResponse.data.publisherid.customizationprefix;
                const solId = solQPResponse.data.solutionid;
                const solName = solQPResponse.data.uniquename;

                let wrDisplayNameUR: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.wrDisplayName));
                if (!wrDisplayNameUR) {
                    vscode.window.showErrorMessage(ErrorMessages.wrDisplayNameRequired);
                    return undefined;
                }
                let wrNameUR: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.wrUniqueName));
                if (!wrNameUR) {
                    wrNameUR = wrDisplayNameUR;
                }

                const wrType = reduce(getFileExtension(fullPath)!, {
                    js: () => WebResourceType.script,
                    css: () => WebResourceType.css,
                    html: () => WebResourceType.html,
                    htm: () => WebResourceType.html,
                });

                const wrContent = encodeToBase64(readFileSync(fullPath));

                return { displayname: wrDisplayNameUR, name: `${prefix}_${wrNameUR}`, webresourcetype: wrType, content: wrContent, solutionid: solId, description: solName };
            }
        }

        // Ask for
        //  Display Name
        //  Name
        //  Web Resource Type (infer it from file extension)
        //  Content (get it from the file & convert it to base64)
    }
}

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
