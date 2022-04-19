import styled from 'styled-components';

import { TransitionHeight } from './transitionHeight';

const TransitionHeightStyled = styled(TransitionHeight)`
    display: flex;
`;

export const Error = styled.div`
    padding: 4px 8px;
    margin-top: 8px;
    color: ${props => props.theme.whiteText};
    border-radius: 2px;
    background-color: ${props => props.theme.error};
`;

interface FormErrorProps {
    error?: string;
}

export function FormError({ error }: FormErrorProps) {
    let errorContainer;
    if (error) {
        errorContainer = <Error>{error}</Error>;
    }

    return (
        <TransitionHeightStyled data-test="yes" role="alert" visible={!!error}>
            {errorContainer}
        </TransitionHeightStyled>
    );
}
