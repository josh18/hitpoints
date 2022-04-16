import { rgba } from 'polished';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { RemoveIcon } from '../icons/removeIcon';

const Button = styled.button<{ invert?: boolean; small?: boolean }>`
    padding: 3px;
    border-radius: 50%;
    color: ${props => props.invert ? rgba('#fff', 0.8) : rgba('#000', 0.5)};

    @media (hover: hover) {
        &:hover,
        &:focus-visible {
            color: ${props => props.invert ? rgba('#fff', 0.9) : rgba('#000', 0.8)};
            background-color: ${props => props.invert ? rgba('#fff', 0.16) : rgba('#000', 0.12)};
        }
    }

    ${({ small }) => small && css`
        padding: 2px;
    `}
`;

export interface RemoveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    invert?: boolean;
    small?: boolean,
}

export const RemoveButton = forwardRef<HTMLButtonElement, RemoveButtonProps>((props, ref) => {
    return <Button ref={ref} {...props}><RemoveIcon size={ props.small ? 18 : 24 } /></Button>;
});

RemoveButton.displayName = 'RemoveButton';
