import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import styled, { css, keyframes } from 'styled-components';

import { connection } from '../../../api/connection';
import { Button } from '../../../components/button';
import { DialogActions } from '../../../components/dialog';
import { FormError } from '../../../components/form';
import { demoMode } from '../../../config';
import { AddIcon } from '../../../icons/addIcon';
import { WarningIcon } from '../../../icons/warningIcon';
import { onEnter } from '../../../util/onEnter';
import { Unsubscribe } from '../../../util/types';
import { useSelector } from '../../../util/useSelector';

const rotate = keyframes`
    0% { transform: rotate(0); }
    100% { transform: rotate(360deg); }
`;

const grow = keyframes`
    50% { transform: scale(1.2); }
`;

const Disabled = styled.div`
    display: flex;
    align-items: center;

    svg {
        margin-right: 16px;
        fill: ${({ theme }) => theme.warning};
    }
`;

const URLInput = styled.input`
    width: 600px;
    max-width: 100%;
`;

const GrowContainer = styled.div<{ importing: boolean }>`
    display: flex;

    ${({ importing }) => importing && css`
        animation-name: ${grow};
        animation-duration: 1.2s;
        animation-iteration-count: infinite;
    `}
`;

const AddIconStyled = styled(AddIcon)<{ importing: boolean }>`
    ${({ importing }) => importing && css`
        animation-name: ${rotate};
        animation-duration: 1.2s;
        animation-iteration-count: infinite;
    `}
`;

const Message = styled.div`
    max-width: 600px;
`;

export interface RecipeImportProps {
    onClose(): void;
}

export function RecipeImport({ onClose }: RecipeImportProps) {
    const connected = useSelector(state => state.connected);
    const unbsubscribe = useRef<Unsubscribe>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [value, setValue] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        return () => unbsubscribe.current?.();
    }, []);

    const importRecipe = () => {
        if (!value) {
            return;
        }

        setError(undefined);
        setImporting(true);

        unbsubscribe.current = connection.request('importRecipe', { url: value }, response => {
            dispatch(response.event);
            navigate(response.id);
        }, error => {
            setError(error);
            setImporting(false);
        });
    };

    if (!connected) {
        let message = `Unfortunately you can't import recipes unless you are connected to the server.`;
        if (demoMode) {
            message = `Unfortunately you can't import recipes in demo mode as there is no server available to provide scraping functionality.`;
        }

        return (
            <Disabled>
                <WarningIcon /> <Message>{message}</Message>
            </Disabled>
        );
    }

    return (
        <>
            <div>
                <label htmlFor="recipeImportInput">Recipe URL</label>
                <URLInput id="recipeImportInput" autoFocus autoComplete="off" value={value} onKeyDown={onEnter(importRecipe)} onChange={event => setValue(event.target.value)} />
                <FormError error={error}></FormError>
            </div>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={!value || importing} onClick={importRecipe}>
                    <GrowContainer importing={importing}>
                        <AddIconStyled importing={importing} />
                    </GrowContainer>
                    Import
                </Button>
            </DialogActions>
        </>
    );
}
