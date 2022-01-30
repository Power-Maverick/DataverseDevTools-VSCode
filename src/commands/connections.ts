import { DataverseHelper } from "../helpers/dataverseHelper";
import { updateConnectionStatusBar } from "./registerCommands";

/**
 * Add a connection to a Dataverse instance.
 * @param {DataverseHelper} dvHelper - DataverseHelper
 */
export async function addConnection(dvHelper: DataverseHelper): Promise<void> {
    const conn = await dvHelper.addConnection();
    updateConnectionStatusBar(conn);
}
