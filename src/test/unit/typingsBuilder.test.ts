import * as assert from "assert";
import { ITypingEnumOption, ITypingSourceAttribute, buildTyping, emitTyping, resolveTypingModel } from "../../helpers/typingsBuilder";

/* eslint-disable @typescript-eslint/naming-convention */

function attr(logicalName: string, typeName: string, overrides?: Partial<ITypingSourceAttribute>): ITypingSourceAttribute {
    return {
        LogicalName: logicalName,
        AttributeTypeName: { Value: typeName },
        IsCustomizable: { Value: true },
        ...overrides,
    };
}

const noEnums = async () => undefined;

describe("resolveTypingModel", () => {
    it("includes every mapped attribute type", async () => {
        const source = [
            attr("new_bigint", "BigIntType"),
            attr("new_bool", "BooleanType"),
            attr("new_calendarrules", "CalendarRulesType"),
            attr("new_customer", "CustomerType"),
            attr("new_entityname", "EntityNameType"),
            attr("new_managedproperty", "ManagedPropertyType"),
            attr("accountid", "UniqueidentifierType"),
            attr("new_date", "DateTimeType"),
            attr("new_decimal", "DecimalType"),
            attr("new_double", "DoubleType"),
            attr("new_int", "IntegerType"),
            attr("new_lookup", "LookupType"),
            attr("new_memo", "MemoType"),
            attr("new_money", "MoneyType"),
            attr("ownerid", "OwnerType"),
            attr("new_party", "PartyListType"),
            attr("new_choice", "PicklistType"),
            attr("statecode", "StateType"),
            attr("statuscode", "StatusType"),
            attr("new_text", "StringType"),
            attr("new_multi", "MultiSelectPicklistType"),
            attr("new_file", "FileType"),
            attr("entityimage_big", "ImageType"),
        ];
        const model = await resolveTypingModel("account", source, noEnums);
        assert.strictEqual(model.attributes.length, source.length);
        assert.strictEqual(model.entityLogicalName, "account");
    });

    // Primary ids and system columns are not placeable on a form, so filtering
    // on form eligibility silently dropped them from generated typings.
    it("retains primary ids and system columns that cannot go on a form", async () => {
        const source = [
            attr("accountid", "UniqueidentifierType"),
            attr("importsequencenumber", "IntegerType"),
            attr("owninguser", "LookupType"),
            attr("owningbusinessunitname", "StringType"),
        ];
        const model = await resolveTypingModel("account", source, noEnums);
        assert.deepStrictEqual(
            model.attributes.map((a) => a.logicalName),
            ["accountid", "importsequencenumber", "owningbusinessunitname", "owninguser"],
        );
    });

    it("retains an attribute type that has no dedicated Xrm mapping", async () => {
        const model = await resolveTypingModel("account", [attr("new_unknown", "SomeFutureType")], noEnums);
        assert.deepStrictEqual(
            model.attributes.map((a) => a.logicalName),
            ["new_unknown"],
        );
    });

    it("excludes non-customizable, _base and true virtual attributes", async () => {
        const source = [
            attr("new_kept", "StringType"),
            attr("new_locked", "StringType", { IsCustomizable: { Value: false } }),
            attr("new_amount_base", "MoneyType"),
            attr("new_categoryname", "VirtualType"),
        ];
        const model = await resolveTypingModel("account", source, noEnums);
        assert.deepStrictEqual(
            model.attributes.map((a) => a.logicalName),
            ["new_kept"],
        );
    });

    it("includes multi-select, file and image columns despite their legacy Virtual AttributeType", async () => {
        const source = [attr("new_multi", "MultiSelectPicklistType"), attr("new_file", "FileType"), attr("entityimage_big", "ImageType")];
        const model = await resolveTypingModel("account", source, noEnums);
        assert.strictEqual(model.attributes.length, 3);
    });

    it("sorts attributes by logical name without mutating the input", async () => {
        const source = [attr("new_zzz", "StringType"), attr("new_aaa", "StringType")];
        const model = await resolveTypingModel("account", source, noEnums);
        assert.deepStrictEqual(
            model.attributes.map((a) => a.logicalName),
            ["new_aaa", "new_zzz"],
        );
        assert.strictEqual(source[0].LogicalName, "new_zzz");
    });

    it("awaits deferred enum resolution for every choice attribute (race regression)", async () => {
        const deferred = (options: ITypingEnumOption[]) => new Promise<ITypingEnumOption[]>((resolve) => setTimeout(() => resolve(options), 20));
        const resolver = async (name: string) => deferred([{ name: `${name}Option`, value: 1 }]);
        const source = [attr("new_choice", "PicklistType"), attr("new_multi", "MultiSelectPicklistType"), attr("statecode", "StateType"), attr("statuscode", "StatusType")];
        const model = await resolveTypingModel("account", source, resolver);
        const withOptions = model.attributes.filter((a) => a.options && a.options.length === 1);
        assert.strictEqual(withOptions.length, 4);
    });

    it("does not call the enum resolver for non-choice attributes", async () => {
        const called: string[] = [];
        const resolver = async (name: string) => {
            called.push(name);
            return undefined;
        };
        await resolveTypingModel("account", [attr("new_text", "StringType"), attr("new_choice", "PicklistType")], resolver);
        assert.deepStrictEqual(called, ["new_choice"]);
    });
});

describe("buildTyping", () => {
    it("emits correctly typed getAttribute/getControl signatures", async () => {
        const model = await resolveTypingModel(
            "account",
            [
                attr("accountid", "UniqueidentifierType"),
                attr("importsequencenumber", "IntegerType"),
                attr("new_multi", "MultiSelectPicklistType"),
                attr("new_bool", "BooleanType"),
                attr("new_text", "StringType"),
                attr("new_file", "FileType"),
                attr("owningbusinessunitname", "StringType"),
                attr("owninguser", "LookupType"),
            ],
            noEnums,
        );
        const output = emitTyping(buildTyping(model));
        assert.ok(output.includes('getAttribute(name: "accountid"): Attributes.StringAttribute;'), output);
        assert.ok(output.includes('getControl(name: "accountid"): Controls.StringControl;'), output);
        assert.ok(output.includes('getAttribute(name: "importsequencenumber"): Attributes.NumberAttribute;'), output);
        assert.ok(output.includes('getAttribute(name: "owningbusinessunitname"): Attributes.StringAttribute;'), output);
        assert.ok(output.includes('getAttribute(name: "owninguser"): Attributes.LookupAttribute;'), output);
        assert.ok(output.includes('getControl(name: "owninguser"): Controls.LookupControl;'), output);
        assert.ok(output.includes('accountid = "accountid"'), output);
        assert.ok(output.includes('getAttribute(name: "new_multi"): Attributes.MultiSelectOptionSetAttribute;'), output);
        assert.ok(output.includes('getControl(name: "new_multi"): Controls.MultiSelectOptionSetControl;'), output);
        assert.ok(output.includes('getAttribute(name: "new_bool"): Attributes.BooleanAttribute;'), output);
        assert.ok(output.includes('getControl(name: "new_bool"): Controls.BooleanControl;'), output);
        assert.ok(output.includes('getAttribute(name: "new_text"): Attributes.StringAttribute;'), output);
        assert.ok(output.includes('getAttribute(name: "new_file"): Attributes.Attribute;'), output);
        assert.ok(output.includes('getControl(name: "new_file"): Controls.StandardControl;'), output);
    });

    it("emits option enums only for attributes with resolved options", async () => {
        const resolver = async (name: string) => (name === "new_multi" ? [{ name: "Alpha", value: 100000000 }] : undefined);
        const model = await resolveTypingModel("account", [attr("new_multi", "MultiSelectPicklistType"), attr("new_choice", "PicklistType")], resolver);
        const output = emitTyping(buildTyping(model));
        assert.ok(output.includes("enum new_multi"), output);
        assert.ok(output.includes("Alpha = 100000000"), output);
        assert.ok(!output.includes("enum new_choice"), output);
    });

    it("lists every included attribute in the entity Attributes enum and EntityLogicalName const", async () => {
        const model = await resolveTypingModel("account", [attr("new_b", "StringType"), attr("new_a", "BooleanType")], noEnums);
        const output = emitTyping(buildTyping(model));
        assert.ok(output.includes('new_a = "new_a"'), output);
        assert.ok(output.includes('new_b = "new_b"'), output);
        assert.ok(output.includes('"account"'), output);
    });

    it("falls back to the generic Xrm types for an unmapped attribute type", () => {
        const output = emitTyping(buildTyping({ entityLogicalName: "account", attributes: [{ logicalName: "new_x", attributeTypeName: "SomeFutureType" }] }));
        assert.ok(output.includes('getAttribute(name: "new_x"): Attributes.Attribute;'), output);
        assert.ok(output.includes('getControl(name: "new_x"): Controls.StandardControl;'), output);
    });

    it("emits a triple-slash reference to the xrm typings", async () => {
        const model = await resolveTypingModel("account", [attr("new_text", "StringType")], noEnums);
        const output = emitTyping(buildTyping(model));
        assert.ok(output.includes('path="../node_modules/@types/xrm/index.d.ts"'), output);
    });
});
