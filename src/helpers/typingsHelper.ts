import * as dom from "dts-dom";
import * as vscode from "vscode";
import { extensionName } from "../utils/Constants";
import { camelize, pascalize, sanitize } from "../utils/ExtensionMethods";
import { getWorkspaceFolder, writeFileSync } from "../utils/FileSystem";
import { IAttributeDefinition, IOptionValue } from "../utils/Interfaces";
import { Placeholders } from "../utils/Placeholders";
import { DataverseHelper } from "./dataverseHelper";

const typingNamespace: string = "Xrm";
const typingInterface: string = "EventContext";
const typingMethod: string = "getFormContext";
const typingOmitAttribute = "Omit<FormContext, 'getAttribute'>";
const typingOmitControl = "Omit<FormContext, 'getControl'>";
const xrmAttribute = "Attributes.Attribute";
const xrmControl = "Controls.StandardControl";
const attributeTypeDefMap = new Map<string, string>([
    ["Boolean", "Attributes.BooleanAttribute"],
    ["Customer", "Attributes.LookupAttribute"],
    ["DateTime", "Attributes.DateAttribute"],
    ["Decimal", "Attributes.NumberAttribute"],
    ["Double", "Attributes.NumberAttribute"],
    ["Integer", "Attributes.NumberAttribute"],
    ["Lookup", "Attributes.LookupAttribute"],
    ["Memo", "Attributes.StringAttribute"],
    ["Money", "Attributes.NumberAttribute"],
    ["Owner", "Attributes.LookupAttribute"],
    ["PartyList", "Attributes.LookupAttribute"],
    ["Picklist", "Attributes.OptionSetAttribute"],
    ["State", "Attributes.OptionSetAttribute"],
    ["Status", "Attributes.OptionSetAttribute"],
    ["String", "Attributes.StringAttribute"],
    ["Uniqueidentifier", "Attributes.StringAttribute"],
    ["CalendarRules", "Attributes.Attribute"],
    ["Virtual", "Attributes.Attribute"],
    ["BigInt", "Attributes.NumberAttribute"],
    ["ManagedProperty", "Attributes.Attribute"],
    ["EntityName", "Attributes.Attribute"],
]);
const controlTypeDefMap = new Map<string, string>([
    ["Boolean", "Controls.StandardControl"],
    ["Customer", "Controls.LookupControl"],
    ["DateTime", "Controls.DateControl"],
    ["Decimal", "Controls.NumberControl"],
    ["Double", "Controls.NumberControl"],
    ["Integer", "Controls.NumberControl"],
    ["Lookup", "Controls.LookupControl"],
    ["Memo", "Controls.StringControl"],
    ["Money", "Controls.NumberControl"],
    ["Owner", "Controls.LookupControl"],
    ["PartyList", "Controls.LookupControl"],
    ["Picklist", "Controls.OptionSetControl"],
    ["State", "Controls.OptionSetControl"],
    ["Status", "Controls.OptionSetControl"],
    ["String", "Controls.StringControl"],
    ["Uniqueidentifier", "Controls.StringControl"],
    ["CalendarRules", "Controls.Control"],
    ["Virtual", "Controls.Control"],
    ["BigInt", "Controls.NumberControl"],
    ["ManagedProperty", "Controls.Control"],
    ["EntityName", "Controls.Control"],
]);

export class TypingsHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(private vscontext: vscode.ExtensionContext, private dvHelper: DataverseHelper) {}

    public async generateTyping(entityLogicalName: string): Promise<void> {
        const attributes = await this.dvHelper.getAttributesForEntity(entityLogicalName);
        const camelizedEntityName = camelize(entityLogicalName);
        const pascalizedEntityName = pascalize(entityLogicalName);
        const interfaceAttributes = dom.create.interface(`${pascalizedEntityName}Attributes`);
        const nsXrm = dom.create.namespace(typingNamespace);
        const nsEntity = dom.create.namespace(pascalizedEntityName);
        const nsEnum = dom.create.namespace(`${pascalizedEntityName}Enum`);
        const refPath = [dom.create.tripleSlashReferencePathDirective("../node_modules/@types/xrm/index.d.ts")];
        const emitOptions: dom.EmitOptions = {
            tripleSlashDirectives: refPath,
        };

        const typeEntity = dom.create.alias(
            pascalizedEntityName,
            dom.create.namedTypeReference(`${typingOmitAttribute} & ${typingOmitControl} & ${interfaceAttributes.name}`),
            dom.DeclarationFlags.None,
        );
        const interfaceEventContext = dom.create.interface(typingInterface);
        interfaceEventContext.members.push(dom.create.method(typingMethod, [], typeEntity));
        nsXrm.members.push(typeEntity);
        nsXrm.members.push(interfaceEventContext);

        const filteredAttributes = attributes.sort(this.sortAttributes).filter((a) => a.AttributeType !== "Virtual" && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base"));

        filteredAttributes.forEach((a) => {
            interfaceAttributes.members.push(this.createAttributeMethod(a));
        });

        filteredAttributes.forEach((a) => {
            interfaceAttributes.members.push(this.createControlMethod(a));
        });

        nsXrm.members.push(interfaceAttributes);

        const attrEnum = this.createEntityAttributes("Attributes", filteredAttributes);
        nsEntity.members.push(dom.create.const("EntityLogicalName", dom.type.stringLiteral(entityLogicalName)));
        nsEntity.members.push(attrEnum);

        attributes
            .sort(this.sortAttributes)
            .filter((a) => a.AttributeType === "Picklist" && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base"))
            .forEach(async (a) => {
                const attrEnum = await this.parseOptionSetsAsEnums(entityLogicalName, a.LogicalName);
                if (attrEnum) {
                    nsEnum.members.push(attrEnum);
                }
            });

        attributes
            .sort(this.sortAttributes)
            .filter((a) => a.AttributeTypeName.Value === "MultiSelectPicklistType" && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base"))
            .forEach(async (a) => {
                const attrEnum = await this.parseMultiSelectOptionSetsAsEnums(entityLogicalName, a.LogicalName);
                if (attrEnum) {
                    nsEnum.members.push(attrEnum);
                }
            });

        attributes
            .sort(this.sortAttributes)
            .filter((a) => (a.AttributeOf === "statecode" || a.AttributeOf === "statuscode") && !a.LogicalName.endsWith("_base"))
            .forEach(async (a) => {
                const attrEnum = await this.parseOptionSetsAsEnums(entityLogicalName, a.AttributeOf);
                if (attrEnum) {
                    nsEnum.members.push(attrEnum);
                }
            });

        const wsPath = getWorkspaceFolder();
        if (wsPath) {
            let dirsTuple = await vscode.workspace.fs.readDirectory(wsPath);
            let dirs = dirsTuple.filter((d) => d[1] === vscode.FileType.Directory && d[0] !== "node_modules" && !d[0].startsWith(".")).map((d) => d[0]);

            let dirQuickPick: vscode.QuickPickOptions = Placeholders.getQuickPickOptions(Placeholders.typingDirSelection);
            let dirResponse: string | undefined = await vscode.window.showQuickPick(dirs, dirQuickPick);

            if (dirResponse) {
                writeFileSync(vscode.Uri.joinPath(wsPath, dirResponse, `${camelizedEntityName}.d.ts`).fsPath, dom.emit(nsEnum, emitOptions).concat(dom.emit(nsEntity)).concat(dom.emit(nsXrm)));
            }
        }

        vscode.window.showInformationMessage(`${extensionName}: Type Definition created successfully.`);
    }

    private createAttributeMethod(attr: IAttributeDefinition): dom.MethodDeclaration {
        const logicalNameParam = dom.create.parameter("name", dom.type.stringLiteral(camelize(attr.LogicalName)));
        const returnType = dom.create.namedTypeReference(attributeTypeDefMap.get(attr.AttributeType) || xrmAttribute);

        return dom.create.method("getAttribute", [logicalNameParam], returnType);
    }

    private createControlMethod(attr: IAttributeDefinition): dom.MethodDeclaration {
        const logicalNameParam = dom.create.parameter("name", dom.type.stringLiteral(camelize(attr.LogicalName)));
        const returnType = dom.create.namedTypeReference(controlTypeDefMap.get(attr.AttributeType) || xrmControl);

        return dom.create.method("getControl", [logicalNameParam], returnType);
    }

    private createEntityAttributes(entityLogicalName: string, attrs: IAttributeDefinition[]): dom.EnumDeclaration {
        const e = dom.create.enum(entityLogicalName, true, dom.DeclarationFlags.ReadOnly);
        attrs.forEach((a) => {
            if (a.LogicalName) {
                e.members.push(dom.create.enumValue(a.LogicalName.toLowerCase(), a.LogicalName.toLowerCase()));
            }
        });
        return e;
    }

    private createAttributeEnum(attrLogicalName: string, options: IOptionValue[]): dom.EnumDeclaration | undefined {
        const e = dom.create.enum(attrLogicalName, true, dom.DeclarationFlags.ReadOnly);
        options.forEach((o) => {
            if (o.name) {
                e.members.push(dom.create.enumValue(o.name, o.value));
            }
        });
        return e;
    }

    private async parseOptionSetsAsEnums(entityLogicalName: string, attrLogicalName: string): Promise<dom.EnumDeclaration | undefined> {
        const optionset = await this.dvHelper.getOptionsetForAttribute(entityLogicalName, attrLogicalName);
        if (optionset && optionset.Options) {
            return this.createAttributeEnum(
                attrLogicalName,
                optionset.Options.map((o) => {
                    let optionName: string | undefined;
                    optionName = sanitize(pascalize(o.Label.UserLocalizedLabel.Label));

                    return <IOptionValue>{ name: optionName, value: o.Value };
                }),
            );
        }
    }

    private async parseMultiSelectOptionSetsAsEnums(entityLogicalName: string, attrLogicalName: string): Promise<dom.EnumDeclaration | undefined> {
        const optionset = await this.dvHelper.getMultiSelectOptionsetForAttribute(entityLogicalName, attrLogicalName);
        if (optionset && optionset.Options) {
            return this.createAttributeEnum(
                attrLogicalName,
                optionset.Options.map((o) => {
                    let optionName: string | undefined;
                    optionName = sanitize(pascalize(o.Label.UserLocalizedLabel.Label));
                    return <IOptionValue>{ name: optionName, value: o.Value };
                }),
            );
        }
    }

    private sortAttributes(a1: IAttributeDefinition, a2: IAttributeDefinition) {
        if (a1.LogicalName > a2.LogicalName) {
            return 1;
        }
        if (a1.LogicalName < a2.LogicalName) {
            return -1;
        }
        return 0;
    }
}
