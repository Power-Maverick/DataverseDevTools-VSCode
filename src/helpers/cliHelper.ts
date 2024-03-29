import * as vscode from "vscode";
import { CliCommandTreeItem } from "../cliCommands/cliCommandsDataProvider";
import { Commands } from "../terminals/commands";
import { Console } from "../terminals/console";
import { ICliCommandArgument } from "../utils/Interfaces";

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

        if (cliItem.cmdVerb?.arguments?.length! > 0) {
            // With multiple parameters
            let params: string[] | undefined = await this.getParameters(cliItem.cmdVerb?.name!, cliItem.cmdVerb?.arguments!);
            let mainCommand: string = `pac ${cliItem.cmd} ${cliItem.cmdVerb?.name}`;
            if (params) {
                mainCommand += ` ${params.join(" ")}`;
            }
            commands.push(mainCommand);
        } else {
            // No parameters
            commands.push(`pac ${cliItem.cmd} ${cliItem.cmdVerb?.name}`);
        }

        if (commands.length > 0) {
            Console.runCommand(commands);
        }
    }

    async getParameters(cmd: string, parameters: ICliCommandArgument[]) {
        let pArray: string[] = Array();
        let breakAll: boolean = false;

        for await (const param of parameters) {
            // Preview version will only include Required attributes
            if (param.isRequired) {
                if (param.isException && param.exception) {
                    let optionResp = await vscode.window.showQuickPick(["true", "false"], { placeHolder: param.exception.help!, title: param.exception.name!, ignoreFocusOut: true });
                    if (optionResp === "false") {
                        continue;
                    } else if (optionResp === "true" && param.exception.ifTrueSkipAll) {
                        breakAll = true;
                    }
                }

                if (param.isFile) {
                    let fileResp = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: false, canSelectMany: false, openLabel: `Select ${param.name}`, title: param.help! });
                    if (fileResp) {
                        pArray.push(`${param.name} "${fileResp[0].fsPath}"`);
                    }
                } else if (param.listOfValues) {
                    // Show Quick Options
                    var vals: string[] = new Array();
                    vals = param.listOfValues.split(",");
                    let optionResp = await vscode.window.showQuickPick(vals, { placeHolder: param.help!, title: `Option for ${param.name}`, ignoreFocusOut: true });
                    if (optionResp) {
                        pArray.push(`${param.name} ${optionResp}`);
                    } else {
                        vscode.window.showErrorMessage(`${param.name} is required.`);
                        return undefined;
                    }
                } else if (param.isSwitch) {
                    let optionResp = await vscode.window.showQuickPick(["true", "false"], { placeHolder: param.help!, title: `Option for ${param.name}`, ignoreFocusOut: true });
                    if (optionResp) {
                        pArray.push(`${param.name} ${optionResp}`);
                    } else {
                        vscode.window.showErrorMessage(`${param.name} is required.`);
                        return undefined;
                    }
                } else {
                    // Show Input Option
                    let paramResponse: string | undefined = await vscode.window.showInputBox({ title: `Option for ${param.name}`, prompt: param.name, placeHolder: param.help! });
                    if (paramResponse) {
                        pArray.push(`${param.name} "${paramResponse}"`);
                    } else {
                        vscode.window.showErrorMessage(`${param.name} is required.`);
                        return undefined;
                    }
                }
            }

            if (breakAll) {
                break;
            }
        }
        return pArray;
    }
}
