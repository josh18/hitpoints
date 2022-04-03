import { produce } from 'immer';

import { isShoppingListEvent, ShoppingList, ShoppingListEvent, shoppingListReducer } from '@hitpoints/shared';

export interface ShoppingListViewUpdated {
    type: 'ShoppingListViewUpdated';
    shoppingList: ShoppingList;
}

export const activeShoppingListReducer = produce((state: ShoppingList | null, event: ShoppingListViewUpdated | ShoppingListEvent) => {
    switch (event.type) {
        case 'ShoppingListViewUpdated':
            return event.shoppingList;
    }

    if (!isShoppingListEvent(event) || state === null) {
        return state;
    }

    return shoppingListReducer(state, event);
}, null);
