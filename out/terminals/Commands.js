"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
/* eslint-disable @typescript-eslint/naming-convention */
class Commands {
    static ChangeDirectory(path) {
        return `cd ${path}`;
    }
    static InitPlugin() {
        return `pac plugin init`;
    }
    static LoadNpmPackages() {
        return `npm install`;
    }
    static LinkGlobalTypeScript() {
        return `npm link typescript`;
    }
}
exports.Commands = Commands;
//# sourceMappingURL=commands.js.map