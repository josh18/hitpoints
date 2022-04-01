import { rgba } from 'polished';
import styled, { css } from 'styled-components';

import { positionInViewport } from '../../util/positionInViewport';
import { Card } from '../card';
import { Portal } from '../portal';

const List = styled(Card)`
    position: absolute;
    max-width: 300px;
`;

const Item = styled.button<{ selected: boolean }>`
    padding: 6px 12px;
    text-align: left;
    width: 100%;

    ${({ selected }) => selected && css`
        background-color: ${rgba('#000', 0.08)};
    `}
`;

export interface AtSuggestProps {
    items: string[];
    selected: number;
    onClick(index: number): void;
    position: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}

export function AtSuggest({ items, position, selected, onClick }: AtSuggestProps) {
    const setRef = (element: HTMLElement | null) => {
        if (element) {
            positionInViewport(element, position);
        }
    };

    const itemElements = items.map((name, i) => {
        return <Item selected={i === selected} onMouseDown={event => event.preventDefault()} onClick={() => onClick(i)} key={i}>{name}</Item>;
    });

    return (
        <Portal>
            <List floating ref={setRef}>
                {itemElements}
            </List>
        </Portal>
    );
}
