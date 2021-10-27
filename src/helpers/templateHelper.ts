import * as vscode from "vscode";
import * as path from "path";
import { copyFolderOrFile, readFileSync, writeFileSync } from "../utils/FileSystem";
import { Commands } from "../terminals/commands";
import { Console } from "../terminals/console";
import { extensionName } from "../utils/Constants";
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
        let namespaceUR: string | undefined = await vscode.window.showInputBox(Placeholders.getInputBoxOptions(Placeholders.tsNamespace));

        const extPath = this.vscontext.extensionUri.fsPath;
        const tsFolderUri = path.join(extPath, "resources", "templates", "TypeScript");

        if (wsPath) {
            await copyFolderOrFile(tsFolderUri, wsPath);
        }

        // Update webpack.config - remove library
        const webpackConfigFile = path.join(wsPath, "webpack.config.js");
        let webpackconfigContent: string = readFileSync(webpackConfigFile).toString();
        if (!namespaceUR) {
            let line: string[] = webpackconfigContent.split("\n");
            let ind = line.indexOf('        library: ["NAMESPACE"],\r');
            if (ind > 0) {
                line.splice(ind, 2);
            }
            let modifiedWebpackconfigContent = line.join("\n");
            writeFileSync(webpackConfigFile, modifiedWebpackconfigContent);
        } else {
            let modifiedWebpackconfigContent = webpackconfigContent.replace("NAMESPACE", namespaceUR);
            writeFileSync(webpackConfigFile, modifiedWebpackconfigContent);
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
        const filesUri = path.join(extPath, "resources", "templates", "Files", "dvts.txt");
        const fileToCopyUri = path.join(wsPath, `${filenameUR}.ts`);
        const webpackConfigFile = path.join(wsPath, "..", "webpack.config.js");

        if (wsPath) {
            await copyFolderOrFile(filesUri, fileToCopyUri);

            // Update newly created file
            let fileContent: string = readFileSync(fileToCopyUri).toString();
            writeFileSync(fileToCopyUri, fileContent.replace(/FILENAME/gi, pascalize(filenameUR)));

            // Update webpack.config
            let webpackconfigContent: string = readFileSync(webpackConfigFile).toString();
            let line: string[] = webpackconfigContent.split("\n");
            let ind = line.indexOf("    entry: {\r");
            if (ind > 0) {
                line.splice(ind + 1, 0, `        ${filenameUR}: \"./src/${filenameUR}\",`);
            }

            let modifiedWebpackconfigContent = line.join("\n");
            writeFileSync(webpackConfigFile, modifiedWebpackconfigContent);
        }

        vscode.window.showInformationMessage(`${extensionName}: TypeScript file added.`);
    }
}
