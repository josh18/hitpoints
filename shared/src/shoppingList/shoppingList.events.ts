import { z, ZodType } from 'zod';

import { HitpointsEvent } from '../event.js';
import { ShoppingListItem } from './shoppingList.types.js';

export const ShoppingListItemsAdded = HitpointsEvent.extend({
    type: z.literal('ShoppingListItemsAdded'),
    items: ShoppingListItem.array(),
    index: z.number().min(0).optional(),
});

export const ShoppingListItemUpdated = HitpointsEvent.extend({
    type: z.literal('ShoppingListItemUpdated'),
    item: ShoppingListItem,
});

export const ShoppingListItemsRemoved = HitpointsEvent.extend({
    type: z.literal('ShoppingListItemsRemoved'),
    itemIds: z.string().uuid().array(),
});

export const ShoppingListItemsChecked = HitpointsEvent.extend({
    type: z.literal('ShoppingListItemsChecked'),
    itemIds: z.string().uuid().array(),
});

export const ShoppingListItemsUnchecked = HitpointsEvent.extend({
    type: z.literal('ShoppingListItemsUnchecked'),
    itemIds: z.string().uuid().array(),
});

export const ShoppingListItemMoved = HitpointsEvent.extend({
    type: z.literal('ShoppingListItemMoved'),
    itemId: z.string().uuid(),
    index: z.number().min(0),
});

export type ShoppingListItemsAdded = z.infer<typeof ShoppingListItemsAdded>;
export type ShoppingListItemUpdated = z.infer<typeof ShoppingListItemUpdated>;
export type ShoppingListItemsRemoved = z.infer<typeof ShoppingListItemsRemoved>;
export type ShoppingListItemsChecked = z.infer<typeof ShoppingListItemsChecked>;
export type ShoppingListItemsUnchecked = z.infer<typeof ShoppingListItemsUnchecked>;
export type ShoppingListItemMoved = z.infer<typeof ShoppingListItemMoved>;

export type ShoppingListEvent =
    ShoppingListItemsAdded |
    ShoppingListItemUpdated |
    ShoppingListItemsRemoved |
    ShoppingListItemsChecked |
    ShoppingListItemsUnchecked |
    ShoppingListItemMoved;

export const shoppingListTypeMap: {
    [key in ShoppingListEvent['type']]: ZodType<ShoppingListEvent>;
} = {
    ShoppingListItemsAdded,
    ShoppingListItemUpdated,
    ShoppingListItemsRemoved,
    ShoppingListItemsChecked,
    ShoppingListItemsUnchecked,
    ShoppingListItemMoved,
};

const shoppingListEventTypes = Object.keys(shoppingListTypeMap);

export function isShoppingListEvent<Event extends { type: string; }>(event: Event | ShoppingListEvent): event is ShoppingListEvent {
    return shoppingListEventTypes.includes(event.type);
}
