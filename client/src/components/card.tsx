import { rgba } from 'polished';
import styled, { css } from 'styled-components';

export const Card = styled.div<{ floating?: boolean }>`
    border-radius: 2px;
    background-color: ${props => props.theme.whiteBackground};
    box-shadow: ${({ floating, theme }) => floating ? theme.highShadow : theme.shadow};
    overflow: hidden;

    ${({ floating }) => floating && css`
        z-index: 100;
    `}

    @media print {
        box-shadow: inset 0 0 0 1px ${rgba('#000', 0.08)};
    }
`;
