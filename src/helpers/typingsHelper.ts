import * as vscode from "vscode";
import { extensionName } from "../utils/Constants";
import { camelize, pascalize, sanitize } from "../utils/ExtensionMethods";
import { getWorkspaceFolder, writeFileSync } from "../utils/FileSystem";
import { IOptionSet } from "../utils/Interfaces";
import { Placeholders } from "../utils/Placeholders";
import { DataverseHelper } from "./dataverseHelper";
import { EnumResolver, ITypingEnumOption, buildTyping, emitTyping, multiSelectPicklistTypeName, resolveTypingModel } from "./typingsBuilder";

export class TypingsHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {}

    public async generateTyping(entityLogicalName: string): Promise<void> {
        const attributes = await this.dvHelper.getAttributesForEntity(entityLogicalName);
        const model = await resolveTypingModel(entityLogicalName, attributes, this.createEnumResolver(entityLogicalName));
        const output = emitTyping(buildTyping(model));

        const camelizedEntityName = camelize(entityLogicalName);
        const wsPath = getWorkspaceFolder();
        if (wsPath) {
            const dirsTuple = await vscode.workspace.fs.readDirectory(wsPath);
            const dirs = dirsTuple.filter((d) => d[1] === vscode.FileType.Directory && d[0] !== "node_modules" && !d[0].startsWith(".")).map((d) => d[0]);

            const dirQuickPick: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.typingDirSelection);
            const dirResponse: string | undefined = await vscode.window.showQuickPick(dirs, dirQuickPick);

            if (dirResponse) {
                writeFileSync(vscode.Uri.joinPath(wsPath, dirResponse, `${camelizedEntityName}.d.ts`).fsPath, output);
            }
        }

        vscode.window.showInformationMessage(`${extensionName}: Type Definition created successfully.`);
    }

    private createEnumResolver(entityLogicalName: string): EnumResolver {
        return async (attrLogicalName: string, attributeTypeName: string): Promise<ITypingEnumOption[] | undefined> => {
            const optionset: IOptionSet =
                attributeTypeName === multiSelectPicklistTypeName
                    ? await this.dvHelper.getMultiSelectOptionsetForAttribute(entityLogicalName, attrLogicalName)
                    : await this.dvHelper.getOptionsetForAttribute(entityLogicalName, attrLogicalName);
            if (optionset && optionset.Options) {
                return optionset.Options.map((o) => <ITypingEnumOption>{ name: sanitize(pascalize(o.Label.UserLocalizedLabel.Label)), value: o.Value });
            }
            return undefined;
        };
    }
}
