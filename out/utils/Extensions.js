"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = void 0;
const groupBy = (list, getKey) => list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) {
        previous[group] = [];
    }
    previous[group].push(currentItem);
    return previous;
}, {});
exports.groupBy = groupBy;
//# sourceMappingURL=Extensions.js.map