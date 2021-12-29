import * as vscode from "vscode";
import * as path from "path";
import { ILinkView, ISmartMatchRecord } from "../utils/Interfaces";
import { Panel } from "./PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");
import { WebResourceHelper } from "../helpers/webResourceHelper";

export class SmartMatchView extends Panel {
    smartMatches: ISmartMatchRecord[] = [];

    constructor(matches: ISmartMatchRecord[], webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext, private uploadHelper: WebResourceHelper) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "smartmatch.html" });
        this.smartMatches = matches;

        // Handle messages from the webview
        this.webViewPanel.webview.onDidReceiveMessage(async ({ command, value }) => {
            switch (command) {
                case "alert":
                    if (value) {
                        vscode.window.showInformationMessage(value);
                    }
                    break;
                case "link":
                    switch (value) {
                        case "100only":
                            this.linkFiles(
                                this.smartMatches?.filter((sm) => {
                                    if (sm.confidenceLevel === 100 && !sm.linked) {
                                        return sm;
                                    }
                                }),
                            );
                            break;
                        case "all":
                            this.linkFiles(
                                this.smartMatches?.filter((sm) => {
                                    if (!sm.linked) {
                                        return sm;
                                    }
                                }),
                            );
                            break;
                        default:
                            if (value) {
                                const parsed: ILinkView = JSON.parse(value);
                                const sm: ISmartMatchRecord[] = this.smartMatches.filter((sm) => {
                                    if (sm.wrId === parsed.id) {
                                        return sm;
                                    }
                                });
                                if (sm && sm.length > 0) {
                                    this.linkFiles([sm[0]]);
                                }
                            }
                            break;
                    }
                    break;
                case "upload":
                    switch (value) {
                        case "all":
                            this.uploadFiles(
                                this.smartMatches?.filter((sm) => {
                                    if (sm.linked) {
                                        return sm;
                                    }
                                }),
                            );
                            break;
                        default:
                            if (value) {
                                await this.uploadHelper.uploadWebResource(decodeURI(value));
                                vscode.window.showInformationMessage(`Uploaded the records`);
                            }
                            break;
                    }
                    break;
            }
        });

        // Set the webview's initial html content
        super.update();
    }

    linkFiles(sm: ISmartMatchRecord[] | undefined) {
        if (sm) {
            sm.forEach((r) => {
                this.uploadHelper.linkWebResourceById(r.localFullPath, r.wrId);
                this.smartMatches[this.smartMatches.findIndex((obj) => obj.wrId === r.wrId)].linked = true;
            });
        }
        vscode.window.showInformationMessage(`Smart Match linked ${sm ? sm.length : 0} records`);
        super.update();
    }

    async uploadFiles(sm: ISmartMatchRecord[] | undefined) {
        if (sm) {
            await Promise.all(
                sm.map(async (rec) => {
                    await this.uploadHelper.uploadWebResource(rec.localFullPath);
                }),
            );
        }
        vscode.window.showInformationMessage(`Uploaded ${sm ? sm.length : 0} records`);
    }

    getHtmlForWebview(webviewFileName: string): string {
        const pathOnDisk = path.join(this.panelOptions.extensionUri.fsPath, "resources", "views", webviewFileName);
        const fileHtml = readFileSync(pathOnDisk).toString();
        _.templateSettings.interpolate = /!!{([\s\S]+?)}/g;
        const compiled = _.template(fileHtml);
        const viewModel = {
            matches: "",
        };

        if (this.smartMatches && this.smartMatches.length > 0) {
            this.smartMatches.forEach((a) => {
                viewModel.matches += `<tr>`;
                viewModel.matches += `<td>${a.wrId}</td>`;
                viewModel.matches += `<td>${a.wrDisplayName}</td>`;
                viewModel.matches += `<td>${a.localFileName}</td>`;
                viewModel.matches += `<td>${a.wrPath}</td>`;
                viewModel.matches += `<td>${a.localFilePath}</td>`;
                viewModel.matches += `<td>${a.confidenceLevel}</td>`;
                viewModel.matches += `<td><i class="material-icons">${a.linked ? "check_circle" : "cancel"}</i></td>`;
                if (a.linked) {
                    viewModel.matches += `<td><button class="btn-floating btn-small waves-effect waves-light red" onclick="upload('${encodeURI(
                        a.localFullPath,
                    )}')"><i class="material-icons right ln32">file_upload</i></button>`;
                    viewModel.matches += `<span class="pl5">Upload</span></td>`;
                } else {
                    viewModel.matches += `<td><button class="btn-floating btn-small waves-effect waves-light red" onclick="link('${encodeURI(a.localFullPath)}','${
                        a.wrId
                    }')"><i class="material-icons right ln32">link</i></button>`;
                    viewModel.matches += `<span class="pl5">Link</span></td>`;
                }
                viewModel.matches += `</tr>`;
            });
        }

        return super.render(compiled(viewModel));
    }
}
