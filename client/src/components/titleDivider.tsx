import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';

const Divider = styled.div<{ first: boolean; }>`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-gap: 8px;
    align-items: center;
    margin-bottom: 48px;
    text-transform: uppercase;
    text-align: center;
    color: ${rgba('#000', 0.3)};

    ${({ first }) => !first && css`
        margin-top: 48px;
    `}
`;

const Line = styled.div<{ direction: string; }>`
    flex: 1 1 auto;
    height: 1px;
    background-image: linear-gradient(to ${props => props.direction}, ${`${rgba('#000', 0.16)}, transparent`});
`;

interface TitleDividerProps {
    title: string;
    first?: boolean;
}

export function TitleDivider({ title, first = false }: TitleDividerProps) {
    return (
        <Divider first={first}>
            <Line direction="left" />{title}<Line direction="right" />
        </Divider>
    );
}
