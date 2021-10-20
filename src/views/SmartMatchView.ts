import * as vscode from "vscode";
import * as path from "path";
import { ISmartMatchRecord } from "../utils/Interfaces";
import { Panel } from "./PanelBase";
import { readFileSync } from "../utils/FileSystem";
import _ = require("lodash");
import { UploadHelper } from "../helpers/uploadHelper";

export class SmartMatchView extends Panel {
    smartMatches: ISmartMatchRecord[] = [];

    constructor(matches: ISmartMatchRecord[], webview: vscode.WebviewPanel, vscontext: vscode.ExtensionContext, private uploadHelper: UploadHelper) {
        super({ panel: webview, extensionUri: vscontext.extensionUri, webViewFileName: "smartmatch.html" });
        this.smartMatches = matches;
        // Set the webview's initial html content
        super.update();

        // Handle messages from the webview
        this.webViewPanel.webview.onDidReceiveMessage(({ command, value }) => {
            switch (command) {
                case "alert":
                    if (value) {
                        vscode.window.showInformationMessage(value);
                    }
                    break;
                case "link":
                    if (value === "100only") {
                        this.linkFiles(
                            this.smartMatches?.filter((sm) => {
                                if (sm.confidenceLevel === 100 && !sm.linked) {
                                    return sm;
                                }
                            }),
                        );
                    } else if (value === "all") {
                        this.linkFiles(
                            this.smartMatches?.filter((sm) => {
                                if (!sm.linked) {
                                    return sm;
                                }
                            }),
                        );
                    }
                    break;
                case "upload":
                    vscode.window.showInformationMessage("Uploading");
                    this.uploadFiles(
                        this.smartMatches?.filter((sm) => {
                            if (sm.linked) {
                                return sm;
                            }
                        }),
                    );
                    break;
            }
        });
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
                viewModel.matches += `</tr>`;
            });
        }

        return super.render(compiled(viewModel));
    }
}
