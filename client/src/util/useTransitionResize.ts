import { RefObject, useCallback, useEffect, useRef, useState } from 'react';

export type ChildTransitions = Array<[ref: RefObject<HTMLElement>, cssProperties: string[]]>;

export function useTransitionResize(ref: RefObject<HTMLElement>, childTransitions: ChildTransitions = []): () => void {
    const [transitionNext, setTransitionNext] = useState(false);
    const transitionEndListener = useRef<(event: TransitionEvent) => void>();

    // Pre mutation
    const transition = useCallback(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        setTransitionNext(true);

        element.style.width = `${element.offsetWidth}px`;
        element.style.height = `${element.offsetHeight}px`;

        childTransitions.forEach(([childRef, cssProperties]) => {
            const child = childRef.current;
            if (!child) {
                return;
            }

            cssProperties.forEach(property => child.style.setProperty(property, getComputedStyle(child).getPropertyValue(property)));
        });
    }, [ref, childTransitions]);

    // Post mutation
    useEffect(() => {
        const element = ref.current;

        if (!transitionNext || !element) {
            return;
        }

        setTransitionNext(false);

        if (transitionEndListener.current) {
            element.removeEventListener('transitionend', transitionEndListener.current);
            transitionEndListener.current = undefined;
        }

        const previousWidth = element.offsetWidth;
        const previousHeight = element.offsetHeight;

        element.style.transition = 'none';
        element.style.width = 'auto';
        element.style.height = 'auto';

        const resetChildren = childTransitions.map(([childRef, cssProperties]) => {
            const child = childRef.current;
            if (!child) {
                return () => undefined;
            }

            const previousProperties: Array<[string, string]> = [];

            child.style.transition = 'none';
            cssProperties.forEach(property => {
                previousProperties.push([property, child.style.getPropertyValue(property)]);
                child.style.removeProperty(property);
            });

            return () => {
                previousProperties.forEach(([property, value]) => child.style.setProperty(property, value));
            };
        });

        const nextWidth = element.offsetWidth;
        const nextHeight = element.offsetHeight;

        element.style.width = `${previousWidth}px`;
        element.style.height = `${previousHeight}px`;

        resetChildren.forEach(reset => reset());

        setTimeout(() => {
            element.style.removeProperty('transition');
            let transitioning = false;

            if (nextWidth !== previousWidth) {
                transitioning = true;
                element.style.width = `${nextWidth}px`;
            }

            if (nextHeight !== previousHeight) {
                transitioning = true;
                element.style.height = `${nextHeight}px`;
            }

            childTransitions.forEach(([childRef, cssProperties]) => {
                const child = childRef.current;
                if (!child) {
                    return;
                }

                child.style.removeProperty('transition');
                cssProperties.forEach(property => child.style.removeProperty(property));
            });

            if (!transitioning) {
                return;
            }

            const listener = (event: TransitionEvent) => {
                if (event.target !== element) {
                    return;
                }

                element.style.removeProperty('width');
                element.style.removeProperty('height');
                element.removeEventListener('transitionend', listener);
            };

            transitionEndListener.current = listener;
            element.addEventListener('transitionend', listener);
        });
    }, [ref, transitionNext, childTransitions]);

    return transition;
}
