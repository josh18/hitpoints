import styled from '@emotion/styled';
import { rgba } from 'polished';
import { ReactNode } from 'react';

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
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 2;
    padding: 32px;
    margin: 32px;
    max-height: calc(100% - 64px);

    @media (max-width: 550px) {
        padding: 16px;
        margin: 16px;
    }
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
    display: flex;
    column-gap: 8px;
    justify-content: end;
    margin-top: 32px;
`;

export const DailogScrollContent = styled.div`
    overflow: auto;
    margin: -32px -32px 0 -32px;
    padding: 32px;
    border-bottom: 1px solid ${rgba('#000', 0.08)};
`;
