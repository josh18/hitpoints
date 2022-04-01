import { darken, rgba, tint } from 'polished';
import { DefaultTheme } from 'styled-components';

declare module 'styled-components' {
    export interface DefaultTheme {
        primary: string;
        primaryActive: string;
        dark: string;
        darkActive: string;
        darkActiveLessor: string;
        warning: string;
        error: string;
        shadow: string;
        highShadow: string;
        black: string;
        white: string;
        transition(...properties: string[]): string;
    }
}

export const theme: DefaultTheme = {
    primary: '#38a3f1',
    primaryActive: darken(0.12, '#38a3f1'),
    dark: '#1b2023',
    darkActive: tint(0.08, '#1b2023'),
    darkActiveLessor: tint(0.04, '#1b2023'),
    warning: '#ff792c',
    error: '#ca0013',
    shadow: `0 1px 2px 0 ${rgba('#000', 0.1)}, 0 2px 10px 0 ${rgba('#000', 0.05)}`,
    highShadow: `0 8px 10px 0 ${rgba('#000', 0.15)}, 0 4px 16px 0 ${rgba('#000', 0.1)}`,
    black: rgba('#000', 0.88),
    white: rgba('#fff', 0.88),
    transition(...properties: string[]) {
        const time = 250;
        return properties.map(property => `${property} ${time}ms cubic-bezier(0.4, 0, 0.2, 1)`).join(', ');
    },
};
