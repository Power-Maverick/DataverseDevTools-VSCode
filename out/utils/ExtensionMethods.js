"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = exports.pascalize = exports.camelize = exports.toArray = exports.groupBy = void 0;
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
//# sourceMappingURL=ExtensionMethods.js.map