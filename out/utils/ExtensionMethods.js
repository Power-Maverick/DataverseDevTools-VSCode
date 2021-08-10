"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeToBase64 = exports.decodeFromBase64 = exports.extractGuid = exports.sanitize = exports.pascalize = exports.camelize = exports.toArray = exports.groupBy = void 0;
const stringIsNumber = (value) => isNaN(Number(value)) === false;
const groupBy = (list, getKey) => list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) {
        previous[group] = [];
    }
    previous[group].push(currentItem);
    return previous;
}, {});
exports.groupBy = groupBy;
const toArray = (e) => {
    return Object.keys(e)
        .filter(stringIsNumber)
        .map((key) => e[key]);
};
exports.toArray = toArray;
const camelize = (str) => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
        .replace(/\s+/g, "")
        .replace(/[^0-9a-zA-Z_]+/g, "");
};
exports.camelize = camelize;
const pascalize = (str) => {
    return str
        .replace(/\w+/g, function (w) {
        return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
        .replace(/\s+/g, "")
        .replace(/[^0-9a-zA-Z_]+/g, "");
};
exports.pascalize = pascalize;
const sanitize = (str) => {
    if (str.match(/^\d/)) {
        str = "_".concat(str);
    }
    return str.replace(/\s+/g, "").replace(/[^0-9a-zA-Z_]+/g, "");
};
exports.sanitize = sanitize;
const extractGuid = (str) => {
    const matches = str.match(/(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/g);
    if (matches) {
        return matches[0];
    }
};
exports.extractGuid = extractGuid;
const decodeFromBase64 = (str) => Buffer.from(str, "base64").toString("binary");
exports.decodeFromBase64 = decodeFromBase64;
const encodeToBase64 = (str) => Buffer.from(str, "binary").toString("base64");
exports.encodeToBase64 = encodeToBase64;
//# sourceMappingURL=ExtensionMethods.js.map