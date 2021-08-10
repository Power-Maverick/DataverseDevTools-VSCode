import * as xmlparser from "fast-xml-parser";

const options = {
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    attributeNamePrefix: "@_",
};

export function xmlToJSON<T>(xmlData: string): T {
    var jsonObj: T = xmlparser.parse(xmlData, options);
    return jsonObj;
}

export function jsonToXML<T>(json: T): string {
    var _parser = new xmlparser.j2xParser(options);
    return _parser.parse(json);
}
