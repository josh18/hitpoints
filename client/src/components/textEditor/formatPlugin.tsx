import isHotkey from 'is-hotkey';
import { KeyboardEvent } from 'react';
import { Editor } from 'slate';

type Format = 'bold' | 'italic';

function isFormatActive(editor: Editor, format: Format) {
    const marks = Editor.marks(editor);

    if (marks) {
        return !!marks[format];
    }

    return false;
}

function toggleFormat(editor: Editor, format: Format): void {
    const isActive = isFormatActive(editor, format);

    if (isActive) {
        Editor.removeMark(editor, format);
    } else {
        Editor.addMark(editor, format, true);
    }
}

interface FormatPlugin {
    onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export function useFormatPlugin(editor: Editor): FormatPlugin {
    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const hotKeys = {
            'mod+b': 'bold',
            'mod+i': 'italic',
        } as const;

        Object.entries(hotKeys).forEach(([hotkey, format]) => {
            if (isHotkey(hotkey, event.nativeEvent)) {
                toggleFormat(editor, format);
            }
        });
    };

    return {
        onKeyDown,
    };
}
