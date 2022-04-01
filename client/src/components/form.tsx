import styled from 'styled-components';

import { TransitionHeight } from './transitionHeight';

const TransitionHeightStyled = styled(TransitionHeight)`
    display: flex;
    /* height: 36px; */
    overflow: hidden;
`;

export const Error = styled.div`
    padding: 4px 8px;
    margin-top: 8px;
    color: ${props => props.theme.white};
    border-radius: 2px;
    background-color: ${props => props.theme.error};
`;

interface FormErrorProps {
    error?: string;
}

export function FormError({ error }: FormErrorProps) {
    // const transitionStart = {
    //     height: '0',
    // };

    let errorContainer;
    if (error) {
        errorContainer = <Error>{error}</Error>;
    }

    return (
        <TransitionHeightStyled role="alert" visible={!!error}>
            {errorContainer}
        </TransitionHeightStyled>
    );
}
