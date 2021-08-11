"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIHelper = void 0;
const commands_1 = require("../terminals/commands");
const console_1 = require("../terminals/console");
class CLIHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext) {
        this.vscontext = vscontext;
    }
    initiatePluginProject(path) {
        let commands = Array();
        commands.push(commands_1.Commands.ChangeDirectory(path));
        commands.push(commands_1.Commands.InitPlugin());
        console_1.Console.runCommand(commands);
    }
}
exports.CLIHelper = CLIHelper;
//# sourceMappingURL=cliHelper.js.map