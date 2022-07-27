import { Theme } from '@emotion/react';
import { darken, rgba, tint } from 'polished';

declare module '@emotion/react' {
    export interface Theme {
        primary: string;
        primaryActive: string;
        primaryText: string;
        dark: string;
        darkActive: string;
        darkActiveLessor: string;
        warning: string;
        error: string;
        shadow: string;
        highShadow: string;
        whiteText: string;
        whiteBackground: string;
        transition(...properties: string[]): string;
    }
}

export const theme: Theme = {
    primary: '#38a3f1',
    primaryActive: darken(0.12, '#38a3f1'),
    primaryText: '#1782cf',
    dark: '#1b2023',
    darkActive: tint(0.08, '#1b2023'),
    darkActiveLessor: tint(0.04, '#1b2023'),
    warning: '#ff792c',
    error: '#ca0013',
    shadow: `0 1px 2px 0 ${rgba('#000', 0.1)}, 0 2px 10px 0 ${rgba('#000', 0.05)}`,
    highShadow: `0 8px 10px 1px ${rgba('#000', 0.20)}, 0 4px 16px 0 ${rgba('#000', 0.15)}, 0 4px 8px -2px ${rgba('#000', 0.15)}`,
    whiteText: rgba('#fff', 0.88),
    whiteBackground: '#fcfdfe',
    transition(...properties) {
        const time = 200;
        return properties.map(property => `${property} ${time}ms cubic-bezier(0.4, 0, 0.2, 1)`).join(', ');
    },
};
