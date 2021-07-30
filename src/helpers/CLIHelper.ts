import * as vscode from "vscode";
import { Commands } from "../terminals/Commands";
import { Console } from "../terminals/Console";

export class CLIHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {}

    public initiatePluginProject(path: string) {
        let commands: string[] = Array();
        commands.push(Commands.ChangeDirectory(path));
        commands.push(Commands.InitPlugin());
        Console.runCommand(commands);
    }
}
