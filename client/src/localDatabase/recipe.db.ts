import { buildRecipe, RecipeEvent, recipeReducer } from '@hitpoints/shared';

import { recipeImageUrl } from '../modules/recipe/recipeImage';
import { Dispatch, StoreState } from '../store';
import { getDatabase } from './local.db';

const recipeIndexWorker = new Worker(new URL('./recipeIndex.worker', import.meta.url));
const indexRecipes = () => recipeIndexWorker.postMessage('Index recipes please.');

export async function updateRecipe(event: RecipeEvent) {
    const id = event.entityId;

    const db = await getDatabase();
    const transaction = db.transaction('recipes', 'readwrite');

    let recipe = await transaction.store.get(id);
    recipe = recipeReducer(recipe, event);

    await transaction.store.put(recipe);
    await transaction.done;

    indexRecipes();
}

export async function rebuildRecipe(events: RecipeEvent[], { activeRecipe }: StoreState, dispatch: Dispatch) {
    const recipe = buildRecipe(events);

    if (recipe.id === activeRecipe.id) {
        dispatch({
            type: 'ActiveRecipeViewUpdated',
            recipe,
        });
    }

    // Pre-cache images for offline use
    if (recipe.imageId) {
        const image = new Image();
        image.src = recipeImageUrl(recipe.imageId);
    }

    const db = await getDatabase();
    await db.put('recipes', recipe);

    indexRecipes();
}
