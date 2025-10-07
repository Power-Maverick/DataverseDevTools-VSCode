// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import TelemetryReporter from "@vscode/extension-telemetry";
import * as vscode from "vscode";
import { registerCommands } from "./commands/registerCommands";
import { registerTreeDataProviders } from "./commands/registerTreeDataProviders";
import { DataverseHelper } from "./helpers/dataverseHelper";
import * as config from "./utils/Config";
import { aiKey, extensionPrefix, fileExtensions } from "./utils/Constants";

const extensionId = "danish-naglekar.dataverse-devtools";
const extension = vscode.extensions.getExtension(extensionId)!;
const extensionVersion = extension.packageJSON.version;

// telemetry reporter
let reporter: TelemetryReporter;

// Token expiration check interval (in milliseconds) - check every 60 seconds
const TOKEN_CHECK_INTERVAL = 60000;
let tokenExpirationTimer: NodeJS.Timeout | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // create telemetry reporter on extension activation
    reporter = new TelemetryReporter(aiKey);
    // ensure it gets property disposed
    context.subscriptions.push(reporter);

    vscode.commands.executeCommand("setContext", `${extensionPrefix}.resourcesExtn`, fileExtensions);
    vscode.commands.executeCommand("setContext", `${extensionPrefix}.showPreviewOptions`, config.get("enableEarlyAccessPreview"));

    registerTreeDataProviders(context, reporter);
    registerCommands(context, reporter);

    // Start periodic token expiration check
    startTokenExpirationCheck(context);

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
    if (tokenExpirationTimer) {
        clearInterval(tokenExpirationTimer);
    }
    reporter.dispose();
}

/**
 * Start periodic token expiration check
 */
function startTokenExpirationCheck(context: vscode.ExtensionContext) {
    let lastNotifiedExpiration = false;
    
    tokenExpirationTimer = setInterval(() => {
        const dvHelper = new DataverseHelper(context);
        const isExpired = dvHelper.isCurrentConnectionTokenExpired();
        
        if (isExpired && !lastNotifiedExpiration) {
            // Show notification to user
            vscode.window.showWarningMessage(
                "Your Dataverse connection token has expired. Please reconnect to continue working.",
                "Reconnect"
            ).then(selection => {
                if (selection === "Reconnect") {
                    vscode.commands.executeCommand("dvdt.explorer.connections.connectDataverse");
                }
            });
            
            lastNotifiedExpiration = true;
            
            // Refresh the connection tree to show expired icon
            vscode.commands.executeCommand("dvdt.explorer.connections.refreshConnection");
            
            // Update status bar to show expired state
            const conn = dvHelper.getCurrentWorkspaceConnection();
            vscode.commands.executeCommand("dvdt.explorer.connections.updateStatusBar", conn);
        } else if (!isExpired) {
            // Reset notification flag when token is refreshed
            lastNotifiedExpiration = false;
        }
    }, TOKEN_CHECK_INTERVAL);
}
