"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
class State {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(context) {
        this.vscontext = context;
    }
    saveInGlobal(key, value) {
        this.vscontext.globalState.update(key, value);
    }
    saveInWorkspace(key, value) {
        this.vscontext.workspaceState.update(key, value);
    }
    getFromGlobal(key) {
        return this.vscontext.globalState.get(key);
    }
    getFromWorkspace(key) {
        return this.vscontext.workspaceState.get(key);
    }
    unsetFromGlobal(key) {
        this.vscontext.globalState.update(key, undefined);
    }
    unsetFromWorkspace(key) {
        this.vscontext.workspaceState.update(key, undefined);
    }
}
exports.State = State;
//# sourceMappingURL=State.js.map