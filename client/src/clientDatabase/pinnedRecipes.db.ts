import { PinnedRecipes, PinnedRecipesEvent, pinnedRecipesReducer } from '@hitpoints/shared';

import { getDatabase, keyVal } from './client.db';

export async function updatePinnedRecipes(event: PinnedRecipesEvent) {
    const db = await getDatabase();
    const transaction = db.transaction('assorted', 'readwrite');

    let pinnedRecipes = await keyVal.get('pinnedRecipes', transaction);
    pinnedRecipes = pinnedRecipesReducer(pinnedRecipes, event);

    await keyVal.set('pinnedRecipes', pinnedRecipes, transaction);
    await transaction.done;
}

export async function putPinnedRecipes(pinnedRecipes: PinnedRecipes) {
    await keyVal.set('pinnedRecipes', pinnedRecipes);
}
