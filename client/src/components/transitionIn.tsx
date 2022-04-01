import { CSSProperties, HTMLAttributes, ReactNode, TransitionEvent, useLayoutEffect, useRef, useState } from 'react';
import { useTheme } from 'styled-components';

export interface TransitionInProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode;
    visible: boolean;
    transitionStart?: CSSProperties;
    className?: string;
}

export function TransitionIn({ children, visible, transitionStart = { opacity: 0 }, ...props }: TransitionInProps) {
    const element = useRef<HTMLDivElement>(null);
    const childRef = useRef<ReactNode>(null);
    const [mounted, setMounted] = useState(visible);
    const [out, setOut] = useState(!visible);
    const theme = useTheme();

    useLayoutEffect(() => {
        if (visible) {
            setMounted(true);

            setTimeout(() => {
                setOut(false);
            });
        } else {
            setOut(true);
        }
    }, [visible]);

    if (children || visible) {
        childRef.current = children;
    }

    if (!mounted) {
        return null;
    }

    const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target === element.current && !visible) {
            setMounted(false);
        }
    };

    const transitionProperties = Object.keys(transitionStart);
    let style: CSSProperties = {
        transition: theme.transition(...transitionProperties),
    };
    if (out) {
        style = {
            ...style,
            ...transitionStart,
        };
    }

    return <div ref={element} style={style} onTransitionEnd={onTransitionEnd} {...props}>{childRef.current}</div>;
}
