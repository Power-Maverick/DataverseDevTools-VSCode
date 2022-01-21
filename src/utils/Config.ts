import { workspace } from "vscode";
import { configSectionName } from "./Constants";

export function get(key: "enableEarlyAccessPreview"): boolean;
export function get(key: "defaultTypeScriptTemplate"): "None" | "Plain TypeScript" | "Webpack";

export function get(key: any) {
    const extensionConfig = workspace.getConfiguration(configSectionName);
    return extensionConfig.get(key);
}

export async function set(key: string, value: any) {
    const extensionConfig = workspace.getConfiguration(configSectionName);
    return extensionConfig.update(key, value, true);
}
