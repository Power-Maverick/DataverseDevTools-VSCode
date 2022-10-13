import * as vscode from "vscode";
import { Commands } from "../terminals/commands";
import { Console } from "../terminals/console";

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

    public launchPRT() {
        let commands: string[] = Array();
        commands.push(Commands.LaunchPluginRegistration());
        Console.runCommand(commands);
    }

    public launchCMT() {
        let commands: string[] = Array();
        commands.push(Commands.LaunchConfigurationMigration());
        Console.runCommand(commands);
    }

    public launchPD() {
        let commands: string[] = Array();
        commands.push(Commands.LaunchPackageDeployer());
        Console.runCommand(commands);
    }
}
