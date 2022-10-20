import * as vscode from "vscode";
import { CliCommandTreeItem } from "../cliCommands/cliCommandsDataProvider";
import { Commands } from "../terminals/commands";
import { Console } from "../terminals/console";
import { ErrorMessages } from "../utils/ErrorMessages";
import { IPowerPlatformCLICommandParameter } from "../utils/Interfaces";
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

    public async executeCliCommand(cliItem: CliCommandTreeItem) {
        let commands: string[] = Array();

        if (cliItem.cliDetails?.parameters && cliItem.cliDetails?.parameters.length > 0) {
            // With multiple parameters
            let parameters: string[] | undefined = await this.getParameters(cliItem.cliDetails.subcommand, cliItem.cliDetails.parameters);

            let mainCommand: string = `pac ${cliItem.cliDetails?.group} ${cliItem.cliDetails?.subcommand}`;
            if (parameters) {
                mainCommand += ` ${parameters.join(" ")}`;
            }
            commands.push(mainCommand);
        } else {
            // No parameters
            commands.push(`pac ${cliItem.cliDetails?.group} ${cliItem.cliDetails?.subcommand}`);
        }

        if (commands.length > 0) {
            Console.runCommand(commands);
        }
    }

    async getParameters(subcommand: string, parameters: IPowerPlatformCLICommandParameter[]) {
        let pArray: string[] = Array();
        for await (const param of parameters) {
            if (param.isRequired) {
                switch (param.type) {
                    case "string":
                        let paramResponse: string | undefined = await vscode.window.showInputBox({ title: `Parameters for ${subcommand}`, prompt: param.name, placeHolder: param.placeholder });
                        if (paramResponse) {
                            pArray.push(`--${param.name} ${paramResponse}`);
                        } else {
                            vscode.window.showErrorMessage(`${param.name} is required.`);
                            return undefined;
                        }
                        break;
                    case "optionset":
                        break;
                    default:
                        break;
                }
            }
        }
        return pArray;
    }
}
