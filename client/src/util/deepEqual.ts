/** Reference comparision but is recursive inside objects and arrays. */
export function deepEqual(a: any, b: any): boolean {
    if (a === b) {
        return true;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }

        return a.every((value, i) => deepEqual(value, b[i]));
    }

    if (a && b && typeof a === 'object' && typeof b === 'object') {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);

        if (aKeys.length !== bKeys.length) {
            return false;
        }

        return aKeys.every(key => Object.hasOwn(b, key) && deepEqual(a[key], b[key]));
    }

    return false;
}
