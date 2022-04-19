import { rgba } from 'polished';
import { Fragment } from 'react';
import styled, { css } from 'styled-components';

import { measurementToString, Recipe } from '@hitpoints/shared';

const Ingredients = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;
    row-gap: 8px;
    max-width: 800px;
    align-self: center;
`;

const Heading = styled.div`
    grid-column: span 2;
    font-weight: 600;
    background-color: ${rgba('#000', 0.08)};
    font-size: 18px;
    padding: 8px;

    &:not(:first-child) {
        margin-top: 16px;
    }
`;

const highlightStyle = css<{ highlight: boolean; }>`
    ${props => props.highlight && css`
        color: ${props => props.theme.primaryText};
    `}
`;

const Name = styled.div<{ highlight: boolean; }>`
    font-weight: 600;

    ${highlightStyle}
`;

const Amount = styled.div<{ highlight: boolean; }>`
    text-align: right;

    ${highlightStyle}
`;

interface RecipeIngredientsProps {
    ingredients: Recipe['ingredients'];
    focused?: string[];
}

export function RecipeIngredients({ ingredients, focused }: RecipeIngredientsProps) {
    return (
        <Ingredients>
            {ingredients.map(ingredient => {
                if (ingredient.type === 'Heading') {
                    return <Heading key={ingredient.id}>{ingredient.name || 'Untitled'}</Heading>;
                }

                const measurement = ingredient.measurement && measurementToString(ingredient.measurement, ingredient.amount);

                const highlight = !!focused && focused.includes(ingredient.id);

                return (
                    <Fragment key={ingredient.id}>
                        <Amount highlight={highlight}>{ingredient.amount} {measurement}</Amount>
                        <Name highlight={highlight}>{ingredient.name}</Name>
                    </Fragment>
                );
            })}
        </Ingredients>
    );
}
