import { KeyboardEvent, useRef } from 'react';

interface UseInputGroupOptions {
    addLine: (index: number, value?: string) => void;
    updateLine: (index: number, value: string) => void;
    removeLine: (index: number) => void;
}

export interface InputGroup {
    onKeyDown(index: number): (event: KeyboardEvent) => void;
    onEnter(index: number): () => void;
    ref(index: number): (element: HTMLElement | null) => void;
}

export function useInputGroup({ addLine, updateLine, removeLine }: UseInputGroupOptions): InputGroup {
    // A list of refs
    const elements = useRef<Array<HTMLElement | null>>([]);
    // The cursor position when moving vertically
    const cursor = useRef<number | undefined>();

    const onKeyDown = (index: number) => (event: KeyboardEvent) => {
        const selection = getSelection()!;
        const input = elements.current[index]!;
        const key = event.key;

        const setCursor = (element: HTMLElement, position: number) => {
            const textNode = element.firstChild as Text | null;
            const offset = textNode ? textNode.length : 0;

            const range = document.createRange();
            range.setStart(textNode ?? element, Math.min(position, offset));

            selection.removeAllRanges();
            selection.addRange(range);
        };

        const moveVertical = (direction: 'up' | 'down') => {
            let next: HTMLElement | null;
            if (direction === 'up') {
                next = elements.current[index - 1];
            } else {
                next = elements.current[index + 1];
            }

            if (next) {
                event?.preventDefault();

                cursor.current = cursor.current ?? selection?.focusOffset ?? 0;

                setCursor(next, cursor.current);
            } else {
                cursor.current = undefined;
            }
        };

        const moveHorizontal = (direction: 'left' | 'right', backspace = false) => {
            const value = input.textContent ?? '';
            cursor.current = undefined;

            // Ignore if text is selected
            if (!selection.isCollapsed) {
                return;
            }

            // Check if cursor is at the correct edge
            if (direction === 'left' && selection.focusOffset !== 0) {
                return;
            } else if (direction === 'right' && selection.focusOffset !== value.length) {
                return;
            }

            const nextIndex = direction === 'left' ? index - 1 : index + 1;
            const next = elements.current[nextIndex];

            if (next) {
                event?.preventDefault();

                if (backspace) {
                    removeLine(index);

                    if (value.length) {
                        updateLine(nextIndex, next.textContent + value);
                    }
                }

                if (direction === 'left') {
                    setCursor(next, next.textContent?.length ?? 0);
                } else {
                    setCursor(next, 0);
                }
            }
        };

        const onDelete = () => {
            const value = input.textContent ?? '';
            if (selection.focusOffset !== value.length) {
                return;
            }

            event?.preventDefault();

            cursor.current = undefined;

            const next = elements.current[index + 1];

            if (next) {
                const nextLineValue = next.textContent ?? '';
                removeLine(index + 1);

                if (nextLineValue.length) {
                    updateLine(index, value + nextLineValue);
                }
            }
        };

        switch (key) {
            case 'ArrowUp':
                moveVertical('up');
                break;
            case 'ArrowDown':
                moveVertical('down');
                break;
            case 'ArrowLeft':
                moveHorizontal('left');
                break;
            case 'ArrowRight':
                moveHorizontal('right');
                break;
            case 'Backspace':
                moveHorizontal('left', true);
                break;
            case 'Delete':
                onDelete();
                break;
            default:
                cursor.current = undefined;
        }
    };

    const onEnter = (index: number) => () => {
        const selection = getSelection()!;
        const input = elements.current[index]!;

        cursor.current = undefined;

        const cursorEnd = selection.focusOffset;
        const value = input.textContent ?? '';

        let removedValue;
        if (cursorEnd < value.length) {
            removedValue = value.slice(cursorEnd);

            if (removedValue.length) {
                const updatedValue = value.slice(0, cursorEnd);
                input.textContent = updatedValue;
                updateLine(index, updatedValue);
            }
        }

        addLine(index + 1, removedValue);
    };

    const ref = (index: number) => (element: HTMLElement | null) => {
        elements.current[index] = element;
    };

    return {
        onKeyDown,
        onEnter,
        ref,
    };
}
