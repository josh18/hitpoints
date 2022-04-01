import { rgba } from 'polished';
import { Fragment } from 'react';
import styled from 'styled-components';

import { measurementToString, Recipe } from '@hitpoints/shared';

interface RecipeIngredientsProps {
    ingredients: Recipe['ingredients'];
}

const Ingredients = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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

const Name = styled.div`
    font-weight: 600;
`;

const Amount = styled.div`
    text-align: right;
`;

export function RecipeIngredients({ ingredients }: RecipeIngredientsProps) {
    return (
        <Ingredients>
            {ingredients.map(ingredient => {
                if (ingredient.type === 'Heading') {
                    return <Heading key={ingredient.id}>{ingredient.name || 'Untitled'}</Heading>;
                }

                let measurement = '';
                if (ingredient.measurement) {
                    measurement = measurementToString(ingredient.measurement, ingredient.amount);
                }

                return (
                    <Fragment key={ingredient.id}>
                        <Amount>{ingredient.amount} {measurement}</Amount>
                        <Name>{ingredient.name}</Name>
                    </Fragment>
                );
            })}
        </Ingredients>
    );
}
