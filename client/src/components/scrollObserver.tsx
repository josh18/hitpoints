import { useCallback, useRef } from 'react';

import { useRefInstance } from '../util/useRefInstance';

interface ScrollObserverProps {
    onRangeChange: (inRange: boolean) => void;
}

export function ScrollObserver({ onRangeChange }: ScrollObserverProps) {
    const callbackRef = useRef(onRangeChange);
    callbackRef.current = onRangeChange;

    const observer = useRefInstance(() => {
        return new IntersectionObserver(entries => {
            callbackRef.current(entries[0].isIntersecting);
        }, {
            rootMargin: '100%',
            root: document.querySelector('main'),
        });
    });

    const setObserverElement = useCallback((element: HTMLDivElement | null) => {
        if (!element) {
            return;
        }

        observer.disconnect();
        observer.observe(element);
    }, [observer]);

    return <div ref={setObserverElement}></div>;
}
