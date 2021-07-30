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
}
exports.Commands = Commands;
//# sourceMappingURL=Commands.js.map