import { ShoppingListItem } from './shoppingList.types';

export interface ShoppingList {
    items: ShoppingListItem[];
    checked: ShoppingListItem[];
}
