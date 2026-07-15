import * as assert from "assert";
import { ITypingEnumOption, ITypingSourceAttribute, buildTyping, emitTyping, resolveTypingModel } from "../../helpers/typingsBuilder";

function attr(logicalName: string, typeName: string, overrides?: Partial<ITypingSourceAttribute>): ITypingSourceAttribute {
    return {
        LogicalName: logicalName,
        AttributeTypeName: { Value: typeName },
        IsValidForForm: true,
        IsPrimaryId: false,
        IsCustomizable: { Value: true },
        ...overrides,
    };
}

const noEnums = async () => undefined;

describe("resolveTypingModel", () => {
    it("includes every mapped attribute type", async () => {
        const source = [
            attr("new_bool", "BooleanType"),
            attr("new_customer", "CustomerType"),
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

    it("excludes primary ids, non-form, non-customizable, _base, unmapped and BigInt attributes", async () => {
        const source = [
            attr("new_kept", "StringType"),
            attr("accountid", "UniqueidentifierType", { IsPrimaryId: true, IsValidForForm: false }),
            attr("new_hidden", "StringType", { IsValidForForm: false }),
            attr("new_locked", "StringType", { IsCustomizable: { Value: false } }),
            attr("new_amount_base", "MoneyType"),
            attr("new_categoryname", "VirtualType", { IsValidForForm: false }),
            attr("new_bigint", "BigIntType"),
            attr("new_entityname", "EntityNameType", { IsValidForForm: false }),
        ];
        const model = await resolveTypingModel("account", source, noEnums);
        assert.deepStrictEqual(
            model.attributes.map((a) => a.logicalName),
            ["new_kept"],
        );
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
            [attr("new_multi", "MultiSelectPicklistType"), attr("new_bool", "BooleanType"), attr("new_text", "StringType"), attr("new_file", "FileType")],
            noEnums,
        );
        const output = emitTyping(buildTyping(model));
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
});
