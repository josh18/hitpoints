import { EventValidator } from '../event';
import { isPinnedRecipesEvent, PinnedRecipesEvent, pinnedRecipesTypeMap } from './pinnedRecipes.events.js';

export const pinnedRecipesValidator: EventValidator<PinnedRecipesEvent, Set<string>> = {
    entityType: 'pinnedRecipes',
    eventSchema(type) {
        return pinnedRecipesTypeMap[type];
    },
    matches(event) {
        return isPinnedRecipesEvent(event);
    },
    initialState() {
        return new Set();
    },
    reducer(state, event) {
        switch (event.type) {
            case 'RecipePinned': {
                if (state.has(event.recipeId)) {
                    throw new Error(`Recipe ${event.recipeId} is already pinned`);
                }
                state.add(event.recipeId);

                break;
            }
            case 'RecipeUnpinned': {
                if (!state.has(event.recipeId)) {
                    throw new Error(`Recipe ${event.recipeId} is not pinned`);
                }

                state.delete(event.recipeId);

                break;
            }
            case 'PinnedRecipeMoved': {
                if (!state.has(event.recipeId)) {
                    throw new Error(`Recipe ${event.recipeId} is not pinned`);
                }

                if (event.index > state.size) {
                    throw new Error(`Invalid item index ${event.index}.`);
                }

                break;
            }
        }

        return state;
    },
};
