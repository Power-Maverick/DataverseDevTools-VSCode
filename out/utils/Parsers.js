"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonToXML = exports.xmlToJSON = void 0;
const xmlparser = require("fast-xml-parser");
const options = {
    ignoreAttributes: false,
    ignoreNameSpace: true,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    attributeNamePrefix: "@_",
};
function xmlToJSON(xmlData) {
    var jsonObj = xmlparser.parse(xmlData, options);
    return jsonObj;
}
exports.xmlToJSON = xmlToJSON;
function jsonToXML(json) {
    var _parser = new xmlparser.j2xParser(options);
    return _parser.parse(json);
}
exports.jsonToXML = jsonToXML;
//# sourceMappingURL=Parsers.js.map