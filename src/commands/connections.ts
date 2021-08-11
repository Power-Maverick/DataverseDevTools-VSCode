import { DataverseHelper } from "../helpers/dataverseHelper";
import { updateConnectionStatusBar } from "./registerCommands";

export async function addConnection(dvHelper: DataverseHelper): Promise<void> {
    const conn = await dvHelper.addConnection();
    updateConnectionStatusBar(conn);
}
