import { Link, useMatch } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { Logo } from './components/logo';
import { demoMode } from './config';
import { SettingsIcon } from './icons/settingsIcon';
import { ShoppingIcon } from './icons/shoppingIcon';
import { createIcon } from './icons/svgIcon';
import { useSelector } from './util/useSelector';

const NavPanel = styled.nav`
    display: flex;
    flex-direction: column;
    min-width: 200px;
    flex: 0 0 auto;
    background-color: ${props => props.theme.dark};

    @media (max-width: 1100px) {
        min-width: 0;
        flex-direction: row;
    }

    @media print {
        display: none;
    }
`;

const LogoStyled = styled(Logo)<{ $disconnected: boolean }>`
    margin-top: 32px;
    margin-bottom: 32px;
    align-self: center;

    ${props => props.$disconnected && css`
        filter: brightness(1.2) grayscale(0.75);
    `}

    @media (max-width: 1100px) {
        height: 30px;
        margin: 8px auto 8px 8px;
    }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px 32px 12px 28px;
    color: ${props => props.theme.white};
    font-size: 18px;
    border: 0 solid transparent;
    border-left-width: 2px;

    ${({ $active }) => $active && css`
        color: ${props => props.theme.primary};
        background-color: ${props => props.theme.darkActiveLessor};
        border-color: ${props => props.theme.primary};
    `}

    &:hover,
    &:focus-visible {
        background-color: ${props => props.theme.darkActive};
    }

    svg {
        margin-left: -4px;
        margin-right: 16px;
    }

    @media (max-width: 1100px) {
        padding: 6px 16px 8px;
        border-left-width: 0;
        border-top-width: 2px;
        justify-content: center;
    }

    @media (max-width: 480px) {
        font-size: 16px;
        padding: 6px 8px 8px;

        svg {
            margin-left: -2px;
            margin-right: 8px;
        }
    }
`;

const Advanced = styled(Link)<{ $active: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: auto;
    margin-bottom: 32px;
    align-self: center;
    color: ${props => props.theme.white};
    padding: 8px 12px;
    border-radius: 20px;
    border: 1px solid transparent;

    ${({ $active }) => $active && css`
        background-color: ${props => props.theme.darkActiveLessor};
        border-color: ${props => props.theme.primary};

        svg {
            color: ${props => props.theme.primary};
        }
    `}

    &:hover,
    &:focus-visible {
        background-color: ${props => props.theme.darkActive};
    }

    svg {
        margin-right: 8px;
    }

    @media (max-width: 1100px) {
        aspect-ratio: 1 / 1;
        height: 100%;
        margin-bottom: auto;
        padding: 0;
        border-radius: 0;
        border-width: 0;
        border-top-width: 2px;

        svg {
            margin: 0;
        }

        span {
            display: none;
        }
    }
`;

const RecipesIcon = createIcon('RecipesIcon', <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />);

const useActive = (path: string) => {
    return !!useMatch({
        path,
        end: false,
    });
};

const showAdvanced = false; // Make it configurable?

export function Nav() {
    const disconnected = useSelector(state => !state.connected);

    const advanced = (active: boolean) => {
        if (!showAdvanced) {
            return null;
        }

        return (
            <Advanced to="/advanced" $active={active}>
                <SettingsIcon /> <span>Advanced</span>
            </Advanced>
        );
    };

    return (
        <NavPanel>
            <LogoStyled $disconnected={disconnected && !demoMode} />

            <NavLink to="/recipes" $active={useActive('recipes')}>
                <RecipesIcon /> Recipes
            </NavLink>

            <NavLink to="/shopping-list" $active={useActive('shopping-list')}>
                <ShoppingIcon /> Shopping List
            </NavLink>

            {advanced(useActive('advanced'))}
        </NavPanel>
    );
}
