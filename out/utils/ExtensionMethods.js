"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pascalize = exports.camelize = exports.toArray = exports.groupBy = void 0;
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
        .replace(/\s+/g, "");
};
exports.camelize = camelize;
const pascalize = (str) => {
    return str.replace(/\w+/g, function (w) {
        return w[0].toUpperCase() + w.slice(1).toLowerCase();
    });
};
exports.pascalize = pascalize;
//# sourceMappingURL=ExtensionMethods.js.map