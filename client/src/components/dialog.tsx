import { rgba } from 'polished';
import { ReactNode, useEffect } from 'react';
import styled from 'styled-components';

import { useOnEscape } from '../util/useOnEscape';
import { Card } from './card';
import { Portal } from './portal';
import { TransitionIn } from './transitionIn';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    z-index: 10000;
    inset: 0;
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    background-color: ${rgba('#000', 0.6)};
    z-index: 0;
`;

const Content = styled(Card)`
    position: relative;
    z-index: 2;
    padding: 32px;
    margin: 32px;
`;

interface DialogProps {
    active: boolean;
    children: ReactNode;
    onClose(): void;
}

export function Dialog({ active, children, onClose }: DialogProps) {
    useOnEscape(onClose);

    return (
        <Portal>
            <TransitionIn visible={active}>
                <Container>
                    <Overlay onClick={onClose} />

                    <Content>{children}</Content>
                </Container>
            </TransitionIn>
        </Portal>
    );
}

export const DialogActions = styled.div`
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 8px;
    justify-content: end;
    margin-top: 32px;
`;
