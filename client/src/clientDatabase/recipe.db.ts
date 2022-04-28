import { Recipe, RecipeEvent, recipeReducer } from '@hitpoints/shared';

import { recipeImageUrl } from '../modules/recipe/recipeImage';
import { getDatabase } from './client.db';

const recipeIndexWorker = new Worker(new URL('./recipeIndex.worker', import.meta.url));

export function indexRecipes() {
    recipeIndexWorker.postMessage('Index recipes please.');
}

export async function getRecipe(id: string) {
    const db = await getDatabase();
    return db.get('recipes', id);
}

export async function getRecipes(ids: string[]) {
    let attempts = 1;
    while (attempts <= 5) {
        attempts++;
        const db = await getDatabase();
        const transaction = db.transaction('recipes');

        const recipes = await Promise.all(
            ids.map(id => transaction.store.get(id)),
        );

        await transaction.done;

        if (recipes.every((recipe): recipe is Recipe => !!recipe)) {
            return recipes;
        }
    }

    throw new Error('Some recipes were not found.');
}

/** Updates a recipe from a local event */
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

export async function putRecipe(recipe: Recipe) {
    // Pre-cache images for offline use
    if (recipe.imageId) {
        const image = new Image();
        image.src = recipeImageUrl(recipe.imageId);
    }

    const db = await getDatabase();
    await db.put('recipes', recipe);

    indexRecipes();
}

export async function deleteRecipe(id: string) {
    const db = await getDatabase();
    await db.delete('recipes', id);
}
