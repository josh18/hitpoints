import { buildShoppingList, ShoppingListEvent, shoppingListReducer } from '@hitpoints/shared';

import { Dispatch } from '../store';
import { getDatabase, keyVal } from './local.db';

export async function updateShoppingList(event: ShoppingListEvent) {
    const db = await getDatabase();
    const transaction = db.transaction('assorted', 'readwrite');

    let shoppingList = await keyVal.get('shoppingList', transaction);
    shoppingList = shoppingListReducer(shoppingList, event);

    await keyVal.set('shoppingList', shoppingList, transaction);
    await transaction.done;
}

export async function rebuildShoppingList(events: ShoppingListEvent[], dispatch: Dispatch) {
    const shoppingList = buildShoppingList(events);

    dispatch({
        type: 'ShoppingListViewUpdated',
        shoppingList,
    });

    await keyVal.set('shoppingList', shoppingList);
}
