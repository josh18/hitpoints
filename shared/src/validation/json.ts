export function isJSON(value: string) {
    try {
        const data = JSON.parse(value);

        return typeof data === 'object';
    } catch {
        return false;
    }
}
