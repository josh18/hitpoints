import { css, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';
import { Link } from 'react-router-dom';

interface ButtonProps {
    active?: boolean;
    secondary?: boolean;
    theme: Theme;
}

const style = ({ active, secondary, theme }: ButtonProps) => css`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.whiteText};
    line-height: 1.5;
    background-color: ${secondary ? theme.dark : theme.primary};
    box-shadow: ${theme.shadow};
    border-radius: 2px;

    @media (hover: hover) {
        &:hover,
        &:focus-visible {
            background-color: ${secondary ? theme.darkActive : theme.primaryActive};
        }
    }

    ${active && css`
        background-color:${secondary ? theme.darkActive : theme.primaryActive};
    `}

    &:disabled {
        cursor: default;
        box-shadow: none;
        background-color: ${rgba(theme.primary, 0.6)};
    }
`;

const buttonStyle = (props: ButtonProps) => css`
    ${style(props)}

    padding: 6px 12px;

    svg {
        margin-left: -4px;
        margin-right: 8px;
    }
`;

export const IconButton = styled.button<Partial<ButtonProps>>`
    ${style}

    padding: 6px;
`;

export const Button = styled.button<Partial<ButtonProps>>`
    ${buttonStyle}
`;

export const LinkButton = styled(Link)`
    ${buttonStyle}
`;

export const TextButton = styled.button`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    font-weight: 600;
    border-radius: 2px;

    @media (hover: hover) {
        &:hover,
        &:focus-visible {
            background-color: ${rgba('#000', 0.08)};
        }
    }
`;
