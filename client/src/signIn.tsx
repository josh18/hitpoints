import { useCallback, useState } from 'react';
import styled from 'styled-components';

import { auth } from './api/auth';
import { Button } from './components/button';
import { Card } from './components/card';
import { FormError } from './components/form';
import { VisuallyHidden } from './components/visuallyHidden';
import { onEnter } from './util/onEnter';

const Container = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
`;

const Content = styled(Card)`
    display: flex;
    padding: 32px;
    margin: 32px;

    @media (max-width: 550px) {
        display: block;
    }
`;

const Control = styled.div`
    width: 600px;
    max-width: 100%;
`;

const Submit = styled(Button)`
    margin-left: 32px;

    @media (max-width: 550px) {
        margin-left: auto;
        margin-top: 32px;
    }
`;

export function SignIn() {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | undefined>(undefined);
    const [signingIn, setSigningIn] = useState(false);

    const submit = async () => {
        if (!value) {
            return;
        }

        setSigningIn(true);
        setError(undefined);
        const result = await auth.signIn(value);

        if (result === true) {
            return;
        }

        setSigningIn(false);
        setError(result);
    };

    return (
        <Container>
            <Content>
                <Control>
                    <VisuallyHidden>
                        <label htmlFor="signInInput">Password</label>
                    </VisuallyHidden>

                    <input id="signInInput" type="password" autoFocus value={value} onKeyDown={onEnter(submit)} onChange={event => setValue(event.target.value)} />

                    <FormError error={error}></FormError>
                </Control>

                <Submit disabled={!value || signingIn} onClick={submit}>Submit</Submit>
            </Content>
        </Container>
    );
}
