import { rgba } from 'polished';
import { createContext, KeyboardEvent, ReactNode, useContext, useEffect, useState } from 'react';
import { Editor, Element, Node, Range, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useFocused, useSelected } from 'slate-react';
import styled, { css } from 'styled-components';

import { AtSuggest, AtSuggestProps } from './atSuggest';
import { AtElement } from './textEditor';

export interface AtItems {
    [id: string]: string;
}

interface AtItem {
    id: string;
    name: string;
}

const Context = createContext<AtItems>({});

function insertAt(editor: Editor, range: Range, id: string) {
    Transforms.select(editor, range);
    Transforms.insertNodes(editor, {
        type: '@',
        at: id,
        children: [{ text: '' }],
    });
    Transforms.move(editor);
}

export function withAts(editor: Editor) {
    const { isInline, isVoid } = editor;

    editor.isInline = element => {
        return element.type === '@' ? true : isInline(element);
    };

    editor.isVoid = element => {
        return element.type === '@' ? true : isVoid(element);
    };

    return editor;
}

const AtSpan = styled.span<{ selected: boolean }>`
    position: relative;
    padding: 1px 3px;
    margin-top: -1px;
    margin-bottom: -1px;
    display: inline-block;
    border-radius: 2px;
    background-color: ${rgba('#000', 0.08)};
    z-index: 2;

    ${({ selected, theme }) => selected && css`
        box-shadow: 0 0 0 2px ${theme.primary};
    `}
`;

export function AtElementRenderer({ attributes, children, element }: RenderElementProps) {
    const selected = useSelected();
    const focused = useFocused();

    const id = (element as AtElement).at;
    const atItems = useContext(Context);
    const name = atItems[id] ?? 'removed';

    return (
        <AtSpan
            {...attributes}
            contentEditable={false}
            data-id={id}
            selected={selected && focused}
        >
            {name}
            {children}
        </AtSpan>
    );
}

interface AtPlugin {
    AtProvider: (props: { children: ReactNode }) => JSX.Element;
    AtSuggest: () => JSX.Element | null;
    onBlur: () => void;
    onChange: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export function useAtPlugin(editor: Editor, atItems: AtItems = {}): AtPlugin {
    const [atTarget, setAtTarget] = useState<Range>();
    const [atSelected, setAtSelected] = useState(0);
    const [atActiveItems, setAtActiveItems] = useState<AtItem[]>([]);
    const [atListPosition, setAtListPosition] = useState<AtSuggestProps['position']>();

    const atItemsList = Object.entries(atItems)
        .map(([id, name]) => ({
            id,
            name,
        }));

    useEffect(() => {
        if (atTarget && atActiveItems.length > 0) {
            const domRange = ReactEditor.toDOMRange(editor, atTarget);
            const rect = domRange.getBoundingClientRect();

            setAtListPosition({
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
            });
        } else {
            setAtListPosition(undefined);
        }
    }, [atActiveItems, atTarget, editor]);

    const onBlur = () => {
        setAtTarget(undefined);
    };

    const onChange = () => {
        const { selection } = editor;

        if (!selection || !Range.isCollapsed(selection)) {
            setAtTarget(undefined);
            return;
        }

        if (selection && Range.isCollapsed(selection)) {
            const [cursorPosition] = Range.edges(selection);
            const before = Editor.before(editor, cursorPosition, { unit: 'line' });
            const beforeRange = before && Editor.range(editor, before, cursorPosition);
            const beforeText = beforeRange && Editor.string(editor, beforeRange);
            const beforeMatch = beforeText && (/.*(@.*)$/.exec(beforeText)?.[1] ?? '');

            let afterMatch = '';
            if (!beforeMatch?.endsWith(' ')) {
                const after = Editor.after(editor, cursorPosition, { unit: 'line' });
                const afterRange = Editor.range(editor, cursorPosition, after);
                const afterText = Editor.string(editor, afterRange);
                afterMatch = /^[^\s|\\.|!|?|,]*/.exec(afterText)?.[0] ?? '';
            }

            const match = beforeMatch + afterMatch;

            if (match) {
                const normalize = (value: string) => value.replace(/[^A-z]/g, '').toLowerCase();

                const query = normalize(match.slice(1));

                const matchStart = Editor.before(editor, cursorPosition, { distance: beforeMatch?.length });
                const matchEnd = Editor.after(editor, cursorPosition, { distance: afterMatch?.length });
                const range = matchStart && Editor.range(editor, matchStart, matchEnd ?? cursorPosition);

                setAtTarget(range);

                setAtActiveItems(atItemsList.filter(({ name }) =>
                    normalize(name).includes(query),
                ).slice(0, 10));
                setAtSelected(0);
            } else {
                setAtTarget(undefined);
            }
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        switch (event.key) {
            case 'Backspace':
            case 'Delete': {
                const { selection } = editor;
                if (selection && Range.isCollapsed(selection)) {
                    const currentNode = Node.parent(editor, selection.anchor.path);

                    if (Element.isElement(currentNode) && currentNode.type === '@') {
                        // Works around an issue where slate will delete the previous or next character if done in the
                        // same event loop.
                        setTimeout(() => {
                            editor.deleteBackward('block');
                        });
                    }
                }
            }
        }

        if (!atTarget) {
            return;
        }

        switch (event.key) {
            case 'ArrowDown': {
                event.preventDefault();
                const prevIndex = atSelected >= atActiveItems.length - 1 ? 0 : atSelected + 1;
                setAtSelected(prevIndex);
                break;
            }
            case 'ArrowUp': {
                event.preventDefault();
                const nextIndex = atSelected <= 0 ? atActiveItems.length - 1 : atSelected - 1;
                setAtSelected(nextIndex);
                break;
            }
            case 'Tab':
            case 'Enter':
                event.preventDefault();
                insertAt(editor, atTarget, atActiveItems[atSelected].id);
                setAtTarget(undefined);
                break;
            case 'Escape':
                event.preventDefault();
                setAtTarget(undefined);
                break;
        }
    };

    const AtProvider = ({ children }: { children: ReactNode }) => (
        <Context.Provider value={atItems}>
            {children}
        </Context.Provider>
    );

    const AtSuggestWithItems = () => {
        if (!atActiveItems.length || !atListPosition) {
            return null;
        }

        const atSuggestionOnClick = (index: number) => {
            if (atTarget) {
                insertAt(editor, atTarget, atActiveItems[index].id);
            }
        };

        return (
            <AtSuggest
                items={atActiveItems.map(({ name }) => name)}
                selected={atSelected}
                position={atListPosition}
                onClick={atSuggestionOnClick}
            />
        );
    };

    return {
        AtProvider,
        AtSuggest: AtSuggestWithItems,
        onBlur,
        onChange,
        onKeyDown,
    };
}
