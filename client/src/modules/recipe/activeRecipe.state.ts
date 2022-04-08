import { produce } from 'immer';

import { isRecipeEvent, Recipe, RecipeEvent, recipeReducer } from '@hitpoints/shared';

import { RecipeViewUpdated } from '../../api/event.middleware';

export interface ActiveRecipeLoaded {
    type: 'ActiveRecipeLoaded';
    recipe: Recipe;
}

export interface ActiveRecipeUnloaded {
    type: 'ActiveRecipeUnloaded';
}

export type ActiveRecipeEvent = ActiveRecipeLoaded | ActiveRecipeUnloaded;

export const activeRecipeReducer = produce((state: Recipe | null, event: ActiveRecipeEvent | RecipeViewUpdated | RecipeEvent) => {
    switch (event.type) {
        case 'ActiveRecipeLoaded':
            return event.recipe;
        case 'ActiveRecipeUnloaded':
            return null;
        case 'RecipeViewUpdated':
            if (event.recipe.id === state?.id) {
                return event.recipe;
            }
    }

    if (isRecipeEvent(event) && event.entityId === state?.id) {
        return recipeReducer(state, event);
    }
}, null);
