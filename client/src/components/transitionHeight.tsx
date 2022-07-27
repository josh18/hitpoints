import styled from '@emotion/styled';
import { HTMLAttributes, ReactNode, TransitionEvent, useCallback, useEffect, useRef, useState } from 'react';

const Container = styled.div`
    transition: ${props => props.theme.transition('height')};
`;

function toAutoHeight(element: HTMLElement) {
    const originalHeight = element.offsetHeight;
    const originalTransition = element.style.transition;
    element.style.transition = 'none';
    element.style.height = 'auto';

    const height = element.offsetHeight;

    if (height === originalHeight) {
        element.style.transition = originalTransition;
        element.style.height = '';
        return;
    }

    element.style.height = `${originalHeight}px`;

    element.getBoundingClientRect(); // Force reflow to enable transition

    element.style.transition = originalTransition;
    element.style.height = `${height}px`;
    element.style.overflow = 'hidden';
}

function to0Height(element: HTMLElement) {
    element.style.height = `${element.offsetHeight}px`;

    element.getBoundingClientRect(); // Force reflow to enable transition

    element.style.height = `0`;
    element.style.overflow = 'hidden';
}

export interface TransitionHeightProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    visible: boolean;
    transitionOnMount?: boolean;
    onExit?: () => void;
}

export function TransitionHeight({
    children,
    visible,
    transitionOnMount = false,
    onExit,
    ...props
}: TransitionHeightProps) {
    const elementRef = useRef<HTMLElement | null>(null);
    const childRef = useRef<ReactNode>(null);
    const [mounted, setMounted] = useState(visible);
    const transitionIn = useRef(transitionOnMount);

    if (children || visible) {
        childRef.current = children;
    }

    useEffect(() => {
        if (!elementRef.current) {
            return;
        }

        if (visible) {
            toAutoHeight(elementRef.current);
        } else {
            to0Height(elementRef.current);
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            setMounted(true);
        }
    }, [visible]);

    useEffect(() => {
        transitionIn.current = true;
    }, []);

    const setRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;

        if (element && transitionIn.current) {
            element.style.height = '0';
            toAutoHeight(element);
        }
    }, []);

    if (!mounted) {
        return null;
    }

    const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== elementRef.current) {
            return;
        }

        if (visible) {
            if (elementRef.current) {
                elementRef.current.style.height = '';
                elementRef.current.style.overflow = '';
            }
        } else {
            setMounted(false);
            onExit?.();
        }
    };

    return <Container ref={setRef} onTransitionEnd={onTransitionEnd} {...props}>{childRef.current}</Container>;
}
