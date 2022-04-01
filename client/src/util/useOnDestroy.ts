import { useEffect, useRef } from 'react';

export function useOnDestroy(callback: () => void) {
    const destroying = useRef(false);

    // Surely there is a better way to do this with hooks?
    useEffect(() => {
        return () => {
            destroying.current = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (destroying.current) {
                callback();
            }
        };
    });
}
