import { produce } from 'immer';

import { isPinnedRecipesEvent, isRecipeEvent, pinnedRecipesReducer, Recipe, RecipeEvent, recipeReducer } from '@hitpoints/shared';

import { PinnedRecipesViewUpdated, RecipeViewUpdated } from '../../api/event.middleware';

export interface PinnedRecipesLoaded {
    type: 'PinnedRecipesLoaded';
    recipes: {
        [id: string]: Recipe;
    };
}

type ReducerEvent = PinnedRecipesLoaded | PinnedRecipesViewUpdated | RecipeEvent | RecipeViewUpdated;

interface PinnedRecipesState {
    ids: string[];
    recipes: {
        [id: string]: Recipe;
    };
    loaded: boolean;
}

const initialState: PinnedRecipesState = {
    ids: [],
    recipes: {},
    loaded: false,
};

export const localPinnedRecipesReducer = produce((state: PinnedRecipesState, event: ReducerEvent) => {
    switch (event.type) {
        case 'PinnedRecipesLoaded':
            state.recipes = event.recipes;
            state.loaded = true;
            return;
        case 'PinnedRecipesViewUpdated':
            state.ids = event.pinnedRecipes;
            return;
        case 'RecipeViewUpdated':
            if (state.recipes[event.recipe.id]) {
                state.recipes[event.recipe.id] = event.recipe;
            }
            return;
    }

    if (isPinnedRecipesEvent(event)) {
        state.ids = pinnedRecipesReducer(state.ids, event);
        Object.keys(state.recipes).forEach(id => {
            if (!state.ids.includes(id)) {
                delete state.recipes[id];
            }
        });
    } else if (isRecipeEvent(event)) {
        if (state.recipes[event.entityId]) {
            state.recipes[event.entityId] = recipeReducer(state.recipes[event.entityId], event);
        }
    }
}, initialState);
