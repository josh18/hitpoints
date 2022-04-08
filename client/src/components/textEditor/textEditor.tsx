import { KeyboardEvent, useCallback, useRef } from 'react';
import { BaseEditor, createEditor, Element } from 'slate';
import { HistoryEditor, withHistory } from 'slate-history';
import { Editable, ReactEditor, RenderElementProps, RenderLeafProps, Slate, withReact } from 'slate-react';

import { useDebounce } from '../../util/useDebounce';
import { usePreventExit } from '../../util/usePreventExit';
import { AtElementRenderer, AtItems, useAtPlugin, withAts } from './atPlugin';
import { useFormatPlugin } from './formatPlugin';

export interface TextNode {
    text: string;
    bold?: boolean;
    italic?: boolean;
}

export interface ParagraphElement {
    type: 'paragraph';
    children: Array<TextNode | AtElement>;
}

export interface AtElement {
    type: '@';
    at: string;
    children: TextNode[];
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor & HistoryEditor;
        Element: ParagraphElement | AtElement;
        Text: TextNode;
    }
}

function ElementRenderer(props: RenderElementProps) {
    const { attributes, children, element } = props;
    switch (element.type) {
        case '@':
            return <AtElementRenderer {...props} />;
        case 'paragraph':
            return <p {...attributes}>{children}</p>;
    }
}

export interface TextEditorProps {
    atItems?: AtItems;
    value: Element[];
    setValue: (value: Element[]) => void;
    onCommit: (value: Element[]) => void;
    placeholder: string;
}

export function TextEditor({ atItems, value, setValue, onCommit, placeholder }: TextEditorProps) {
    const editorRef = useRef(
        withAts(
            withReact(withHistory(createEditor())),
        ),
    );
    const editor = editorRef.current;

    const { AtProvider, AtSuggest, ...atPlugin } = useAtPlugin(editor, atItems);
    const formatPlugin = useFormatPlugin(editor);

    const renderElement = useCallback(props => <ElementRenderer {...props} />, []);
    const renderLeaf = useCallback(({ attributes, children, leaf }: RenderLeafProps) => {
        if (leaf.bold) {
            children = <strong>{children}</strong>;
        }

        if (leaf.italic) {
            children = <em>{children}</em>;
        }

        return <span {...attributes}>{children}</span>;
    }, []);

    const dirty = useRef(false);
    const [debouncedCommit, cancelDebounce] = useDebounce(() => commit(), 2500);
    const preventExit = usePreventExit();

    const commit = () => {
        cancelDebounce();

        if (!dirty.current) {
            return;
        }

        dirty.current = false;
        preventExit(false);

        onCommit(value);
    };

    const onBlur = () => {
        commit();
        atPlugin.onBlur();
    };

    const onFocus = () => {
        atPlugin.onChange();
    };

    const onChange = (nextValue: Element[]) => {
        setValue(nextValue);
        atPlugin.onChange();

        dirty.current = true;
        preventExit(true);

        debouncedCommit();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        atPlugin.onKeyDown(event);
        formatPlugin.onKeyDown(event);
    };

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={value => onChange(value as Element[])}
        >
            <AtProvider>
                <Editable
                    renderLeaf={renderLeaf}
                    renderElement={renderElement}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                />
            </AtProvider>

            <AtSuggest />
        </Slate>
    );
}
