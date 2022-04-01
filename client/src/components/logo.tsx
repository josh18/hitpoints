import { AnchorHTMLAttributes, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const throb = keyframes`
    0% { transform: scale(1); }
    10% { transform: scale(1.2); }
    20% { transform: scale(1); }
    30% { transform: scale(1.2); }
    40% { transform: scale(1); }
`;

const LogoLink = styled(Link)`
    display: flex;
    height: 40px;
`;

const Svg = styled.svg<{ play: boolean; }>`
    height: 100%;
    animation-name: ${throb};
    animation-duration: 2s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-play-state: ${props => props.play ? 'running' : 'paused'};
`;

export function Logo(props: AnchorHTMLAttributes<HTMLAnchorElement>): JSX.Element {
    const [play, setPlay] = useState(false);
    const [pauseOnComplete, setPauseOnComplete] = useState(false);

    const onMouseEnter = (): void => {
        setPlay(true);
        setPauseOnComplete(false);
    };
    const onMouseLeave = (): void => setPauseOnComplete(true);
    const onAnimationIteration = (): void => {
        if (pauseOnComplete) {
            setPlay(false);
            setPauseOnComplete(false);
        }
    };

    return (
        <LogoLink
            {...props}
            to="/"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Svg
                play={play}
                viewBox="0 0 48 40"
                onAnimationIteration={onAnimationIteration}
            >
                <path fill="#50101d" d="M20.016 0H8v4.016H4.015V8H0v12.017h4.015v3.982H8v4.017h4.015V32H16v4.016h4.016V40h7.999v-3.984H32V32h4.015v-3.984H40v-4.017h4.015v-3.982H48V8h-3.985V4.016H40V0H28.015v4.016h-7.999z" />
                <path fill="#d83816" d="M39.985 7.984V4H27.999v3.984H20V4H7.984v3.984H4v12.017h3.984v3.983H12v4.017h3.985v3.984H20v4.014h7.999v-4.014h3.984v-3.984H36v-4.017h3.985v-3.983H44V7.984z" />
                <path fill="#c0341a" d="M23.985 31.985v-3.984H20v-4.017h-4.016v-3.983H12v-4.016H7.984v-3.984H4v8h3.984v3.983H12v4.017h3.984v3.984H20v4.014H27.999v-4.014z" />
                <path fill="#ee7049" d="M36.014 12.016V8h-4.015v8h8v-3.984z" />
            </Svg>
        </LogoLink>
    );
}
