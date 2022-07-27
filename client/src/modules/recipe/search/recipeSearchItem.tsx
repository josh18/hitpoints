import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';
import { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { Recipe } from '@hitpoints/shared';

import { Card } from '../../../components/card';
import { BookmarkIcon } from '../../../icons/bookmarkIcon';
import { createIcon } from '../../../icons/svgIcon';
import { usePinnedRecipe } from '../hooks/usePinRecipe';
import { RecipeImage } from '../recipeImage';

const LinkStyled = styled(Link)`
    position: relative;
    display: block;
    color: inherit;
    min-width: 0;

    &::before,
    &::after {
        content: '';
        position: absolute;
        display: block;
        opacity: 0;
    }

    &::before {
        inset: 0;
        background-color: #8f633d;
    }

    &::after {
        right: 0;
        bottom: 0;
        left: 0;
        height: 4px;
        background-color: ${props => props.theme.primary};
    }

    &:hover::before,
    &:focus-visible::before {
        opacity: 0.08;
    }

    &:focus-visible::after {
        opacity: 1;
    }
`;

const Content = styled.div`
    display: flex;
    align-items: center;
    flex: 1;
    padding: 16px;
    min-width: 0;
`;

const Title = styled.h2`
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

const TogglePinned = styled.button<{ pinned: boolean }>`
    position: absolute;
    top: 16px;
    right: 16px;
    margin-left: auto;
    padding: 8px;
    margin: -4px;
    border-radius: 50%;
    background-color: ${rgba('#fff', 1)};
    opacity: 0;
    box-shadow: ${props => props.theme.shadow};

    &:hover,
    &:focus-visible {
    }

    ${LinkStyled}:hover & {
        opacity: 1;
    }

    ${props => props.pinned && css`
        opacity: 1;
    `}

    @media (hover: none) {
        opacity: 1;
    }
`;

const PinIcon = createIcon('PinIcon', <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v4h2v-4H19v-2c-1.66 0-3-1.34-3-3z" />);

const BookmarkIconStyled = styled(BookmarkIcon)<{ pinned: boolean }>`
    path:first-child {
        transition: ${props => props.theme.transition('fill')};

        ${props => props.pinned && css`
            fill: ${rgba('#000', 0.2)};
        `}
    }
`;

const PinIconStyled = styled(PinIcon)<{ pinned: boolean }>`
    opacity: 0;
    position: absolute;
    transition: ${props => props.theme.transition('opacity', 'transform')};
    transform: translate(8px, -15px) rotate(60deg);

    ${props => props.pinned && css`
        opacity: 1;
        transform: translate(4px, -7px) rotate(40deg);
        animation-duration: 500ms;
    `};
`;

export interface RecipeItemProps {
    recipe: Recipe;
    observer?: JSX.Element;
}

export function RecipeSearchItem({ recipe, observer }: RecipeItemProps) {
    const { pinned, togglePinnedRecipe } = usePinnedRecipe(recipe.id);

    const togglePinned = (event: MouseEvent) => {
        event.preventDefault();
        togglePinnedRecipe();
    };

    return (
        <LinkStyled to={recipe.id}>
            <Card>
                <RecipeImage imageId={recipe.imageId} />

                <Content>
                    <Title>{recipe.name || 'Untitled Recipe'}</Title>
                    <TogglePinned pinned={pinned} onClick={togglePinned}>
                        <BookmarkIconStyled pinned={pinned} />
                        <PinIconStyled pinned={pinned} />
                    </TogglePinned>
                </Content>
            </Card>
            {observer}
        </LinkStyled>
    );
}
