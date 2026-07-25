import * as dom from "dts-dom";
import { camelize, pascalize } from "../utils/ExtensionMethods";

/* eslint-disable @typescript-eslint/naming-convention */

// Structural view of the attribute metadata this module needs. Kept separate
// from IAttributeDefinition (utils/Interfaces.ts imports vscode) so the
// builder and its unit tests run in plain Node.
export interface ITypingSourceAttribute {
    LogicalName: string;
    AttributeTypeName: { Value: string };
    IsCustomizable: { Value: boolean };
}

export interface ITypingEnumOption {
    name: string;
    value: number;
}

export interface ITypingAttribute {
    logicalName: string;
    attributeTypeName: string;
    options?: ITypingEnumOption[];
}

export interface ITypingModel {
    entityLogicalName: string;
    attributes: ITypingAttribute[];
}

export type EnumResolver = (attrLogicalName: string, attributeTypeName: string) => Promise<ITypingEnumOption[] | undefined>;

export interface ITypingNamespaces {
    nsEnum: dom.NamespaceDeclaration;
    nsEntity: dom.NamespaceDeclaration;
    nsXrm: dom.NamespaceDeclaration;
}

export const multiSelectPicklistTypeName = "MultiSelectPicklistType";
const virtualTypeName = "VirtualType";

const typingNamespace: string = "Xrm";
const typingInterface: string = "EventContext";
const typingMethod: string = "getFormContext";
const typingOmitAttribute = "Omit<FormContext, 'getAttribute'>";
const typingOmitControl = "Omit<FormContext, 'getControl'>";
const xrmAttribute = "Attributes.Attribute";
const xrmControl = "Controls.StandardControl";

// Keyed on AttributeTypeName.Value (AttributeTypeDisplayName). The legacy
// AttributeType enum is incomplete for newer column types — multi-select,
// file and image columns all report "Virtual" there.
// File/image have no dedicated @types/xrm interfaces yet; the generic
// Attribute/StandardControl mappings are conservative fallbacks.
const attributeTypeDefMap = new Map<string, string>([
    ["BooleanType", "Attributes.BooleanAttribute"],
    ["CustomerType", "Attributes.LookupAttribute"],
    ["DateTimeType", "Attributes.DateAttribute"],
    ["DecimalType", "Attributes.NumberAttribute"],
    ["DoubleType", "Attributes.NumberAttribute"],
    ["FileType", "Attributes.Attribute"],
    ["ImageType", "Attributes.Attribute"],
    ["IntegerType", "Attributes.NumberAttribute"],
    ["LookupType", "Attributes.LookupAttribute"],
    ["MemoType", "Attributes.StringAttribute"],
    ["MoneyType", "Attributes.NumberAttribute"],
    [multiSelectPicklistTypeName, "Attributes.MultiSelectOptionSetAttribute"],
    ["OwnerType", "Attributes.LookupAttribute"],
    ["PartyListType", "Attributes.LookupAttribute"],
    ["PicklistType", "Attributes.OptionSetAttribute"],
    ["StateType", "Attributes.OptionSetAttribute"],
    ["StatusType", "Attributes.OptionSetAttribute"],
    ["StringType", "Attributes.StringAttribute"],
]);

const controlTypeDefMap = new Map<string, string>([
    ["BooleanType", "Controls.BooleanControl"],
    ["CustomerType", "Controls.LookupControl"],
    ["DateTimeType", "Controls.DateControl"],
    ["DecimalType", "Controls.NumberControl"],
    ["DoubleType", "Controls.NumberControl"],
    ["FileType", "Controls.StandardControl"],
    ["ImageType", "Controls.StandardControl"],
    ["IntegerType", "Controls.NumberControl"],
    ["LookupType", "Controls.LookupControl"],
    ["MemoType", "Controls.StringControl"],
    ["MoneyType", "Controls.NumberControl"],
    [multiSelectPicklistTypeName, "Controls.MultiSelectOptionSetControl"],
    ["OwnerType", "Controls.LookupControl"],
    ["PartyListType", "Controls.LookupControl"],
    ["PicklistType", "Controls.OptionSetControl"],
    ["StateType", "Controls.OptionSetControl"],
    ["StatusType", "Controls.OptionSetControl"],
    ["StringType", "Controls.StringControl"],
]);

// Types whose option values are resolvable to enums.
const choiceTypes = new Set<string>(["PicklistType", multiSelectPicklistTypeName, "StateType", "StatusType"]);

// Only true virtual columns are skipped; every other customizable, non-_base
// column is generated. The exclusion keys on AttributeTypeName because the
// legacy AttributeType enum reports "Virtual" for multi-select, file and
// image columns, which do need typings.
export function isGeneratedAttribute(a: ITypingSourceAttribute): boolean {
    return a.AttributeTypeName.Value !== virtualTypeName && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base");
}

// Unmapped types fall back to the generic Xrm types so that a column type this
// version does not know about still gets a usable signature instead of being
// dropped from the output.
function mappedOrDefault(map: Map<string, string>, attributeTypeName: string, fallback: string): string {
    return map.get(attributeTypeName) ?? fallback;
}

function sortByLogicalName(a1: ITypingSourceAttribute, a2: ITypingSourceAttribute): number {
    if (a1.LogicalName > a2.LogicalName) {
        return 1;
    }
    if (a1.LogicalName < a2.LogicalName) {
        return -1;
    }
    return 0;
}

export async function resolveTypingModel(entityLogicalName: string, attributes: ITypingSourceAttribute[], enumResolver: EnumResolver): Promise<ITypingModel> {
    const filteredAttributes = attributes.filter(isGeneratedAttribute).sort(sortByLogicalName);
    const resolvedAttributes = await Promise.all(
        filteredAttributes.map(
            async (a) =>
                <ITypingAttribute>{
                    logicalName: a.LogicalName,
                    attributeTypeName: a.AttributeTypeName.Value,
                    options: choiceTypes.has(a.AttributeTypeName.Value) ? await enumResolver(a.LogicalName, a.AttributeTypeName.Value) : undefined,
                },
        ),
    );
    return { entityLogicalName: entityLogicalName, attributes: resolvedAttributes };
}

export function buildTyping(model: ITypingModel): ITypingNamespaces {
    const pascalizedEntityName = pascalize(model.entityLogicalName);
    const interfaceAttributes = dom.create.interface(`${pascalizedEntityName}Attributes`);
    const nsXrm = dom.create.namespace(typingNamespace);
    const nsEntity = dom.create.namespace(pascalizedEntityName);
    const nsEnum = dom.create.namespace(`${pascalizedEntityName}Enum`);

    const typeEntity = dom.create.alias(pascalizedEntityName, dom.create.namedTypeReference(`${typingOmitAttribute} & ${typingOmitControl} & ${interfaceAttributes.name}`), dom.DeclarationFlags.None);
    const interfaceEventContext = dom.create.interface(typingInterface);
    interfaceEventContext.members.push(dom.create.method(typingMethod, [], typeEntity));
    nsXrm.members.push(typeEntity);
    nsXrm.members.push(interfaceEventContext);

    model.attributes.forEach((a) => {
        const nameParam = dom.create.parameter("name", dom.type.stringLiteral(camelize(a.logicalName)));
        interfaceAttributes.members.push(dom.create.method("getAttribute", [nameParam], dom.create.namedTypeReference(mappedOrDefault(attributeTypeDefMap, a.attributeTypeName, xrmAttribute))));
    });
    model.attributes.forEach((a) => {
        const nameParam = dom.create.parameter("name", dom.type.stringLiteral(camelize(a.logicalName)));
        interfaceAttributes.members.push(dom.create.method("getControl", [nameParam], dom.create.namedTypeReference(mappedOrDefault(controlTypeDefMap, a.attributeTypeName, xrmControl))));
    });
    nsXrm.members.push(interfaceAttributes);

    nsEntity.members.push(dom.create.const("EntityLogicalName", dom.type.stringLiteral(model.entityLogicalName)));
    const attrEnum = dom.create.enum("Attributes", true, dom.DeclarationFlags.ReadOnly);
    model.attributes.forEach((a) => {
        attrEnum.members.push(dom.create.enumValue(a.logicalName.toLowerCase(), a.logicalName.toLowerCase()));
    });
    nsEntity.members.push(attrEnum);

    const optionEnums: dom.EnumDeclaration[] = [];
    model.attributes.forEach((a) => {
        if (a.options) {
            const e = dom.create.enum(a.logicalName, true, dom.DeclarationFlags.ReadOnly);
            a.options.forEach((o) => {
                // Skip options whose label sanitizes to an empty string (e.g. entirely non-Latin labels).
                if (o.name) {
                    e.members.push(dom.create.enumValue(o.name, o.value));
                }
            });
            optionEnums.push(e);
        }
    });
    nsEnum.members.push(...optionEnums);

    return { nsEnum: nsEnum, nsEntity: nsEntity, nsXrm: nsXrm };
}

export function emitTyping(namespaces: ITypingNamespaces): string {
    const refPath = [dom.create.tripleSlashReferencePathDirective("../node_modules/@types/xrm/index.d.ts")];
    return dom.emit(namespaces.nsEnum, { tripleSlashDirectives: refPath }).concat(dom.emit(namespaces.nsEntity)).concat(dom.emit(namespaces.nsXrm));
}
