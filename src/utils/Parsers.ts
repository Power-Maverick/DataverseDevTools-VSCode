import { XMLBuilder, XMLParser } from "fast-xml-parser";

const options = {
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    attributeNamePrefix: "@_",
    format: true,
};

export function xmlToJSON<T>(xmlData: string): T {
    const parser = new XMLParser(options);
    var jsonObj: T = parser.parse(xmlData);
    return jsonObj;
}

export function jsonToXML<T>(json: T): string {
    const builder = new XMLBuilder(options);
    var xmlObj = builder.build(json);
    return xmlObj;
}
