import { produce } from 'immer';

import { isShoppingListEvent, ShoppingList, ShoppingListEvent, shoppingListReducer } from '@hitpoints/shared';

import { ShoppingListViewUpdated } from '../../api/event.middleware';

export const localShoppingListReducer = produce((state: ShoppingList | null, event: ShoppingListViewUpdated | ShoppingListEvent) => {
    switch (event.type) {
        case 'ShoppingListViewUpdated':
            return event.shoppingList;
    }

    if (!isShoppingListEvent(event) || state === null) {
        return state;
    }

    return shoppingListReducer(state, event);
}, null);
