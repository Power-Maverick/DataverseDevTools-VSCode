/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import * as path from "path";
import { copyFolderOrFile, getFileExtension, getFileName, getRelativeFilePath, getWorkspaceFolder, readFileSync, writeFileSync } from "../utils/FileSystem";
import { jsonToXML, xmlToJSON } from "../utils/Parsers";
import { ILinkerFile, ILinkerRes, ISmartMatchRecord, IWebResource, IWebResources } from "../utils/Interfaces";
import { DataverseHelper } from "./dataverseHelper";
import { State } from "../utils/State";
import { smartMatchStoreKey, WebResourceType, wrDefinitionsStoreKey } from "../utils/Constants";
import { Placeholders } from "../utils/Placeholders";
import { ErrorMessages } from "../utils/ErrorMessages";
import { reduce } from "conditional-reduce";
import { encodeToBase64, extractGuid } from "../utils/ExtensionMethods";
import { ViewBase } from "../views/ViewBase";
import { SmartMatchView } from "../views/SmartMatchView";

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
        if (!resourceToUpload) {
            let wrLinkQPOptions = ["Link to existing web resource & upload", "Upload as new web resource"];
            let wrLinkOptionsQP: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.webResourceLinkSelection);
            let wrLinkQPResponse = await vscode.window.showQuickPick(wrLinkQPOptions, wrLinkOptionsQP);

            if (wrLinkQPResponse) {
                if (wrLinkQPResponse === wrLinkQPOptions[0]) {
                    resourceToUpload = await this.linkWebResource(fullPath);
                    await this.uploadWebResourceInternal(fullPath, resourceToUpload);
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
                    }
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

            jsFiles.forEach((jsFile) => {
                const localFileName = getFileName(jsFile.fsPath);
                const localRelativePath = getRelativeFilePath(jsFile.fsPath, getWorkspaceFolder()?.fsPath!);
                console.log(localRelativePath);

                // Match with Display Name exact match
                let wrFoundByName = jsonWRs.value.find((wr) => wr.displayname?.toLowerCase() === localFileName.toLowerCase());
                if (wrFoundByName) {
                    smartMatches.push({
                        wrId: wrFoundByName.webresourceid!,
                        wrDisplayName: wrFoundByName.displayname!,
                        wrPath: wrFoundByName.name!,
                        localFileName: localFileName,
                        localFilePath: localRelativePath,
                        confidenceLevel: 100,
                    });
                } else {
                    // Match with File Name search in Server Path
                    let wrFoundByNameSearch = jsonWRs.value.find((wr) => wr.name?.toLowerCase()?.search(localFileName.toLowerCase())! > 0);
                    if (wrFoundByNameSearch) {
                        smartMatches.push({
                            wrId: wrFoundByNameSearch.webresourceid!,
                            wrDisplayName: wrFoundByNameSearch.displayname!,
                            wrPath: wrFoundByNameSearch.name!,
                            localFileName: localFileName,
                            localFilePath: localRelativePath,
                            confidenceLevel: 60,
                        });
                    }
                }
            });

            const webview = await view.getWebView({ type: "showSmartMatch", title: "Smart Match" });
            new SmartMatchView(smartMatches, webview, this.vscontext);
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
                    return { label: w.displayname!, data: w };
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
                return this.addInLinkerFile(resc);
            }
        }
    }

    async addInLinkerFile(resc: ILinkerRes): Promise<ILinkerRes | undefined> {
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
            return resc;
        }
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

    async uploadWebResourceInternal(fullPath: string, resc?: ILinkerRes): Promise<IWebResource | undefined> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: "Uploading Web Resources",
            },
            async (progress, token) => {
                token.onCancellationRequested(() => {
                    console.log("User canceled the long running operation");
                    return;
                });
                progress.report({ increment: 0, message: "Uploading..." });
                if (resc) {
                    const wr: IWebResource = {
                        content: encodeToBase64(readFileSync(fullPath)),
                    };
                    await this.dvHelper.updateWebResourceContent(resc["@_Id"], wr);
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
                            return wr;
                        }
                    }
                }
                progress.report({ increment: 100 });
                vscode.window.showInformationMessage(`Web Resource uploaded.`);
            },
        );
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
                if (linkerFileDataJson.DVDT.WebResources.Resource) {
                    const linkFileName = linkerFileDataJson.DVDT.WebResources.Resource["@_localFileName"];
                    const linkFilePath = linkerFileDataJson.DVDT.WebResources.Resource["@_localFilePath"];
                    return linkFileName === localFileName && linkFilePath === localRelativePath ? linkerFileDataJson.DVDT.WebResources.Resource : undefined;
                }
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
