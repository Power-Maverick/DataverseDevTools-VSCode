import * as vscode from "vscode";
import { DataverseHelper } from "../helpers/DataverseHelper";
import { IConnection } from "../utils/Interfaces";
import { updateConnectionStatusBar } from "./registerCommands";

export async function addConnection(dvHelper: DataverseHelper): Promise<void> {
    const conn = await dvHelper.addConnection();
    updateConnectionStatusBar(conn);
}
