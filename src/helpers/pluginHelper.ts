/* eslint-disable @typescript-eslint/naming-convention */
import { spawn } from "child_process";
import * as path from "path";
import * as vscode from "vscode";
import { connectionCurrentStoreKey, extensionPrefix, pluginAssembliesStoreKey, pluginPackagesStoreKey, PluginType } from "../utils/Constants";
import { ErrorMessages } from "../utils/ErrorMessages";
import { copyFolderOrFile, getRelativeFilePath, getWorkspaceFolder, readFileSync, writeFileSync } from "../utils/FileSystem";
import { IConnection, ILinkerFile, ILinkerPlugin, IPluginAssemblies, IPluginPackages } from "../utils/Interfaces";
import { jsonToXML, xmlToJSON } from "../utils/Parsers";
import { Placeholders } from "../utils/Placeholders";
import { State } from "../utils/State";

interface IPluginQuickPickItem extends vscode.QuickPickItem {
    id: string;
    name: string;
    type: PluginType;
}

interface ILookupResult {
    entry: ILinkerPlugin;
    index: number;
}

export class PluginHelper {
    private vsstate: State;
    private static outputChannel: vscode.OutputChannel | undefined;

    constructor(private vscontext: vscode.ExtensionContext) {
        this.vsstate = new State(vscontext);
    }

    //#region Public

    public async linkPlugin(csprojFullPath: string): Promise<ILinkerPlugin | undefined> {
        const assemblies: IPluginAssemblies = this.vsstate.getFromWorkspace(pluginAssembliesStoreKey);
        const packages: IPluginPackages = this.vsstate.getFromWorkspace(pluginPackagesStoreKey);
        const conn: IConnection = this.vsstate.getFromWorkspace(connectionCurrentStoreKey);

        if (!conn) {
            vscode.window.showErrorMessage("Connect to a Dataverse environment before linking a plugin.");
            return undefined;
        }

        const items: IPluginQuickPickItem[] = [];
        if (assemblies && assemblies.value) {
            assemblies.value.forEach((a) => items.push({ label: a.name, description: "Assembly", id: a.pluginassemblyid, name: a.name, type: PluginType.assembly }));
        }
        if (packages && packages.value) {
            packages.value.forEach((p) => items.push({ label: p.name, description: "Package", id: p.pluginpackageid, name: p.name, type: PluginType.nuget }));
        }

        if (items.length === 0) {
            vscode.window.showErrorMessage(ErrorMessages.pluginListUnavailable);
            return undefined;
        }

        const qpOptions = Placeholders.getQuickPickOptions(Placeholders.pluginSelection);
        const picked = await vscode.window.showQuickPick(items, qpOptions);
        if (!picked) {
            return undefined;
        }

        const localRelativePath = getRelativeFilePath(csprojFullPath, getWorkspaceFolder()?.fsPath!);
        const existing = await this.lookupLinkedPlugin(csprojFullPath);

        const newEntry: ILinkerPlugin = {
            "@_Id": picked.id,
            "@_dvName": picked.name,
            "@_type": picked.type,
            "@_localProjectPath": localRelativePath,
            "@_environment": conn.environmentUrl.replace(/\/+$/, ""),
        };

        if (existing) {
            const confirm = await vscode.window.showWarningMessage("This project is already linked. Re-link?", { detail: "Confirm your selection", modal: true }, "Yes", "No");
            if (confirm !== "Yes") {
                return undefined;
            }
            return await this.updateInLinkerFile(existing.index, newEntry);
        }

        return await this.addInLinkerFile(newEntry);
    }

    public async pushPlugin(csprojFullPath: string): Promise<void> {
        let linked = await this.lookupLinkedPlugin(csprojFullPath);
        if (!linked) {
            const linkOptions = ["Link to existing plugin & push"];
            const qpOptions = Placeholders.getQuickPickOptions(Placeholders.pluginLinkSelection);
            const choice = await vscode.window.showQuickPick(linkOptions, qpOptions);
            if (!choice) {
                return;
            }
            const newEntry = await this.linkPlugin(csprojFullPath);
            if (!newEntry) {
                return;
            }
            linked = { entry: newEntry, index: 0 };
        }

        const projectDir = path.dirname(csprojFullPath);
        const projectName = path.basename(csprojFullPath);
        const entry = linked.entry;

        const authed = await this.ensurePacAuth(entry["@_environment"]);
        if (!authed) {
            return;
        }

        const args = ["plugin", "push", "--pluginId", entry["@_Id"], "--type", entry["@_type"], "--environment", entry["@_environment"]];

        const channel = PluginHelper.getOutputChannel();
        channel.clear();
        channel.appendLine(`> pac ${args.join(" ")}`);
        channel.appendLine(`> cwd: ${projectDir}`);
        channel.appendLine("");

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Pushing ${projectName}`,
                cancellable: false,
            },
            async (progress) => {
                progress.report({ message: "Running pac plugin push..." });

                const exitCode = await new Promise<number>((resolve) => {
                    const child = spawn("pac", args, { cwd: projectDir, shell: true });

                    child.stdout.on("data", (data: Buffer) => channel.append(data.toString()));
                    child.stderr.on("data", (data: Buffer) => channel.append(data.toString()));
                    child.on("error", (err) => {
                        channel.appendLine(`\nFailed to start pac: ${err.message}`);
                        resolve(-1);
                    });
                    child.on("close", (code) => resolve(code ?? -1));
                });

                if (exitCode === 0) {
                    vscode.window.showInformationMessage(`${projectName} pushed.`);
                } else {
                    channel.show(true);
                    vscode.window.showErrorMessage(ErrorMessages.pluginPushFailed);
                }
            },
        );
    }

    public async getLinkedProjectPaths(): Promise<string[] | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (!linkerFile) {
            return undefined;
        }
        const data = readFileSync(linkerFile.fsPath).toString();
        const json = xmlToJSON<ILinkerFile>(data);
        if (!json.DVDT.Plugins || !json.DVDT.Plugins.Plugin) {
            return [];
        }
        if (Array.isArray(json.DVDT.Plugins.Plugin)) {
            return json.DVDT.Plugins.Plugin.map((p) => p["@_localProjectPath"]);
        }
        return [json.DVDT.Plugins.Plugin["@_localProjectPath"]];
    }

    //#endregion Public

    //#region Private

    private async ensurePacAuth(environment: string): Promise<boolean> {
        if (!(await this.isPacInstalled())) {
            const choice = await vscode.window.showErrorMessage("Power Platform CLI (pac) was not found. Install it and try again.", "Open install docs");
            if (choice === "Open install docs") {
                vscode.env.openExternal(vscode.Uri.parse("https://aka.ms/PowerPlatformCLI"));
            }
            return false;
        }

        if (await this.hasPacProfileForEnv(environment)) {
            return true;
        }

        const choice = await vscode.window.showWarningMessage(`pac is not authenticated to ${environment}. Authenticate first, then try Push again.`, "Authenticate");
        if (choice === "Authenticate") {
            const terminal = vscode.window.createTerminal("DVDT - pac auth");
            terminal.show();
            terminal.sendText(`pac auth create --environment "${environment}"`, false);
        }
        return false;
    }

    private async isPacInstalled(): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const child = spawn("pac", [], { shell: true });
            child.on("close", (code) => resolve(code === 0));
            child.on("error", () => resolve(false));
        });
    }

    private async hasPacProfileForEnv(environment: string): Promise<boolean> {
        const output = await new Promise<string>((resolve) => {
            let buf = "";
            const child = spawn("pac", ["auth", "list"], { shell: true });
            child.stdout.on("data", (d: Buffer) => (buf += d.toString()));
            child.stderr.on("data", (d: Buffer) => (buf += d.toString()));
            child.on("close", () => resolve(buf));
            child.on("error", () => resolve(""));
        });
        const normalize = (u: string) => u.replace(/\/+$/, "").toLowerCase();
        return normalize(output).includes(normalize(environment));
    }

    private async lookupLinkedPlugin(csprojFullPath: string): Promise<ILookupResult | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (!linkerFile) {
            return undefined;
        }
        const localRelativePath = getRelativeFilePath(csprojFullPath, getWorkspaceFolder()?.fsPath!);
        const data = readFileSync(linkerFile.fsPath).toString();
        const json = xmlToJSON<ILinkerFile>(data);

        if (!json.DVDT.Plugins || !json.DVDT.Plugins.Plugin) {
            return undefined;
        }

        if (Array.isArray(json.DVDT.Plugins.Plugin)) {
            const idx = json.DVDT.Plugins.Plugin.findIndex((p) => p["@_localProjectPath"] === localRelativePath);
            return idx >= 0 ? { entry: json.DVDT.Plugins.Plugin[idx], index: idx } : undefined;
        } else {
            return json.DVDT.Plugins.Plugin["@_localProjectPath"] === localRelativePath ? { entry: json.DVDT.Plugins.Plugin, index: 0 } : undefined;
        }
    }

    private async addInLinkerFile(entry: ILinkerPlugin): Promise<ILinkerPlugin | undefined> {
        const linkerFile = await this.createLinkerFile();
        if (!linkerFile) {
            return undefined;
        }
        const data = readFileSync(linkerFile.fsPath).toString();
        const json = xmlToJSON<ILinkerFile>(data);

        if (!json.DVDT.Plugins) {
            json.DVDT.Plugins = { Plugin: [] };
        }
        if (Array.isArray(json.DVDT.Plugins.Plugin)) {
            json.DVDT.Plugins.Plugin.push(entry);
        } else {
            const existing = json.DVDT.Plugins.Plugin;
            json.DVDT.Plugins.Plugin = [existing, entry];
        }
        writeFileSync(linkerFile.fsPath, jsonToXML(json));
        await this.updateLinkedPluginsContext();
        return entry;
    }

    private async updateInLinkerFile(oldIndex: number, newEntry: ILinkerPlugin): Promise<ILinkerPlugin | undefined> {
        const linkerFile = await this.getLinkerFile();
        if (!linkerFile) {
            return undefined;
        }
        const data = readFileSync(linkerFile.fsPath).toString();
        const json = xmlToJSON<ILinkerFile>(data);

        if (!json.DVDT.Plugins) {
            return undefined;
        }
        if (Array.isArray(json.DVDT.Plugins.Plugin)) {
            json.DVDT.Plugins.Plugin[oldIndex] = newEntry;
        } else {
            json.DVDT.Plugins.Plugin = newEntry;
        }
        writeFileSync(linkerFile.fsPath, jsonToXML(json));
        await this.updateLinkedPluginsContext();
        return newEntry;
    }

    private async getLinkerFile(): Promise<vscode.Uri | undefined> {
        const files = await vscode.workspace.findFiles("**/dvdt.linker.xml", "**/node_modules/**");
        return files.length > 0 ? files[0] : undefined;
    }

    private async createLinkerFile(): Promise<vscode.Uri | undefined> {
        if (!vscode.workspace.workspaceFolders) {
            return undefined;
        }
        const existing = await this.getLinkerFile();
        if (existing) {
            return existing;
        }
        const workspaceFolder = vscode.workspace.workspaceFolders[0].uri;
        const extPath = this.vscontext.extensionUri.fsPath;
        const linkerTemplate = path.join(extPath, "resources", "templates", "dvdt.linker.xml");
        const newLinkerFileUri = vscode.Uri.joinPath(workspaceFolder, "dvdt.linker.xml");
        await copyFolderOrFile(linkerTemplate, newLinkerFileUri.fsPath);
        return newLinkerFileUri;
    }

    private async updateLinkedPluginsContext(): Promise<void> {
        const paths = await this.getLinkedProjectPaths();
        await vscode.commands.executeCommand("setContext", `${extensionPrefix}.linkedPlugins`, paths);
    }

    private static getOutputChannel(): vscode.OutputChannel {
        if (!PluginHelper.outputChannel) {
            PluginHelper.outputChannel = vscode.window.createOutputChannel("Dataverse DevTools - Plugin Push");
        }
        return PluginHelper.outputChannel;
    }

    //#endregion Private
}
