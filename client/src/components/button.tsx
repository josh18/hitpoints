import { rgba } from 'polished';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

const style = css<{ active?: boolean; secondary?: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.white};
    line-height: 1.5;
    background-color: ${({ secondary, theme }) => secondary ? theme.dark : theme.primary};
    box-shadow: ${props => props.theme.shadow};
    border-radius: 2px;

    &:hover,
    &:focus-visible {
        background-color: ${({ secondary, theme }) => secondary ? theme.darkActive : theme.primaryActive};
    }

    ${({ active }) => active && css<{ secondary?: boolean }>`
        background-color:${({ secondary, theme }) => secondary ? theme.darkActive : theme.primaryActive};
    `}

    &:disabled {
        cursor: default;
        box-shadow: none;
        background-color: ${props => rgba(props.theme.primary, 0.6)};
    }
`;

const buttonStyle = css`
    ${style}

    padding: 6px 12px;

    svg {
        margin-left: -4px;
        margin-right: 8px;
    }
`;

export const IconButton = styled.button<{ active?: boolean; secondary?: boolean; }>`
    ${style}

    padding: 6px;
`;

export const Button = styled.button`
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

    &:hover,
    &:focus-visible {
        background-color: ${rgba('#000', 0.08)};
    }
`;
