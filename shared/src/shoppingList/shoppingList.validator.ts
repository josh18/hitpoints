import { EventValidator } from '../event';
import { isShoppingListEvent, ShoppingListEvent, shoppingListTypeMap } from './shoppingList.events.js';

interface ValidationState {
    itemIds: Set<string>;
    checkedIds: Set<string>;
}

export const shoppingListValidator: EventValidator<ShoppingListEvent, ValidationState> = {
    entityType: 'shoppinList',
    eventSchema(type) {
        return shoppingListTypeMap[type];
    },
    matches(event) {
        return isShoppingListEvent(event);
    },
    initialState() {
        return {
            itemIds: new Set(),
            checkedIds: new Set(),
        };
    },
    reducer(state, event) {
        switch (event.type) {
            case 'ShoppingListItemsAdded': {
                event.items.forEach(item => {
                    if (state.itemIds.has(item.id)) {
                        throw new Error(`Shopping list already has item ${item.id}.`);
                    }

                    state.itemIds.add(item.id);
                });

                if (event.index !== undefined && event.index > state.itemIds.size) {
                    throw new Error(`Invalid item index ${event.index}.`);
                }

                break;
            }
            case 'ShoppingListItemUpdated': {
                if (!state.itemIds.has(event.item.id)) {
                    throw new Error(`Shopping list doesn't have item ${event.item.id}.`);
                }

                break;
            }
            case 'ShoppingListItemsRemoved': {
                event.itemIds.forEach(itemId => {
                    if (!state.itemIds.has(itemId)) {
                        throw new Error(`Shopping list doesn't have item ${itemId}.`);
                    }

                    state.itemIds.delete(itemId);
                });
                break;
            }
            case 'ShoppingListItemsChecked': {
                event.itemIds.forEach(itemId => {
                    if (!state.itemIds.has(itemId)) {
                        throw new Error(`Shopping list doesn't have item ${itemId}.`);
                    }

                    if (state.checkedIds.has(itemId)) {
                        throw new Error(`Shopping list item ${itemId} is already checked.`);
                    }

                    state.checkedIds.add(itemId);
                });
                break;
            }
            case 'ShoppingListItemsUnchecked': {
                event.itemIds.forEach(itemId => {
                    if (!state.itemIds.has(itemId)) {
                        throw new Error(`Shopping list doesn't have item ${itemId}.`);
                    }

                    if (!state.checkedIds.has(itemId)) {
                        throw new Error(`Shopping list item ${itemId} isn't checked.`);
                    }

                    state.checkedIds.delete(itemId);
                });
                break;
            }
            case 'ShoppingListItemMoved': {
                if (!state.itemIds.has(event.itemId)) {
                    throw new Error(`Shopping list doesn't have item ${event.itemId}.`);
                }

                if (event.index > state.itemIds.size) {
                    throw new Error(`Invalid item index ${event.index}.`);
                }
                break;
            }
        }

        return state;
    },
};
