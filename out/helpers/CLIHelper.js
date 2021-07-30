"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIHelper = void 0;
const Commands_1 = require("../terminals/Commands");
const Console_1 = require("../terminals/Console");
class CLIHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext) {
        this.vscontext = vscontext;
    }
    initiatePluginProject(path) {
        let commands = Array();
        commands.push(Commands_1.Commands.ChangeDirectory(path));
        commands.push(Commands_1.Commands.InitPlugin());
        Console_1.Console.runCommand(commands);
    }
}
exports.CLIHelper = CLIHelper;
//# sourceMappingURL=CLIHelper.js.map