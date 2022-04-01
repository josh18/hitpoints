export function isISOString(value: string) {
    try {
        return new Date(value).toISOString() === value;
    } catch {
        return false;
    }
}
