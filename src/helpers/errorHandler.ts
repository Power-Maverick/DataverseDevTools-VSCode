import * as vscode from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";
import { extensionName } from "../utils/Constants";
import { openUri } from "../utils/OpenUri";

export class ErrorHandler {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private reporter: TelemetryReporter) {}

    public log(err: any, cmd: string) {
        const btnLogError: vscode.MessageItem = { title: "Log error on GitHub" };
        vscode.window
            .showErrorMessage(`${extensionName}: Error occured. Please report it on GitHub with the activity you tried to perform along with Date & Time.`, btnLogError)
            .then(async (result: vscode.MessageItem | undefined) => {
                if (result === btnLogError) {
                    await openUri("https://github.com/Power-Maverick/DataverseDevTools-VSCode/issues/new/choose");
                }
            });
        this.reporter.sendTelemetryException(err, { command: cmd });
    }
}
