import { orderEvents } from '../util/orderEvents.js';
import { ShoppingListEvent, ShoppingListItemsChecked } from './shoppingList.events';
import { ShoppingList } from './shoppingList.view';

export const initialShoppingListState = (): ShoppingList => ({
    items: [],
    checked: [],
});

export function shoppingListReducer(view = initialShoppingListState(), event: ShoppingListEvent): ShoppingList {
    switch (event.type) {
        case 'ShoppingListItemsAdded': {
            const index = event.index ?? view.items.length;

            view.items.splice(index, 0, ...event.items);
            break;
        }
        case 'ShoppingListItemUpdated': {
            [...view.items, ...view.checked].forEach(item => {
                if (item.id === event.item.id) {
                    item.name = event.item.name;
                }
            });
            break;
        }
        case 'ShoppingListItemsRemoved': {
            view.items = view.items.filter(item => !event.itemIds.includes(item.id));
            view.checked = view.checked.filter(item => !event.itemIds.includes(item.id));
            break;
        }
        case 'ShoppingListItemsChecked': {
            view.items = view.items.filter(item => {
                if (event.itemIds.includes(item.id)) {
                    view.checked.push(item);
                    return false;
                }

                return true;
            });
            break;
        }
        case 'ShoppingListItemsUnchecked': {
            view.checked = view.checked.filter(item => {
                if (event.itemIds.includes(item.id)) {
                    view.items.push(item);
                    return false;
                }

                return true;
            });
            break;
        }
        case 'ShoppingListItemMoved': {
            const previousIndex = view.items.findIndex(({ id }) => id === event.itemId);

            const [item] = view.items.splice(previousIndex, 1);
            view.items.splice(event.index, 0, item);
            break;
        }
    }

    return view;
}

export function buildShoppingList(events: ShoppingListEvent[]) {
    events = [...events].sort(orderEvents);

    return events.reduce(shoppingListReducer, initialShoppingListState());
}
