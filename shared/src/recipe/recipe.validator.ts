import { EventValidator } from '../event';
import { isRecipeEvent, RecipeEvent, recipeTypeMap } from './recipe.events.js';

interface ValidationState {
    isCreated: boolean;
    ingredients: Map<string, string>;
    tags: Set<string>;
    deleted: boolean;
    pinned: boolean;
}

export const recipeValidator: EventValidator<RecipeEvent, ValidationState> = {
    entityType: 'recipe',
    eventSchema(type) {
        return recipeTypeMap[type];
    },
    matches(event) {
        return isRecipeEvent(event);
    },
    initialState() {
        return {
            isCreated: false,
            ingredients: new Map(),
            tags: new Set(),
            deleted: false,
            pinned: false,
        };
    },
    reducer(state, event) {
        if (event.type === 'RecipeCreated') {
            if (state.isCreated) {
                throw new Error('Recipe has already been created.');
            }

            state.isCreated = true;

            return state;
        } else if (event.type === 'RecipeImported') {
            if (state.isCreated) {
                throw new Error('Recipe has already been created.');
            }

            state.isCreated = true;
            event.ingredients.forEach(ingredient => state.ingredients.set(ingredient.id, ingredient.type));

            return state;
        }

        if (!state.isCreated) {
            throw new Error(`Recipe hasn't been created.`);
        }

        switch (event.type) {
            case 'RecipeIngredientItemAdded': {
                if (state.ingredients.has(event.itemId)) {
                    throw new Error(`Recipe already has ingredient ${event.itemId}.`);
                }

                if (event.index !== undefined && event.index > state.ingredients.size) {
                    throw new Error(`Invalid ingredient index ${event.index}.`);
                }

                state.ingredients.set(event.itemId, event.itemType);
                break;
            }
            case 'RecipeIngredientItemMoved': {
                if (!state.ingredients.has(event.itemId)) {
                    throw new Error(`Recipe doesn't have ingredient ${event.itemId}.`);
                }

                if (event.index > state.ingredients.size) {
                    throw new Error(`Invalid ingredient index ${event.index}.`);
                }
                break;
            }
            case 'RecipeIngredientItemRemoved':
                if (!state.ingredients.has(event.itemId)) {
                    throw new Error(`Recipe doesn't have ingredient ${event.itemId}.`);
                }

                state.ingredients.delete(event.itemId);
                break;
            case 'RecipeIngredientHeadingUpdated':
            case 'RecipeIngredientUpdated': {
                const type = state.ingredients.get(event.itemId);

                if (!type) {
                    throw new Error(`Recipe doesn't have ingredient ${event.itemId}.`);
                }

                if (event.type === 'RecipeIngredientHeadingUpdated' && type !== 'Heading') {
                    throw new Error(`Recipe ingredient ${event.itemId} is a heading, not an ingredient.`);
                }

                if (event.type === 'RecipeIngredientUpdated' && type !== 'Ingredient') {
                    throw new Error(`Recipe ingredient ${event.itemId} is an ingredient, not a heading.`);
                }
                break;
            }
            case 'RecipeTagAdded':
                if (state.tags.has(event.tag)) {
                    throw new Error(`Recipe already has tag ${event.tag}.`);
                }

                state.tags.add(event.tag);
                break;
            case 'RecipeTagRemoved':
                if (!state.tags.has(event.tag)) {
                    throw new Error(`Recipe doesn't have tag ${event.tag}.`);
                }

                state.tags.delete(event.tag);
                break;
            case 'RecipeDeleted':
                if (state.deleted) {
                    throw new Error(`Recipe has already been deleted.`);
                }

                state.deleted = true;
                break;
            case 'RecipeRestored':
                if (!state.deleted) {
                    throw new Error(`Recipe has not been deleted.`);
                }

                state.deleted = false;
                break;
        }

        return state;
    },
};
