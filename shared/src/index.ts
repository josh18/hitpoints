import { EventApi } from './event.api.js';
import { HitpointsEvent } from './event.js';
import { RecipeApi } from './recipe/recipe.api.js';
import { isRecipeEvent } from './recipe/recipe.events.js';
import { isShoppingListEvent } from './shoppingList/shoppingList.events.js';

export * from './event.js';
export * from './event.api.js';

export * from './recipe/ingredientUtils.js';
export * from './recipe/recipe.api.js';
export * from './recipe/recipe.events.js';
export * from './recipe/recipe.reducer.js';
export * from './recipe/recipe.types.js';
export * from './recipe/recipe.validator.js';
export * from './recipe/recipe.view.js';

export * from './shoppingList/shoppingList.events.js';
export * from './shoppingList/shoppingList.reducer.js';
export * from './shoppingList/shoppingList.types.js';
export * from './shoppingList/shoppingList.validator.js';
export * from './shoppingList/shoppingList.view.js';

export * from './validation/iso8601.js';
export * from './validation/json.js';

export const shoppingListId = '3b7f2231-b3ca-40d0-adcc-4b495025b490';

export function isHitpointsEvent(event: { type: string }): event is HitpointsEvent {
    return isRecipeEvent(event) || isShoppingListEvent(event);
}

export type HitpointsEntityType = 'recipe' | 'shoppingList';

export function eventEntityType(event: HitpointsEvent): HitpointsEntityType {
    if (isRecipeEvent(event)) {
        return 'recipe';
    }

    if (isShoppingListEvent(event)) {
        return 'shoppingList';
    }

    throw new Error(`Unknown event type ${event.type}`);
}

export interface PingApi {
    ping: {
        request: undefined;
        response: string;
    };
}

export interface ApiSchema extends EventApi, PingApi, RecipeApi { }
