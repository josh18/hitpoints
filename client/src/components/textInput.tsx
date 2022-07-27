import { css } from '@emotion/react';
import styled from '@emotion/styled';
import {
    FormEvent,
    forwardRef,
    KeyboardEvent,
    KeyboardEventHandler,
    useCallback,
    useEffect,
    useRef,
} from 'react';

import { useDebounce } from '../util/useDebounce';
import { usePreventExit } from '../util/usePreventExit';

export const TextInputContainer = styled.div`
    flex: 1;
    padding: 8px;
    background-color: rgb(0, 0, 0, 0.08);

    &:hover,
    &:focus {
        background-color: rgb(0, 0, 0, 0.12);
    }

    ${props => props.placeholder && css`
        &:empty::before {
            content: '${props.placeholder}';
            pointer-events: none;
            color: rgb(27, 32, 35, 0.5);
        }
    `}
`;

export interface TextInputProps {
    /** Initial or updated value. */
    value: string;
    /** Is triggered after debounceTime has passed without any user input. Useful for autosave. */
    onCommit: (value: string) => string | void;
    /** Time (ms) without user input before onCommit is triggered. Defaults to 2500ms. */
    debounceTime?: number,
    /** Validate an input before it is applied. */
    validateInput?: (value: string) => string;
    /** Prevents the browser closing when a value hasn't been committed yet. */
    preventExit?: boolean;
    onKeyDown?: KeyboardEventHandler<HTMLElement>;
    onEnter?: () => void;
    id?: string;
    placeholder?: string;
    style?: React.CSSProperties;
}

/** A text input with a debounced commit for autosave or auto search. */
export const TextInput = forwardRef<HTMLElement, TextInputProps>(
    ({
        value: externalValue,
        onCommit,
        debounceTime = 2500,
        validateInput,
        preventExit,
        onKeyDown: forwardKeyDown,
        onEnter,
        ...props
    },
    externalRef,
) => {
    const ref = useRef<HTMLElement>();
    const [debouncedCommit, cancelDebounce] = useDebounce(() => commit(), debounceTime);
    const setPreventExit = usePreventExit();

    const overrideValue = (next: string) => {
        if (!ref.current) {
            return;
        }

        const selection = getSelection()!;
        const anchorNode = selection.anchorNode!;

        let offsets;
        if (ref.current.contains(anchorNode)) {
            // If it is the input element or the direct text node then store the selection
            if (anchorNode === ref.current || (anchorNode.nodeType === Node.TEXT_NODE && anchorNode.parentElement === ref.current)) {
                const { anchorOffset, focusOffset } = selection;

                offsets = {
                    start: anchorOffset,
                    end: focusOffset,
                };
            } else {
                // Otherwise html was likely inserted and we should jump to the end
                offsets = {
                    start: next.length,
                    end: next.length,
                };
            }
        }

        ref.current.textContent = next;

        if (offsets) {
            const textNode = ref.current.firstChild as Text | null;

            if (!textNode) {
                return;
            }

            const range = document.createRange();
            range.setStart(textNode, Math.min(offsets.start, textNode.length));

            selection.removeAllRanges();
            selection.addRange(range);
            selection.extend(textNode, Math.min(offsets.end, textNode.length));
        }
    };

    const currentValue = () => ref.current?.textContent ?? '';
    const isDirty = () => currentValue() !== externalValue;

    const commit = () => {
        cancelDebounce();

        if (!isDirty()) {
            return;
        }

        setPreventExit(false);

        const result = onCommit(currentValue());
        if (result !== undefined && result !== currentValue()) {
            overrideValue(result);
        }
    };

    useEffect(() => {
        if (externalValue !== currentValue()) {
            setPreventExit(false);
            overrideValue(externalValue);
        }

    }, [externalValue, setPreventExit]);

    const onInput = (event: FormEvent<HTMLElement>) => {
        const element = event.currentTarget;
        const nativeEvent = (event.nativeEvent as InputEvent);
        const androidEnter = nativeEvent.inputType === 'insertCompositionText' && nativeEvent.data?.includes('\n') && element.innerHTML.includes('<br');

        let nextValue = element.textContent ?? '';

        if (validateInput) {
            nextValue = validateInput(nextValue);
        }

        if (nextValue !== event.currentTarget.innerHTML) {
            overrideValue(nextValue);
        }

        // Android doesn't send key codes sometimes :/
        if (androidEnter) {
            onEnter?.();
        }

        if (preventExit && isDirty()) {
            setPreventExit(true);
        }

        debouncedCommit();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            commit();
            onEnter?.();
        }

        forwardKeyDown?.(event);
    };

    const value = useRef(externalValue); // This ref doesn't get updated
    const setRef = useCallback((element: HTMLElement | null) => {
        if (externalRef) {
            if (typeof externalRef === 'function') {
                externalRef(element);
            } else {
                externalRef.current = element;
            }
        }

        if (element) {
            if (element !== ref.current) {
                element.textContent = value.current;
            }

            ref.current = element;
        }

    }, [externalRef]);

    return (
        <TextInputContainer
            ref={setRef}
            onBlur={commit}
            onInput={onInput}
            onKeyDown={onKeyDown}
            contentEditable
            {...props}
        />
    );
});

TextInput.displayName = 'TextInput';
