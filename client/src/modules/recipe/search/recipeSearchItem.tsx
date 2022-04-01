import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Recipe } from '@hitpoints/shared';

import { Card } from '../../../components/card';
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
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: #8f633d;
    }

    &::after {
        left: 0;
        bottom: 0;
        right: 0;
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
    flex: 1;
    padding: 16px;
    min-width: 0;
`;

const Title = styled.h2`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`;

export interface RecipeItemProps {
    recipe: Recipe;
    observer?: JSX.Element;
}

export function RecipeSearchItem({ recipe, observer }: RecipeItemProps) {
    return (
        <LinkStyled to={recipe.id}>
            <Card>
                <RecipeImage imageId={recipe.imageId} />

                <Content>
                    <Title>{recipe.name || 'Untitled Recipe'}</Title>
                </Content>
            </Card>
            {observer}
        </LinkStyled>
    );
}
