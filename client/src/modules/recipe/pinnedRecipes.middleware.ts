import { Recipe } from '@hitpoints/shared';

import { keyVal } from '../../localDatabase/client.db';
import {  getRecipes } from '../../localDatabase/recipe.db';
import { Middleware } from '../../store';

/** Loads pinned recipes */
export const pinnedRecipesMiddleware: Middleware = ({ dispatch, getState }) => {
    async function loadRecipes() {
        const state = getState().pinnedRecipes;

        const recipes = {...state.recipes};
        const newRecipeIds = state.ids.filter(id => !state.recipes[id]);

        if (!newRecipeIds.length) {
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

    return next => event => {
        const result = next(event);

        loadRecipes();

        return result;
    };
};
