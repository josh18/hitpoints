import { forwardRef } from 'react';

import { TextInput, TextInputProps } from './textInput';

function toString(value?: number): string {
    return value?.toString() ?? '';
}

function toNumber(value: string): number | undefined {
    return parseInt(value, 10) || undefined;
}

export interface NumberInputProps extends Omit<TextInputProps, 'value' | 'onCommit'> {
    value?: number;
    onCommit: (value?: number) => number | void;
}

export const NumberInput = forwardRef<HTMLTextAreaElement, NumberInputProps>(({ value, onCommit, ...props }, ref) => {
    const commitToNumber = (next: string) => {
        const result = onCommit(toNumber(next));

        if (result !== undefined) {
            return toString(result);
        }
    };

    return <TextInput ref={ref} value={toString(value)} onCommit={commitToNumber} validateInput={next => toString(toNumber(next))} {...props} />;
});

NumberInput.displayName = 'NumberInput';
