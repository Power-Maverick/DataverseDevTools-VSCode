const stringIsNumber = (value: any) => isNaN(Number(value)) === false;

export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) {
            previous[group] = [];
        }
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);

export const toArray = (e: any) => {
    return Object.keys(e)
        .filter(stringIsNumber)
        .map((key) => e[key]);
};

export const camelize = (str: string) => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, "")
        .replace(/[^0-9a-zA-Z_]+/g, "");
};

export const pascalize = (str: string) => {
    return str
        .replace(/\w+/g, function (w) {
            return w[0].toUpperCase() + w.slice(1).toLowerCase();
        })
        .replace(/\s+/g, "")
        .replace(/[^0-9a-zA-Z_]+/g, "");
};

export const sanitize = (str: string) => {
    if (str.match(/^\d/)) {
        str = "_".concat(str);
    }
    return str.replace(/\s+/g, "").replace(/[^0-9a-zA-Z_]+/g, "");
};
