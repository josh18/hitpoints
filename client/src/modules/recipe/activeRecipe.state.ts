import { produce } from 'immer';

import { isRecipeEvent, Recipe, RecipeEvent, recipeReducer } from '@hitpoints/shared';

export interface ActiveRecipeViewSet {
    type: 'ActiveRecipeViewSet';
    id: string;
}

export interface ActiveRecipeViewUnset {
    type: 'ActiveRecipeViewUnset';
}

export interface ActiveRecipeViewUpdated {
    type: 'ActiveRecipeViewUpdated';
    recipe: Recipe;
}

export type ActiveRecipeEvent = ActiveRecipeViewSet | ActiveRecipeViewUnset | ActiveRecipeViewUpdated;

export interface ActiveRecipeState {
    recipe?: Recipe;
    id?: string;
}

export const activeRecipeReducer = produce((state: ActiveRecipeState, event: ActiveRecipeEvent | RecipeEvent) => {
    switch (event.type) {
        case 'ActiveRecipeViewSet':
            state.id = event.id;
            return;
        case 'ActiveRecipeViewUnset':
            state.id = undefined;
            state.recipe = undefined;
            return;
        case 'ActiveRecipeViewUpdated':
            state.recipe = event.recipe;
            return;
    }

    if (!isRecipeEvent(event)) {
        return;
    }

    if (event.entityId === state.id) {
        state.recipe = recipeReducer(state.recipe, event);
    }
}, {} as ActiveRecipeState);
