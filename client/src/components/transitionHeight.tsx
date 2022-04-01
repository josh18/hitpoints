import { HTMLAttributes, ReactNode, TransitionEvent, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
    transition: ${props => props.theme.transition('height')};
`;

function toAutoHeight(element: HTMLElement) {
    const originalHeight = element.offsetHeight;
    const originalTransition = element.style.transition;
    element.style.transition = 'none';
    element.style.height = 'auto';

    const height = element.offsetHeight;
    element.style.height = `${originalHeight}px`;

    element.getBoundingClientRect(); // Force reflow to enable transition

    element.style.transition = originalTransition;
    element.style.height = `${height}px`;
}

function to0Height(element: HTMLElement) {
    element.style.height = `${element.offsetHeight}px`;

    element.getBoundingClientRect(); // Force reflow to enable transition

    element.style.height = `0`;
}

export interface TransitionHeightProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    visible: boolean;
    className?: string;
}

export function TransitionHeight({
    children,
    visible,
    ...props
}: TransitionHeightProps) {
    const elementRef = useRef<HTMLElement | null>(null);
    const childRef = useRef<ReactNode>(null);
    const [mounted, setMounted] = useState(visible);

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

    const setRef = useCallback((element: HTMLElement | null) => {
        elementRef.current = element;

        if (element !== null) {
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
            }
        } else {
            setMounted(false);
        }
    };

    return <Container ref={setRef} onTransitionEnd={onTransitionEnd} {...props}>{childRef.current}</Container>;
}
