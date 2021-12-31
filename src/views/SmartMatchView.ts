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
                                if (parsed.id !== "undefined") {
                                    const sm: ISmartMatchRecord[] = this.smartMatches.filter((sm) => {
                                        if (sm.wrId === parsed.id) {
                                            return sm;
                                        }
                                    });
                                    if (sm && sm.length > 0) {
                                        this.linkFiles([sm[0]]);
                                    }
                                } else {
                                    this.linkNewFile(parsed.fp);
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
                this.uploadHelper.linkWebResourceById(r.localFullPath, r.wrId!);
                let smIndex = this.smartMatches.findIndex((obj) => obj.wrId === r.wrId);
                this.smartMatches[smIndex].linked = true;
                this.smartMatches[smIndex].confidenceLevel = 100;
            });
        }
        vscode.window.showInformationMessage(`Smart Match linked ${sm ? sm.length : 0} records`);
        super.update();
    }

    async linkNewFile(fullPath: string) {
        const wrDetails = await this.uploadHelper.uploadWebResource(decodeURI(fullPath));
        if (wrDetails) {
            let smIndex = this.smartMatches.findIndex((obj) => obj.localFullPath === decodeURI(fullPath));
            this.smartMatches[smIndex].wrId = wrDetails.webresourceid!;
            this.smartMatches[smIndex].wrDisplayName = wrDetails.displayname!;
            this.smartMatches[smIndex].wrPath = wrDetails.name!;
            this.smartMatches[smIndex].linked = true;
            this.smartMatches[smIndex].confidenceLevel = 100;

            vscode.window.showInformationMessage(`Smart Match linked the records`);
            super.update();
        }
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
                // Local
                viewModel.matches += `<td>${a.localFileName}</td>`;
                viewModel.matches += `<td>${a.localFilePath}</td>`;

                // Server & Matches
                viewModel.matches += `<td>${a.wrDisplayName || "--"}</td>`;
                viewModel.matches += `<td>${a.wrPath || "--"}</td>`;
                viewModel.matches += `<td>${a.wrId || "--"}</td>`;
                viewModel.matches += `<td>${a.confidenceLevel || "0"}</td>`;

                if (a.linked) {
                    viewModel.matches += `<td class="fs2 status green"><i class="bi bi-check-square-fill"></i></td>`;
                    viewModel.matches += `<td class="action-items"><button class="btn btn-primary btn-sm btn-circle" onclick="upload('${encodeURI(a.localFullPath)}')"><i class="bi bi-cloud-upload"></i></button>`;
                    viewModel.matches += `<div>Upload</div></td>`;
                } else {
                    if (a.confidenceLevel) {
                        viewModel.matches += `<td class="status orange"><i class="bi bi-info-square-fill"></i><div class="f-x-small">Smart Match</div></td>`;
                    } else {
                        viewModel.matches += `<td class="status red"><i class="bi bi-x-square-fill"></i></td>`;
                    }
                    viewModel.matches += `<td class="action-items"><button class="btn btn-primary btn-sm btn-circle" onclick="link('${encodeURI(a.localFullPath)}','${a.wrId}')"><i class="bi bi-link-45deg"></i></button>`;
                    viewModel.matches += `<div>Link</div></td>`;
                }
                viewModel.matches += `</tr>`;
            });
        }

        return super.render(compiled(viewModel));
    }
}
