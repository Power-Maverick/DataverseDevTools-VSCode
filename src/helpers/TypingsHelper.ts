import * as vscode from "vscode";
import { account } from "../../resources/typings/account";
import { Commands } from "../terminals/Commands";
import { Console } from "../terminals/Console";

export class TypingsHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext) {
        let t: Xrm.table;
        let acc: account;
    }
}
