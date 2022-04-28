import { ShoppingList, ShoppingListEvent, shoppingListReducer } from '@hitpoints/shared';

import { getDatabase, keyVal } from './client.db';

export async function updateShoppingList(event: ShoppingListEvent) {
    const db = await getDatabase();
    const transaction = db.transaction('assorted', 'readwrite');

    let shoppingList = await keyVal.get('shoppingList', transaction);
    shoppingList = shoppingListReducer(shoppingList, event);

    await keyVal.set('shoppingList', shoppingList, transaction);
    await transaction.done;
}

export async function putShoppingList(shoppingList: ShoppingList) {
    await keyVal.set('shoppingList', shoppingList);
}
