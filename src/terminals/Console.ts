import * as vscode from "vscode";
import { terminalName } from "../utils/Constants";

export class Console {
    private static isTerminalCreated: boolean = false;
    private static dvdTerminal: vscode.Terminal;

    public static runCommand(commands: string[]) {
        if (!this.isTerminalCreated) {
            this.dvdTerminal = vscode.window.createTerminal(terminalName);
            this.isTerminalCreated = true;
        } else {
            vscode.commands.executeCommand("workbench.action.terminal.clear");
        }

        this.dvdTerminal.show(false);

        commands.forEach((cmd) => {
            this.dvdTerminal.sendText(cmd, true);
        });

        vscode.window.onDidCloseTerminal((t) => {
            if (t.name === terminalName) {
                Console.dispose();
            }
        });
    }

    public static dispose() {
        this.isTerminalCreated = false;
        this.dvdTerminal.dispose();
    }
}
