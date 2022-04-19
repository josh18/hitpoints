import { rgba } from 'polished';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { auth } from '../../api/auth';
import { RemoveButton } from '../../components/removeButton';
import { TransitionIn } from '../../components/transitionIn';
import { demoMode } from '../../config';
import { useDispatch } from '../../util/useDispatch';
import { useSelector } from '../../util/useSelector';

const TransitionInStyled = styled(TransitionIn)`
    width: 100%;

    & + & {
        margin-top: 24px;

        @media (max-width: 850px) {
            margin-top: 8px;
        }
    }
`;

const Container = styled.div`
    position: fixed;
    left: 40px;
    bottom: 40px;
    display: flex;
    flex-direction: column;
    align-items: start;
    z-index: 1000;

    @media (max-width: 850px) {
        left: 8px;
        right: 8px;
        bottom: 8px;
    }

    @media print {
        display: none;
    }
`;

const DefaultNotification = styled.div`
    display: flex;
    align-items: center;
    padding: 16px 32px;
    background-color: ${props => props.theme.whiteBackground};
    border-radius: 2px;
    min-width: 300px;
    max-width: 600px;
    min-height: 62px;
    box-shadow: ${props => props.theme.highShadow};

    @media (max-width: 850px) {
        padding: 8px 16px;
        min-width: initial;
        max-width: initial;
        width: 100%;
    }
`;

const ErrorNotification = styled(DefaultNotification) <{ visible?: boolean; }>`
    padding: 16px 32px;
    color: ${props => props.theme.whiteText};
    background-color: ${props => props.theme.error};
`;

const ErrorMessages = styled.div`
    flex: 1;
`;

const NotificationMessage = styled.span`
    flex: 1 1 auto;
`;

const ActionButton = styled.button`
    padding: 6px 12px;
    margin-left: 16px;
    background-color: ${rgba('#000', 0.12)};
    border-radius: 2px;

    &:hover,
    &:focus-visible {
        background-color: ${ rgba('#000', 0.24)};
    }
`;

const DismissButton = styled(RemoveButton)`
    margin-left: 16px;
    margin-right: -12px;

    @media (max-width: 850px) {
        margin-right: -6px;
    }
`;

const hideInstallKey = 'Hitpoints|HideInstallNotification';

interface BeforeInstallPromptEvent extends Event {
    userChoice: Promise<'accepted' | 'dismissed'>;
    prompt(): void;
}

export function Notification() {
    const dispatch = useDispatch();

    const errors = useSelector(({ error }) => error);
    const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent>();
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [showDemo, setShowDemo] = useState(demoMode);

    useEffect(() => {
        window.addEventListener('beforeinstallprompt', event => {
            event.preventDefault();

            if (!auth.authenticated) {
                return;
            }

            if (localStorage.getItem(hideInstallKey) === 'true') {
                return;
            }

            if (/android/i.test(navigator.userAgent)) {
                setInstallEvent(event as BeforeInstallPromptEvent);
            }
        });

        window.addEventListener('serviceWorkerUpdated', () => {
            setUpdateAvailable(true);
        });
    }, []);

    let installNotification;
    if (installEvent) {
        const install = async () => {
            installEvent.prompt();

            await installEvent.userChoice;

            setInstallEvent(undefined);
        };

        const dismiss = () => {
            localStorage.setItem(hideInstallKey, 'true');
            setInstallEvent(undefined);
        };

        installNotification = (
            <DefaultNotification>
                <NotificationMessage>Hitpoints can be installed as an app</NotificationMessage>
                <ActionButton onClick={install}>Install</ActionButton>
                <DismissButton onClick={dismiss} />
            </DefaultNotification>
        );
    }

    let updateNotification;
    if (updateAvailable) {
        updateNotification = (
            <DefaultNotification>
                <NotificationMessage>An update is available</NotificationMessage>
                <ActionButton onClick={() => window.location.reload()}>Reload</ActionButton>
                <DismissButton onClick={() => setUpdateAvailable(false)} />
            </DefaultNotification>
        );
    }

    let demoNotification;
    if (showDemo) {
        demoNotification = (
            <DefaultNotification>
                <NotificationMessage>Running in demo mode.<br /> Data will only be saved in browser storage.</NotificationMessage>
                <DismissButton onClick={() => setShowDemo(false)} />
            </DefaultNotification>
        );
    }

    let errorNotification;
    if (errors) {
        const hideError = () => dispatch({
            type: 'HideError',
        });

        errorNotification = (
            <ErrorNotification>
                <ErrorMessages>
                    {errors.map((error, i) => <p key={i}>{error}</p>)}
                </ErrorMessages>
                <DismissButton invert onClick={hideError} />
            </ErrorNotification>
        );
    }

    const transitionStart = {
        opacity: '0',
        transform: 'translateY(24px)',
    };

    return (
        <Container role="alert">
            <TransitionInStyled visible={!!updateNotification} transitionStart={transitionStart}>{updateNotification}</TransitionInStyled>
            <TransitionInStyled visible={!!installNotification} transitionStart={transitionStart}>{installNotification}</TransitionInStyled>
            <TransitionInStyled visible={!!demoNotification} transitionStart={transitionStart}>{demoNotification}</TransitionInStyled>
            <TransitionInStyled visible={!!errorNotification} transitionStart={transitionStart}>{errorNotification}</TransitionInStyled>
        </Container>
    );
}
