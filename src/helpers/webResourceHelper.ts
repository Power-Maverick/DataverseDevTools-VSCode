/* eslint-disable @typescript-eslint/naming-convention */
import { reduce } from "conditional-reduce";
import * as path from "path";
import * as vscode from "vscode";
import { extensionPrefix, WebResourceType, wrDefinitionsStoreKey } from "../utils/Constants";
import { ErrorMessages } from "../utils/ErrorMessages";
import { decodeFromBase64, encodeToBase64, extractGuid } from "../utils/ExtensionMethods";
import { copyFolderOrFile, createTempDirectory, getFileExtension, getFileName, getRelativeFilePath, getWorkspaceFolder, readFileAsBase64Sync, readFileSync, writeFileSync } from "../utils/FileSystem";
import { ILinkerFile, ILinkerRes, ISmartMatchRecord, IWebResource, IWebResources } from "../utils/Interfaces";
import { jsonToXML, xmlToJSON } from "../utils/Parsers";
import { Placeholders } from "../utils/Placeholders";
import { State } from "../utils/State";
import { SmartMatchView } from "../views/SmartMatchView";
import { ViewBase } from "../views/ViewBase";
import { DataverseHelper } from "./dataverseHelper";

export class WebResourceHelper {
    private vsstate: State;

    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {
        this.vsstate = new State(vscontext);
    }

    //#region Public
    public async uploadWebResource(fullPath: string) {
        let resourceToUpload: ILinkerRes | undefined = await this.getLinkedResourceByLocalFileName(fullPath);
        if (!resourceToUpload) {
            let wrLinkQPOptions = ["Link to existing web resource & upload", "Upload as new web resource"];
            let wrLinkOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.webResourceLinkSelection);
            let wrLinkQPResponse = await vscode.window.showQuickPick(wrLinkQPOptions, wrLinkOptionsQP);

            if (wrLinkQPResponse) {
                if (wrLinkQPResponse === wrLinkQPOptions[0]) {
                    resourceToUpload = await this.linkWebResource(fullPath);
                    return await this.uploadWebResourceInternal(fullPath, resourceToUpload);
                } else if (wrLinkQPResponse === wrLinkQPOptions[1]) {
                    const wr = await this.uploadWebResourceInternal(fullPath);
                    if (wr) {
                        const localFileName = getFileName(fullPath);
                        const localRelativePath = getRelativeFilePath(fullPath, getWorkspaceFolder()?.fsPath!);
                        const resc: ILinkerRes = {
                            "@_Id": wr.webresourceid!,
                            "@_dvDisplayName": wr.displayname!,
                            "@_dvFilePath": wr.name!,
                            "@_localFileName": localFileName,
                            "@_localFilePath": localRelativePath,
                        };
                        this.addInLinkerFile(resc);
                        return wr;
                    }
                }
            }
        } else {
            return await this.uploadWebResourceInternal(fullPath, resourceToUpload);
        }
    }

    public async compareWebResources(fullPath: string) {
        let resourceToCompare: ILinkerRes | undefined = await this.getLinkedResourceByLocalFileName(fullPath);
        if (resourceToCompare) {
            const base64Content = await this.dvHelper.getWebResourceContent(resourceToCompare["@_Id"]);
            if (base64Content) {
                const parsedContent = decodeFromBase64(base64Content);
                const tempDirUri = await createTempDirectory();
                const tempFilePath = vscode.Uri.joinPath(tempDirUri, `temp-${resourceToCompare["@_localFileName"]}`);
                writeFileSync(tempFilePath.fsPath, parsedContent);

                // The parameter order for vscode.diff is: left (original) <--> right (modified).
                // Here, we show the server version (tempFilePath) on the left and the local version (fullPath) on the right,
                // matching the label "Server <--> Local". This order ensures users see changes from server to local.
                await vscode.commands.executeCommand("vscode.diff", tempFilePath, vscode.Uri.file(fullPath), `Server <--> Local : ${resourceToCompare["@_dvDisplayName"]}`);
            }
        } else {
            vscode.window.showErrorMessage(ErrorMessages.wrCompareError);
        }
    }

    public async getLinkedResourceStrings(attrName: string): Promise<string[] | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);
            if (linkerFileDataJson.DVDT.WebResources.Resource) {
                if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                    return linkerFileDataJson.DVDT.WebResources.Resource.map((r) => r[attrName as keyof ILinkerRes]);
                } else {
                    return [linkerFileDataJson.DVDT.WebResources.Resource[attrName as keyof ILinkerRes]];
                }
            }
        }
    }

    public async smartMatchWebResources(view: ViewBase): Promise<void> {
        const jsonWRs: IWebResources = this.vsstate.getFromWorkspace(wrDefinitionsStoreKey);
        let smartMatches: ISmartMatchRecord[] = [];

        if (jsonWRs) {
            const jsFiles = await vscode.workspace.findFiles("**/*.js", "/node_modules/");
            const cssFiles = await vscode.workspace.findFiles("**/*.css", "/node_modules/");
            const htmlFiles = await vscode.workspace.findFiles("**/*.html", "/node_modules/");
            const htmFiles = await vscode.workspace.findFiles("**/*.htm", "/node_modules/");
            const xmlFiles = await vscode.workspace.findFiles("**/*.xml", "/node_modules/");
            const pngFiles = await vscode.workspace.findFiles("**/*.png", "/node_modules/");
            const jpgFiles = await vscode.workspace.findFiles("**/*.jpg", "/node_modules/");
            const gifFiles = await vscode.workspace.findFiles("**/*.gif", "/node_modules/");
            const xslFiles = await vscode.workspace.findFiles("**/*.xsl", "/node_modules/");
            const xsltFiles = await vscode.workspace.findFiles("**/*.xslt", "/node_modules/");
            const icoFiles = await vscode.workspace.findFiles("**/*.ico", "/node_modules/");
            const svgFiles = await vscode.workspace.findFiles("**/*.svg", "/node_modules/");
            const resxFiles = await vscode.workspace.findFiles("**/*.resx", "/node_modules/");

            await Promise.all(
                jsFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                cssFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                htmlFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                htmFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                pngFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                jpgFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                gifFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                xslFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                xsltFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                icoFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                svgFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            await Promise.all(
                resxFiles.map(async (file) => {
                    const sw = await this.processWRFiles(file, jsonWRs);
                    smartMatches.push(sw);
                }),
            );

            const webview = await view.getWebView({ type: "showSmartMatch", title: "Smart Match" });
            new SmartMatchView(smartMatches, webview, this.vscontext, this);
        }
    }

    public async linkWebResourceById(localFullPath: string, wrId: string): Promise<ILinkerRes | undefined> {
        const localFileName = getFileName(localFullPath);
        const localRelativePath = getRelativeFilePath(localFullPath, getWorkspaceFolder()?.fsPath!);
        const jsonWRs: IWebResources = this.vsstate.getFromWorkspace(wrDefinitionsStoreKey);

        if (jsonWRs) {
            let filteredWR = jsonWRs.value.filter((w) => w.webresourceid === wrId);
            if (filteredWR) {
                const resc: ILinkerRes = {
                    "@_Id": filteredWR[0].webresourceid!,
                    "@_dvDisplayName": filteredWR[0].displayname!,
                    "@_dvFilePath": filteredWR[0].name!,
                    "@_localFileName": localFileName,
                    "@_localFilePath": localRelativePath,
                };
                return this.addInLinkerFile(resc);
            }
        }
    }

    public async linkWebResource(fullPath: string): Promise<ILinkerRes | undefined> {
        const localFileName = getFileName(fullPath);
        const localRelativePath = getRelativeFilePath(fullPath, getWorkspaceFolder()?.fsPath!);
        const linkedResourceIndex: number = await this.getLinkedResourceIndexByLocalFileName(fullPath);

        if (linkedResourceIndex >= 0) {
            const respUpdateConfirm = await vscode.window.showWarningMessage("This file is already linked. Are you sure you want to re-link this file?", { detail: "Confirm your selection", modal: true }, "Yes", "No");
            if (respUpdateConfirm === "Yes") {
                let linkerRescForUpdate = await this.conformLinkerResc(localFileName, localRelativePath);
                if (linkerRescForUpdate) {
                    return await this.updateInLinkerFile(linkedResourceIndex, linkerRescForUpdate);
                }
            }
        } else {
            let linkerRescToAdd = await this.conformLinkerResc(localFileName, localRelativePath);
            if (linkerRescToAdd) {
                return await this.addInLinkerFile(linkerRescToAdd);
            }
        }
    }
    //#endregion Public

    //#region Private

    private async processWRFiles(wrFile: vscode.Uri, jsonWRs: IWebResources): Promise<ISmartMatchRecord> {
        const localFileName = getFileName(wrFile.fsPath);
        const localRelativePath = getRelativeFilePath(wrFile.fsPath, getWorkspaceFolder()?.fsPath!);

        let linkedResource: ILinkerRes | undefined = await this.getLinkedResourceByLocalFileName(wrFile.fsPath);
        let localContent = readFileAsBase64Sync(wrFile.fsPath);

        // Find in Linker first
        if (linkedResource && linkedResource["@_Id"]) {
            let wr = jsonWRs.value.find((wr) => wr.webresourceid === linkedResource?.["@_Id"]);

            return {
                wrId: linkedResource["@_Id"],
                wrDisplayName: linkedResource["@_dvDisplayName"],
                wrPath: linkedResource["@_dvFilePath"],
                localFileName: linkedResource["@_localFileName"],
                localFilePath: linkedResource["@_localFilePath"],
                localFullPath: wrFile.fsPath,
                confidenceLevel: 100,
                linked: true,
                base64ContentMatch: localContent === wr?.content,
            };
        } else {
            let confidence: number = 0;
            let wrMatch: IWebResource | undefined;
            // Match with Content & Display Name - 90
            const wrFoundByContentAndName = jsonWRs.value.find((wr) => wr.content === localContent && wr.displayname?.toLowerCase() === localFileName.toLowerCase());
            // Match with Content & Display Name - 80
            const wrFoundByContentAndNameSearch = jsonWRs.value.find((wr) => wr.content === localContent && wr.name?.toLowerCase()?.search(localFileName.toLowerCase())! > 0);
            // Match with Display Name exact match - 75
            const wrFoundByName = jsonWRs.value.find((wr) => wr.displayname?.toLowerCase() === localFileName.toLowerCase());
            // Match with File Name search in Server Path - 60
            const wrFoundByNameSearch = jsonWRs.value.find((wr) => wr.name?.toLowerCase()?.search(localFileName.toLowerCase())! > 0);

            if (wrFoundByContentAndName) {
                confidence = 90;
                wrMatch = wrFoundByContentAndName;
            } else if (wrFoundByContentAndNameSearch) {
                confidence = 80;
                wrMatch = wrFoundByContentAndNameSearch;
            } else if (wrFoundByName) {
                confidence = 75;
                wrMatch = wrFoundByName;
            } else if (wrFoundByNameSearch) {
                confidence = 60;
                wrMatch = wrFoundByNameSearch;
            }

            if (wrMatch) {
                return {
                    wrId: wrMatch.webresourceid!,
                    wrDisplayName: wrMatch.displayname!,
                    wrPath: wrMatch.name!,
                    localFileName: localFileName,
                    localFilePath: localRelativePath,
                    localFullPath: wrFile.fsPath,
                    confidenceLevel: confidence,
                    linked: linkedResource?.["@_dvFilePath"] === wrMatch.name!,
                };
            } else {
                // Default - No Match
                return {
                    localFileName: localFileName,
                    localFilePath: localRelativePath,
                    localFullPath: wrFile.fsPath,
                    linked: false,
                };
            }
        }
    }

    private async conformLinkerResc(localFileName: string, localRelativePath: string): Promise<ILinkerRes | undefined> {
        const jsonWRs: IWebResources = this.vsstate.getFromWorkspace(wrDefinitionsStoreKey);

        if (jsonWRs) {
            let wrQPOptions = jsonWRs.value
                // Allow mapping any WR type
                //.filter((w) => w.webresourcetype === WebResourceType.script)
                .map((w) => {
                    return { label: `${w.displayname!}  - ${w.name!}`, data: w };
                });
            let wrOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.webResourceSelection);
            let wrQPResponse = await vscode.window.showQuickPick(wrQPOptions, wrOptionsQP);

            if (wrQPResponse) {
                const resc: ILinkerRes = {
                    "@_Id": wrQPResponse.data.webresourceid!,
                    "@_dvDisplayName": wrQPResponse.data.displayname!,
                    "@_dvFilePath": wrQPResponse.data.name!,
                    "@_localFileName": localFileName,
                    "@_localFilePath": localRelativePath,
                };
                return resc;
            }
        }
    }

    private async addInLinkerFile(resc: ILinkerRes): Promise<ILinkerRes | undefined> {
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
            await this.updateLinkedResourcesContext();
            return resc;
        }
    }

    private async updateInLinkerFile(oldIndex: number, newResc: ILinkerRes): Promise<ILinkerRes | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                linkerFileDataJson.DVDT.WebResources.Resource[oldIndex] = newResc;
            } else {
                const tResc: ILinkerRes = linkerFileDataJson.DVDT.WebResources.Resource;
                linkerFileDataJson.DVDT.WebResources.Resource = [];
                linkerFileDataJson.DVDT.WebResources.Resource.push(newResc);
            }
            writeFileSync(linkerFile.fsPath, jsonToXML(linkerFileDataJson));
            vscode.commands.executeCommand("dvdt.explorer.webresources.loadWebResources");
            await this.updateLinkedResourcesContext();
            return newResc;
        }
    }

    private async createWebResourceInLinkerFile(resc: ILinkerRes) {
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
            await this.updateLinkedResourcesContext();
        }
    }

    private async uploadWebResourceInternal(fullPath: string, resc?: ILinkerRes): Promise<IWebResource | undefined> {
        var fileName = getFileName(fullPath);

        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Uploading ${fileName}`,
            },
            async (progress, token) => {
                try {
                    let id: string = "";
                    let wrReturn: IWebResource | undefined;
                    token.onCancellationRequested(() => {
                        console.log("User canceled the long running operation");
                        return;
                    });
                    progress.report({ increment: 0, message: "Uploading..." });
                    if (resc && resc["@_Id"]) {
                        const wr: IWebResource = {
                            content: encodeToBase64(readFileSync(fullPath)),
                        };
                        await this.dvHelper.updateWebResourceContent(resc["@_Id"], wr);
                        id = resc["@_Id"];
                        wrReturn = wr;
                        wrReturn.name = resc["@_dvFilePath"];
                        wrReturn.displayname = resc["@_dvDisplayName"];
                        wrReturn.webresourceid = resc["@_Id"];
                    } else {
                        const wr = await this.webResourceCreateWizard(fullPath);
                        if (wr) {
                            const solutionUniqueName = wr.description!;
                            wr.description = null;
                            let wrId = await this.dvHelper.createWebResource(wr);
                            if (wrId) {
                                wrId = extractGuid(wrId)!;
                                this.dvHelper.addWRToSolution(solutionUniqueName, wrId);
                                wr.webresourceid = wrId;
                                id = wrId;
                                wrReturn = wr;
                            }
                        }
                    }
                    progress.report({ increment: 50, message: "Publishing..." });
                    await this.dvHelper.publishWebResource(id);
                    progress.report({ increment: 100 });
                    vscode.window.showInformationMessage(`${fileName} uploaded.`);
                    return wrReturn;
                } catch (error) {
                    vscode.window.showErrorMessage(ErrorMessages.wrUploadError);
                    console.error("Error uploading web resource:", error);
                    throw error;
                }
            },
        );
    }

    private async getLinkedResourceByLocalFileName(fullFilePath: string): Promise<ILinkerRes | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const localFileName = getFileName(fullFilePath);
            const localRelativePath = getRelativeFilePath(fullFilePath, getWorkspaceFolder()?.fsPath!);
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                return linkerFileDataJson.DVDT.WebResources.Resource.find((r) => r["@_localFileName"] === localFileName && r["@_localFilePath"] === localRelativePath);
            } else {
                if (linkerFileDataJson.DVDT.WebResources.Resource) {
                    const linkFileName = linkerFileDataJson.DVDT.WebResources.Resource["@_localFileName"];
                    const linkFilePath = linkerFileDataJson.DVDT.WebResources.Resource["@_localFilePath"];
                    return linkFileName === localFileName && linkFilePath === localRelativePath ? linkerFileDataJson.DVDT.WebResources.Resource : undefined;
                }
            }
        }
    }

    private async getLinkedResourceIndexByLocalFileName(fullFilePath: string): Promise<number> {
        const linkerFile = await this.getLinkerFile();
        if (linkerFile) {
            const localFileName = getFileName(fullFilePath);
            const localRelativePath = getRelativeFilePath(fullFilePath, getWorkspaceFolder()?.fsPath!);
            const linkerFileData = readFileSync(linkerFile.fsPath).toString();
            const linkerFileDataJson = xmlToJSON<ILinkerFile>(linkerFileData);

            if (Array.isArray(linkerFileDataJson.DVDT.WebResources.Resource)) {
                return linkerFileDataJson.DVDT.WebResources.Resource.findIndex((r) => r["@_localFileName"] === localFileName && r["@_localFilePath"] === localRelativePath);
            } else {
                if (linkerFileDataJson.DVDT.WebResources.Resource) {
                    const linkFileName = linkerFileDataJson.DVDT.WebResources.Resource["@_localFileName"];
                    const linkFilePath = linkerFileDataJson.DVDT.WebResources.Resource["@_localFilePath"];
                    return linkFileName === localFileName && linkFilePath === localRelativePath ? 0 : -1;
                }
            }
        }
        return -1;
    }

    private async createLinkerFile(): Promise<vscode.Uri | undefined> {
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

    private async getLinkerFile(): Promise<vscode.Uri | undefined> {
        const linkerFiles = await vscode.workspace.findFiles("**/dvdt.linker.xml", "**/node_modules/**");
        if (linkerFiles.length > 0) {
            //console.log(linkerFiles[0]);
            return linkerFiles[0];
        }

        return undefined;
    }

    private async webResourceCreateWizard(fullPath: string): Promise<IWebResource | undefined> {
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
                    xml: () => WebResourceType.xml,
                    png: () => WebResourceType.png,
                    jpg: () => WebResourceType.jpg,
                    gif: () => WebResourceType.gif,
                    xsl: () => WebResourceType.xsl,
                    xslt: () => WebResourceType.xsl,
                    ico: () => WebResourceType.ico,
                    svg: () => WebResourceType.svg,
                    resx: () => WebResourceType.resx,
                });

                const wrContent = encodeToBase64(readFileSync(fullPath));

                return { displayname: wrDisplayNameUR, name: `${prefix}_${wrNameUR}`, webresourcetype: wrType, content: wrContent, solutionid: solId, description: solName };
            }
        }
    }

    /**
     * Update the VS Code context for linked resources to enable/disable context menu items
     */
    private async updateLinkedResourcesContext(): Promise<void> {
        const linkedFileNames = await this.getLinkedResourceStrings("@_localFileName");
        await vscode.commands.executeCommand("setContext", `${extensionPrefix}.linkedResources`, linkedFileNames);
    }

    //#endregion Private
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
