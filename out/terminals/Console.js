"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Console = void 0;
const vscode = require("vscode");
const Constants_1 = require("../utils/Constants");
class Console {
    static runCommand(commands) {
        if (!this.isTerminalCreated) {
            this.dvdTerminal = vscode.window.createTerminal(Constants_1.terminalName);
            this.isTerminalCreated = true;
        }
        else {
            vscode.commands.executeCommand("workbench.action.terminal.clear");
        }
        this.dvdTerminal.show(false);
        commands.forEach((cmd) => {
            this.dvdTerminal.sendText(cmd, true);
        });
        vscode.window.onDidCloseTerminal((t) => {
            if (t.name === Constants_1.terminalName) {
                Console.dispose();
            }
        });
    }
    static dispose() {
        this.isTerminalCreated = false;
        this.dvdTerminal.dispose();
    }
}
exports.Console = Console;
Console.isTerminalCreated = false;
//# sourceMappingURL=Console.js.map