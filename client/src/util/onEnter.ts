import { KeyboardEvent } from 'react';

export function onEnter(action: () => void) {
    return (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            action();
        }
    };
}
