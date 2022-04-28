import { initialShoppingListState } from '@hitpoints/shared';

import { keyVal } from '../clientDatabase/client.db';
import {  getRecipes } from '../clientDatabase/recipe.db';
import { Middleware } from '../store';

export const commonMiddleware: Middleware = ({ dispatch, getState }) => {
    /** Loads newly pinned recipes */
    async function loadRecipes() {
        const state = getState().pinnedRecipes;

        const recipes = {...state.recipes};
        const newRecipeIds = state.ids.filter(id => !state.recipes[id]);

        if (!newRecipeIds.length) {
            if (!state.loaded) {
                dispatch({
                    type: 'PinnedRecipesLoaded',
                    recipes,
                });
            }
            return;
        }

        (await getRecipes(newRecipeIds))
            .forEach(recipe => recipes[recipe.id] = recipe);

        dispatch({
            type: 'PinnedRecipesLoaded',
            recipes,
        });
    }

    keyVal.get('pinnedRecipes').then((pinnedRecipes = []) => {
        dispatch({
            type: 'PinnedRecipesViewUpdated',
            pinnedRecipes,
        });
    });

    keyVal.get('shoppingList').then((shoppingList = initialShoppingListState()) => {
        dispatch({
            type: 'ShoppingListViewUpdated',
            shoppingList,
        });
    });

    return next => event => {
        const result = next(event);

        loadRecipes();

        return result;
    };
};
