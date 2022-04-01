import { useCallback, useEffect, useRef } from 'react';

export function usePreventExit(): (preventExit: boolean) => void {
    const preventExitRef = useRef(false);

    useEffect(() => {
        const listener = (event: BeforeUnloadEvent) => {
            if (preventExitRef.current) {
                event.preventDefault();
                event.returnValue = 'Changes you made may not be saved.';
            }
        };

        window.addEventListener('beforeunload', listener);

        return () => window.removeEventListener('beforeunload', listener);
    }, []);

    return useCallback(preventExit => preventExitRef.current = preventExit, []);
}
