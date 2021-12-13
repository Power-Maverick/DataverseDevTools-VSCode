import { workspace } from "vscode";
import { configSectionName } from "./constants";

export function get(key: "enableEarlyAccessPreview"): boolean;

export function get(key: any) {
    const extensionConfig = workspace.getConfiguration(configSectionName);
    return extensionConfig.get(key);
}

export async function set(key: string, value: any) {
    const extensionConfig = workspace.getConfiguration(configSectionName);
    return extensionConfig.update(key, value, true);
}
