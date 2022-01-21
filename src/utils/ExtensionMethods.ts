const stringIsNumber = (value: any) => isNaN(Number(value)) === false;

/**
 * Performs a group by on an array based on the key
 * @param list array of an object
 * @param getKey anonymous function to identify key for grouping
 * @returns Record<key, array of object>
 */
export const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K) =>
    list.reduce((previous, currentItem) => {
        const group = getKey(currentItem);
        if (!previous[group]) {
            previous[group] = [];
        }
        previous[group].push(currentItem);
        return previous;
    }, {} as Record<K, T[]>);

/**
 * Helps in converting any object into array like Enum
 * @param e
 * @returns array of object
 */
export const toArray = (e: any) => {
    return Object.keys(e)
        .filter(stringIsNumber)
        .map((key) => e[key]);
};

/**
 * Converts a string into camel case
 * @param str String that needs to be converted in camel case
 * @returns string
 */
export const camelize = (str: string) => {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, "")
        .replace(/[^0-9a-zA-Z_]+/g, "");
};

/**
 * Converts a string into pascal case
 * @param str String that needs to be converted in pascal case
 * @returns string
 */
export const pascalize = (str: string) => {
    return str
        .replace(/\w+/g, function (w) {
            return w[0].toUpperCase() + w.slice(1).toLowerCase();
        })
        .replace(/\s+/g, "")
        .replace(/[^0-9a-zA-Z_]+/g, "");
};

/**
 * Sanitizes the string by replacing the first number with '_', removing all whitespace & any special characters
 * @param str String that needs to be cleaned
 * @returns string
 */
export const sanitize = (str: string) => {
    if (str.match(/^\d/)) {
        str = "_".concat(str);
    }
    return str.replace(/\s+/g, "").replace(/[^0-9a-zA-Z_]+/g, "");
};

/**
 * Extracts a GUID from a string
 * @param str String that has GUID
 * @returns string that is a GUID
 */
export const extractGuid = (str: string): string | undefined => {
    const matches = str.match(/(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}/g);
    if (matches) {
        return matches[0];
    }
};

export const decodeFromBase64 = (str: string): string => Buffer.from(str, "base64").toString("binary");

export const encodeToBase64 = (str: string): string => Buffer.from(str, "binary").toString("base64");
