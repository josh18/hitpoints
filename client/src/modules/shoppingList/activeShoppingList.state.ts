import { produce } from 'immer';

import { initialShoppingListState, isShoppingListEvent, ShoppingList, ShoppingListEvent, shoppingListReducer } from '@hitpoints/shared';

export interface ShoppingListViewUpdated {
    type: 'ShoppingListViewUpdated';
    shoppingList: ShoppingList;
}

export const activeShoppingListReducer = produce((state: ShoppingList, event: ShoppingListViewUpdated | ShoppingListEvent) => {
    switch (event.type) {
        case 'ShoppingListViewUpdated':
            return event.shoppingList;
    }

    if (!isShoppingListEvent(event)) {
        return state;
    }

    return shoppingListReducer(state, event);
}, initialShoppingListState());
