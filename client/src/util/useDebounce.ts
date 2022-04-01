import { useEffect, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(func: T, time: number): [T, () => void] {
    const timeoutId = useRef<number>();
    const funcRef = useRef(func);

    useEffect(() => {
        funcRef.current = func;
    }, [func]);

    const debouncedFunc = function (this: any, ...params: Parameters<T>): void {
        // eslint-disable-next-line
        const context = this;
        clearTimeout(timeoutId.current);

        timeoutId.current = window.setTimeout(() => {
            funcRef.current.apply(context, params);
        }, time);
    } as T;

    const cancel = () => clearTimeout(timeoutId.current);

    return [debouncedFunc, cancel];
}
