import { useEffect } from 'react';

export function useTitle(title?: string) {
    useEffect(() => {
        if (title) {
            document.title = `${title} | Hitpoints`;
        } else {
            document.title = 'Hitpoints';
        }

        return () => {
            document.title = 'Hitpoints';
        };
    }, [title]);
}
