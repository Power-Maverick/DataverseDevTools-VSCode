// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";
import { registerCommands } from "./commands/registerCommands";
import { registerTreeDataProviders } from "./commands/registerTreeDataProviders";
import { DataverseHelper } from "./helpers/dataverseHelper";
import { aiKey } from "./utils/Constants";

const extensionId = "danish-naglekar.dataverse-devtools";
const extension = vscode.extensions.getExtension(extensionId)!;
const extensionVersion = extension.packageJSON.version;

// telemetry reporter
let reporter: TelemetryReporter;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // create telemetry reporter on extension activation
    reporter = new TelemetryReporter(extensionId, extensionVersion, aiKey);
    // ensure it gets property disposed
    context.subscriptions.push(reporter);

    registerTreeDataProviders(context);
    registerCommands(context, reporter);

    let dataverseToolsPublicApi = {
        currentConnectionToken() {
            const dvHelper = new DataverseHelper(context);
            return dvHelper.getTokenFromCurrentConnection();
        },
    };
    // 'export' public api-surface
    return dataverseToolsPublicApi;
}

// this method is called when your extension is deactivated
export function deactivate() {
    reporter.dispose();
}
