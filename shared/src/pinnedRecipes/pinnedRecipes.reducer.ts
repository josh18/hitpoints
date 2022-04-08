import { orderEvents } from '../util/orderEvents.js';
import { PinnedRecipesEvent } from './pinnedRecipes.events.js';
import { PinnedRecipes } from './pinnedRecipes.view';

export function pinnedRecipesReducer(view: PinnedRecipes = [], event: PinnedRecipesEvent): PinnedRecipes {
    switch (event.type) {
        case 'RecipePinned': {
            view.push(event.recipeId);
            break;
        }
        case 'RecipeUnpinned': {
            view = view.filter(id => id !== event.recipeId);
            break;
        }
        case 'PinnedRecipeMoved': {
            const previousIndex = view.indexOf(event.recipeId);

            const [item] = view.splice(previousIndex, 1);
            view.splice(event.index, 0, item);
            break;
        }
    }

    return view;
}

export function buildPinnedRecipes(events: PinnedRecipesEvent[]) {
    events = [...events].sort(orderEvents);

    return events.reduce(pinnedRecipesReducer, []);
}
