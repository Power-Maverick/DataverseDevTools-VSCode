"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypingsHelper = void 0;
const vscode = require("vscode");
const dom = require("dts-dom");
const ExtensionMethods_1 = require("../utils/ExtensionMethods");
const FileSystem_1 = require("../utils/FileSystem");
const Placeholders_1 = require("../utils/Placeholders");
const Constants_1 = require("../utils/Constants");
const typingNamespace = "Xrm";
const typingInterface = "EventContext";
const typingMethod = "getFormContext";
const typingOmitAttribute = "Omit<FormContext, 'getAttribute(attributeName: string)'>";
const typingOmitControl = "Omit<FormContext, 'getControl(controlName: string)'>";
const xrmAttribute = "Attributes.Attribute";
const xrmControl = "Controls.StandardControl";
class TypingsHelper {
    /**
     * Initialization constructor for VS Code Context
     */
    constructor(vscontext, dvHelper) {
        this.vscontext = vscontext;
        this.dvHelper = dvHelper;
    }
    generateTyping(entityLogicalName) {
        return __awaiter(this, void 0, void 0, function* () {
            const attributes = yield this.dvHelper.getAttributesForEntity(entityLogicalName);
            const camelizedEntityName = ExtensionMethods_1.camelize(entityLogicalName);
            const pascalizedEntityName = ExtensionMethods_1.pascalize(entityLogicalName);
            const interfaceAttributes = dom.create.interface(`${pascalizedEntityName}Attributes`);
            const nsXrm = dom.create.namespace(typingNamespace);
            const nsEnum = dom.create.namespace(`${pascalizedEntityName}Enum`);
            const refPath = [dom.create.tripleSlashReferencePathDirective("../node_modules/@types/xrm/index.d.ts")];
            const emitOptions = {
                tripleSlashDirectives: refPath,
            };
            const typeEntity = dom.create.alias(pascalizedEntityName, dom.create.namedTypeReference(`${typingOmitAttribute} & ${typingOmitControl} & ${interfaceAttributes.name}`), dom.DeclarationFlags.None);
            const interfaceEventContext = dom.create.interface(typingInterface);
            interfaceEventContext.members.push(dom.create.method(typingMethod, [], typeEntity));
            nsXrm.members.push(typeEntity);
            nsXrm.members.push(interfaceEventContext);
            attributes
                .sort(this.sortAttributes)
                .filter((a) => a.AttributeType !== "Virtual" && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base"))
                .forEach((a) => {
                interfaceAttributes.members.push(this.createAttributeMethod(a));
                //intf.members.push(dom.create.method("getThing", [dom.create.parameter("x", dom.type.number)], dom.type.void, dom.DeclarationFlags.Optional));
            });
            attributes
                .sort(this.sortAttributes)
                .filter((a) => a.AttributeType !== "Virtual" && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base"))
                .forEach((a) => {
                interfaceAttributes.members.push(this.createControlMethod(a));
            });
            nsXrm.members.push(interfaceAttributes);
            attributes
                .sort(this.sortAttributes)
                .filter((a) => a.AttributeType === "Picklist" && a.IsCustomizable.Value && !a.LogicalName.endsWith("_base"))
                .forEach((a) => __awaiter(this, void 0, void 0, function* () {
                const attrEnum = yield this.parseOptionSetsAsEnums(entityLogicalName, a.LogicalName);
                if (attrEnum) {
                    nsEnum.members.push(attrEnum);
                }
            }));
            const wsPath = FileSystem_1.getWorkspaceFolder();
            if (wsPath) {
                let dirsTuple = yield vscode.workspace.fs.readDirectory(wsPath);
                let dirs = dirsTuple.filter((d) => d[1] === vscode.FileType.Directory && d[0] !== "node_modules" && !d[0].startsWith(".")).map((d) => d[0]);
                let dirQuickPick = Placeholders_1.Placeholders.getQuickPickOptions(Placeholders_1.Placeholders.typingDirSelection);
                let dirResponse = yield vscode.window.showQuickPick(dirs, dirQuickPick);
                if (dirResponse) {
                    FileSystem_1.writeFileSync(vscode.Uri.joinPath(wsPath, dirResponse, `${camelizedEntityName}.d.ts`).fsPath, dom.emit(nsEnum, emitOptions).concat(dom.emit(nsXrm)));
                    //console.log(dom.emit(nsXrm, emitOptions));
                }
            }
            vscode.window.showInformationMessage(`${Constants_1.extensionName}: Type Definition created successfully.`);
        });
    }
    createAttributeMethod(attr) {
        return dom.create.method("getAttribute", [dom.create.parameter("name", dom.type.stringLiteral(ExtensionMethods_1.camelize(attr.LogicalName)))], dom.create.alias(xrmAttribute, dom.type.undefined, dom.DeclarationFlags.None));
        //return dom.create.property(camelize(attr.LogicalName), this.convertType(attr.AttributeType.toLowerCase()), dom.DeclarationFlags.Optional);
    }
    createControlMethod(attr) {
        return dom.create.method("getControl", [dom.create.parameter("name", dom.type.stringLiteral(ExtensionMethods_1.camelize(attr.LogicalName)))], dom.create.alias(xrmControl, dom.type.undefined, dom.DeclarationFlags.None));
        //return dom.create.property(camelize(attr.LogicalName), this.convertType(attr.AttributeType.toLowerCase()), dom.DeclarationFlags.Optional);
    }
    createAttributeEnum(attrLogicalName, options) {
        const e = dom.create.enum(attrLogicalName, true, dom.DeclarationFlags.ReadOnly);
        options.forEach((o) => {
            if (o.name) {
                e.members.push(dom.create.enumValue(o.name, o.value));
            }
        });
        return e;
    }
    parseOptionSetsAsEnums(entityLogicalName, attrLogicalName) {
        return __awaiter(this, void 0, void 0, function* () {
            const optionset = yield this.dvHelper.getOptionsetForAttribute(entityLogicalName, attrLogicalName);
            if (optionset && optionset.Options) {
                return this.createAttributeEnum(attrLogicalName, optionset.Options.map((o) => {
                    let optionName;
                    if (o.Label.UserLocalizedLabel.LanguageCode === 1033) {
                        optionName = ExtensionMethods_1.sanitize(ExtensionMethods_1.pascalize(o.Label.UserLocalizedLabel.Label));
                    }
                    return { name: optionName, value: o.Value };
                }));
            }
        });
    }
    sortAttributes(a1, a2) {
        if (a1.LogicalName > a2.LogicalName) {
            return 1;
        }
        if (a1.LogicalName < a2.LogicalName) {
            return -1;
        }
        return 0;
    }
}
exports.TypingsHelper = TypingsHelper;
//# sourceMappingURL=typingsHelper.js.map