export function once<T>(factory: () => T): () => T {
    let result: T | undefined;

    return () => {
        if (result === undefined) {
            result = factory();
        }

        return result;
    };
}
