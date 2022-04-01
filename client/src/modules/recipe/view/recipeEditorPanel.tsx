import styled from 'styled-components';

import { Recipe } from '@hitpoints/shared';

import { Tabs } from '../../../components/tabs';
import { RecipeIngredientsEditor } from './recipeIngredientsEditor';
import { RecipeInstructionsEditor } from './recipeInstructionsEditor';
import { RecipeTagsEditor } from './recipeTagsEditor';

const Container = styled.div`
    flex: 1 1 auto;
`;

interface RecipeEditorPanelProps {
    recipe: Recipe;
}

export function RecipeEditorPanel({ recipe }: RecipeEditorPanelProps) {
    const tabs = [
        {
            name: 'Ingredients',
            children: <RecipeIngredientsEditor ingredients={recipe.ingredients} />,
        }, {
            name: 'Instructions',
            children: <RecipeInstructionsEditor ingredients={recipe.ingredients} instructions={recipe.instructions} />,
        }, {
            name: 'Tags',
            children: <RecipeTagsEditor tags={recipe.tags} />,
        },
    ];

    return (
        <Container>
            <Tabs tabs={tabs} />
        </Container>
    );
}
