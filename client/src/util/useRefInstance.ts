import { useEffect, useRef } from 'react';

interface Destroyable {
    destroy(): void;
}

function isDestroyable(instance: any): instance is Destroyable {
    return instance && typeof instance.destroy === 'function';
}

export function useRefInstance<T>(create: () => T): T {
    const ref = useRef<T>();

    if (!ref.current) {
        ref.current = create();
    }

    useEffect(() => {
        return () =>{
            if (isDestroyable(ref.current)) {
                ref.current.destroy();
            }
        };
    }, []);

    return ref.current;
}
