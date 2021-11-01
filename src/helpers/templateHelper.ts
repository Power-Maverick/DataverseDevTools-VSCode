import * as vscode from "vscode";
import * as path from "path";
import { copyFolderOrFile, createFolder, pathExists, readFileSync, writeFileSync } from "../utils/FileSystem";
import { Commands } from "../terminals/commands";
import { Console } from "../terminals/console";
import { extensionName, tsTemplateType } from "../utils/Constants";
import { Placeholders } from "../utils/Placeholders";
import { ErrorMessages } from "../utils/ErrorMessages";
import fetch from "node-fetch";
import { pascalize } from "../utils/ExtensionMethods";

export class TemplateHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {}

    public async initiateTypeScriptProject(wsPath: string) {
        let tsTemplateTypeOptions: string[] = tsTemplateType;
        let tsTemplateTypeOptionsQuickPick: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.tsTemplateType);
        let tsTemplateTypeResponse: string | undefined = await vscode.window.showQuickPick(tsTemplateTypeOptions, tsTemplateTypeOptionsQuickPick);

        const extPath = this.vscontext.extensionUri.fsPath;
        const tsFolderUri = path.join(extPath, "resources", "templates", "TypeScript");
        const wpFolderUri = path.join(extPath, "resources", "templates", "Webpack");

        // TypeScript Only is default
        if (wsPath) {
            await copyFolderOrFile(tsFolderUri, wsPath);

            if (tsTemplateTypeResponse === tsTemplateType[1]) {
                // Webpack
                await copyFolderOrFile(wpFolderUri, wsPath);
                let namespaceUR: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.tsNamespace));
                if (!namespaceUR) {
                    vscode.window.showErrorMessage(ErrorMessages.tsNamespaceRequired);
                    return undefined;
                }

                // Update webpack.config - remove library
                const webpackConfigFile = path.join(wsPath, "webpack.config.js");
                let webpackconfigContent: string = readFileSync(webpackConfigFile).toString();
                let modifiedWebpackconfigContent = webpackconfigContent.replace("NAMESPACE", namespaceUR);
                writeFileSync(webpackConfigFile, modifiedWebpackconfigContent);
            }

            await createFolder(path.join(wsPath, "src"));
            await createFolder(path.join(wsPath, "typings"));
            await createFolder(path.join(wsPath, "WebResources"));
            await createFolder(path.join(wsPath, "WebResources", "html"));
            await createFolder(path.join(wsPath, "WebResources", "js"));
        }

        let commands: string[] = Array();
        commands.push(Commands.LoadNpmPackages());
        Console.runCommand(commands);

        vscode.window.showInformationMessage(`${extensionName}: TypeScript project initialized.`);
    }

    public async addTypeScriptFile(wsPath: string) {
        let filenameUR: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.tsFileName));
        if (!filenameUR) {
            vscode.window.showErrorMessage(ErrorMessages.tsFileNameRequired);
            return undefined;
        }

        const extPath = this.vscontext.extensionUri.fsPath;
        const fileToCopyUri = path.join(wsPath, `${filenameUR}.ts`);
        const webpackConfigFile = path.join(wsPath, "..", "webpack.config.js");

        if (wsPath) {
            if (pathExists(webpackConfigFile)) {
                const filesUri = path.join(extPath, "resources", "templates", "Files", "dvts-wp.txt");
                await copyFolderOrFile(filesUri, fileToCopyUri);

                // Update webpack.config
                let webpackconfigContent: string = readFileSync(webpackConfigFile).toString();
                let line: string[] = webpackconfigContent.split("\n");
                let ind = line.indexOf("    entry: {");
                if (ind > 0) {
                    line.splice(ind + 1, 0, `        ${filenameUR}: \"./src/${filenameUR}\",`);
                } else {
                    ind = line.indexOf("    entry: {\r");
                    if (ind > 0) {
                        line.splice(ind + 1, 0, `        ${filenameUR}: \"./src/${filenameUR}\",`);
                    }
                }

                let modifiedWebpackconfigContent = line.join("\n");
                writeFileSync(webpackConfigFile, modifiedWebpackconfigContent);
            } else {
                const filesUri = path.join(extPath, "resources", "templates", "Files", "dvts-ts.txt");
                await copyFolderOrFile(filesUri, fileToCopyUri);
            }

            // Update newly created file
            let fileContent: string = readFileSync(fileToCopyUri).toString();
            writeFileSync(fileToCopyUri, fileContent.replace(/FILENAME/gi, pascalize(filenameUR)));
        }

        vscode.window.showInformationMessage(`${extensionName}: TypeScript file added.`);
    }
}
