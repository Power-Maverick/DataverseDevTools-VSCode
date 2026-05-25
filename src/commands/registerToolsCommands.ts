import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import { CLIHelper } from "../helpers/cliHelper";
import { ErrorHandler } from "../helpers/errorHandler";
import { ToolsHelper } from "../helpers/toolsHelper";
import { ICommand } from "../utils/Interfaces";
import { ToolsListView } from "../views/ToolsListView";
import { ViewBase } from "../views/ViewBase";

export async function registerToolsCommands(vscontext: vscode.ExtensionContext, tr: TelemetryReporter): Promise<void> {
    const toolHelper = new ToolsHelper(vscontext);
    const views = new ViewBase(vscontext);
    const errorHandler = new ErrorHandler(tr);
    const cliHelper = new CLIHelper(vscontext);

    const cmds: Array<ICommand> = new Array(
        {
            command: "dvdt.commands.openDRB",
            callback: async () => {
                try {
                    toolHelper.openDRB(views);
                } catch (error) {
                    errorHandler.log(error, "openDRB");
                }
            },
        },
        {
            command: "dvdt.commands.openERDGenerator",
            callback: async () => {
                try {
                    toolHelper.openERDGenerator(views);
                } catch (error) {
                    errorHandler.log(error, "openERDGenerator");
                }
            },
        },
        {
            command: "dvdt.commands.launchPRT",
            callback: async () => {
                try {
                    cliHelper.launchPRT();
                } catch (error) {
                    errorHandler.log(error, "launchPRT");
                }
            },
        },
        {
            command: "dvdt.commands.launchCMT",
            callback: async () => {
                try {
                    cliHelper.launchCMT();
                } catch (error) {
                    errorHandler.log(error, "launchCMT");
                }
            },
        },
        {
            command: "dvdt.commands.launchPD",
            callback: async () => {
                try {
                    cliHelper.launchPD();
                } catch (error) {
                    errorHandler.log(error, "launchPD");
                }
            },
        },
        {
            command: "dvdt.commands.showToolsPage",
            callback: async () => {
                try {
                    const webview = await views.getWebView({ type: "showToolsList", title: "Power Platform ToolBox" });
                    new ToolsListView(webview, vscontext);
                } catch (error) {
                    errorHandler.log(error, "showToolsPage");
                }
            },
        },
        {
            command: "dvdt.commands.launchToolByShortName",
            callback: async (toolShortName: string) => {
                try {
                    toolHelper.launchToolByShortName(toolShortName, cliHelper, views);
                } catch (error) {
                    errorHandler.log(error, "launchToolByShortName");
                }
            },
        },
    );

    cmds.forEach((c) => {
        vscontext.subscriptions.push(vscode.commands.registerCommand(c.command, c.callback));
    });
}
