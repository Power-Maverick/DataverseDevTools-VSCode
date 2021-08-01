import * as vscode from "vscode";
import * as path from "path";
import { copyFolderOrFile, createFolder } from "../utils/FileSystem";
import { Commands } from "../terminals/Commands";
import { Console } from "../terminals/Console";
import { extensionName } from "../utils/Constants";

export class TemplateHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {}

    public async initiateTypeScriptProject(wsPath: string) {
        const extPath = this.vscontext.extensionUri.fsPath;
        const tsFolderUri = path.join(extPath, "resources", "templates", "TypeScript");

        if (wsPath) {
            await copyFolderOrFile(tsFolderUri, wsPath);
        }

        let commands: string[] = Array();
        commands.push(Commands.LoadNpmPackages());
        commands.push(Commands.LinkGlobalTypeScript());
        Console.runCommand(commands);

        vscode.window.showInformationMessage(`${extensionName}: TypeScript project initialized.`);
    }
}
