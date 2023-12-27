import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import { extensionName } from "../utils/Constants";
import { openUri } from "../utils/OpenUri";

export class ErrorHandler {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private reporter: TelemetryReporter) {}

    public log(err: any, cmd: string) {
        const extensionId = "danish-naglekar.dataverse-devtools";
        const extension = vscode.extensions.getExtension(extensionId)!;
        const btnLogError: vscode.MessageItem = { title: "Log error on GitHub" };

        vscode.window.showErrorMessage(`${extensionName}: Error occured - ${err.code}. Please report it on GitHub.`, btnLogError).then(async (result: vscode.MessageItem | undefined) => {
            if (result === btnLogError) {
                var reportMessage = `VSCode version: ${vscode.version}. \nExtension version: ${extension.packageJSON.version}. \nError occured in ${cmd} command. \nError code: ${err.code}. \nError message: ${err.message}. \nError stack: ${err.stack}.`;
                var sId = vscode.env.sessionId;
                await openUri(
                    `https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/new?assignees=Power-Maverick&labels=bug%2Ctriage&template=issue-form-bug.yaml&title=%5BBug%5D%3A+&logs=${decodeURI(
                        reportMessage,
                    )}&sessionid=${sId}`,
                );
            }
        });
        this.reporter.sendTelemetryErrorEvent(err, { command: cmd });
    }
}
