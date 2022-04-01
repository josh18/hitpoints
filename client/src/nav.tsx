import { Link, useMatch } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { Logo } from './components/logo';
import { demoMode } from './config';
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
    border-left: 2px solid transparent;

    ${({ $active }) => $active && css`
        border-color: #38a3f1 !important;
        color: #38a3f1;
        background-color: ${props => props.theme.darkActiveLessor};
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
        border-left: 0;
        border-top: 2px solid transparent;
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

const RecipesIcon = createIcon('RecipesIcon', <path d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" />);
const ShoppingIcon = createIcon('ShoppingIcon', <path d="M22 9h-4.79l-4.38-6.56c-.19-.28-.51-.42-.83-.42s-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1zM12 4.8L14.8 9H9.2L12 4.8zM18.5 19l-12.99.01L3.31 11H20.7l-2.2 8zM12 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />);

const useActive = (path: string) => {
    return !!useMatch({
        path,
        end: false,
    });
};

export function Nav() {
    const disconnected = useSelector(state => !state.connected);

    return (
        <NavPanel>
            <LogoStyled $disconnected={disconnected && !demoMode} />

            <NavLink to="/recipes" $active={useActive('recipes')}>
                <RecipesIcon />Recipes
            </NavLink>

            <NavLink to="/shopping-list" $active={useActive('shopping-list')}>
                <ShoppingIcon />Shopping List
            </NavLink>
        </NavPanel>
    );
}
