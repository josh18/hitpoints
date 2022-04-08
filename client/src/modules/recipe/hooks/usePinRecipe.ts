import { useCallback } from 'react';

import { PinnedRecipesEvent, pinnedRecipesId } from '@hitpoints/shared';

import { DistributiveOmit } from '../../../util/types';
import { useDispatch } from '../../../util/useDispatch';
import { useSelector } from '../../../util/useSelector';
import { uuid } from '../../../util/uuid';

export type PartialShoppingListEvent = DistributiveOmit<PinnedRecipesEvent, 'id' | 'entityId' | 'timestamp'>;

export function usePinnedRecipe(id: string) {
    const dispatch = useDispatch();

    const pinnedRecipes = useSelector(state => state.pinnedRecipes.ids);
    const pinned = pinnedRecipes.includes(id);

    const pinRecipe = useCallback((recipeId: string) => {
        dispatch({
            type: 'RecipePinned',
            recipeId,
            id: uuid(),
            entityId: pinnedRecipesId,
            timestamp: new Date().toISOString(),
        });
    }, [dispatch]);

    const unpinRecipe = useCallback((recipeId: string) => {
        dispatch({
            type: 'RecipeUnpinned',
            recipeId,
            id: uuid(),
            entityId: pinnedRecipesId,
            timestamp: new Date().toISOString(),
        });
    }, [dispatch]);

    const togglePinnedRecipe = () => {
        if (pinned) {
            unpinRecipe(id);
        } else {
            pinRecipe(id);
        }
    };

    return {
        pinned,
        pinRecipe,
        unpinRecipe,
        togglePinnedRecipe,
    };
}
