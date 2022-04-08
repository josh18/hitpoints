import { EventApi } from './event.api.js';
import { EventValidator, HitpointsEvent } from './event.js';
import { isPinnedRecipesEvent } from './pinnedRecipes/pinnedRecipes.events.js';
import { pinnedRecipesValidator } from './pinnedRecipes/pinnedRecipes.validator.js';
import { RecipeApi } from './recipe/recipe.api.js';
import { isRecipeEvent } from './recipe/recipe.events.js';
import { recipeValidator } from './recipe/recipe.validator.js';
import { isShoppingListEvent } from './shoppingList/shoppingList.events.js';
import { shoppingListValidator } from './shoppingList/shoppingList.validator.js';

export * from './event.js';
export * from './event.api.js';

export * from './pinnedRecipes/pinnedRecipes.events.js';
export * from './pinnedRecipes/pinnedRecipes.reducer.js';
export * from './pinnedRecipes/pinnedRecipes.validator.js';
export * from './pinnedRecipes/pinnedRecipes.view.js';

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

export const pinnedRecipesId = '375539e6-fd51-48c1-8d61-c47cdc3645d4';
export const shoppingListId = '3b7f2231-b3ca-40d0-adcc-4b495025b490';

export const eventValidators: EventValidator[] = [
    pinnedRecipesValidator,
    shoppingListValidator,
    recipeValidator,
];

export function isHitpointsEvent(event: { type: string }): event is HitpointsEvent {
    return isPinnedRecipesEvent(event) || isRecipeEvent(event) || isShoppingListEvent(event);
}

export type HitpointsEntityType = 'pinnedRecipes' | 'recipe' | 'shoppingList';

export function eventEntityType(event: HitpointsEvent): HitpointsEntityType {
    if (isPinnedRecipesEvent(event)) {
        return 'pinnedRecipes';
    }

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
