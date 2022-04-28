import { orderEvents } from '../util/orderEvents.js';
import { RecipeEvent } from './recipe.events.js';
import { RecipeIngredient } from './recipe.types.js';
import { Recipe, RecipeIngredientHeading } from './recipe.view.js';

export const initialRecipeState = (): Recipe => ({
    id: '',
    name: '',
    ingredients: [],
    instructions: [],
    version: 0,
    createdOn: '',
    updatedOn: '',
    completedCount: 0,
    tags: [],
    deleted: false,
});

export function recipeReducer(view = initialRecipeState(), event: RecipeEvent): Recipe {
    view.version++;
    view.updatedOn = event.timestamp;

    switch (event.type) {
        case 'RecipeCreated':
            view.id = event.entityId;
            view.createdOn = event.timestamp;
            break;
        case 'RecipeImported':
            view.id = event.entityId;
            view.createdOn = event.timestamp;
            view.name = event.name;
            view.ingredients = event.ingredients;
            view.instructions = event.instructions;
            view.cookTime = event.cookTime;
            view.prepTime = event.prepTime;
            view.imageId = event.imageId;
            view.source = event.source;
            view.tags = event.tags ?? [];
            break;
        case 'RecipeImageSet':
            view.imageId = event.imageId;
            break;
        case 'RecipeNameSet':
            view.name = event.name;
            break;
        case 'RecipeIngredientItemAdded': {
            const index = event.index ?? view.ingredients.length;

            if (event.itemType === 'Heading') {
                view.ingredients.splice(index, 0, {
                    id: event.itemId,
                    name: '',
                    type: 'Heading',
                });
            } else {
                view.ingredients.splice(index, 0, {
                    id: event.itemId,
                    type: 'Ingredient',
                });
            }
            break;
        }
        case 'RecipeIngredientItemMoved': {
            const previousIndex = view.ingredients.findIndex(({ id }) => id === event.itemId);

            const [item] = view.ingredients.splice(previousIndex, 1);
            view.ingredients.splice(event.index, 0, item);
            break;
        }
        case 'RecipeIngredientItemRemoved':
            view.ingredients = view.ingredients.filter(({ id }) => id !== event.itemId);
            break;
        case 'RecipeIngredientUpdated': {
            const ingredient = view.ingredients.find(({ id }) => id === event.itemId) as RecipeIngredient;
            ingredient.name = event.name;
            ingredient.amount = event.amount;
            ingredient.measurement = event.measurement;
            break;
        }
        case 'RecipeIngredientHeadingUpdated': {
            const ingredient = view.ingredients.find(({ id }) => id === event.itemId) as RecipeIngredientHeading;
            ingredient.name = event.name;
            break;
        }
        case 'RecipeInstructionsSet':
            view.instructions = event.instructions;
            break;
        case 'RecipeCookTimeSet':
            view.cookTime = event.time;
            break;
        case 'RecipePrepTimeSet':
            view.prepTime = event.time;
            break;
        case 'RecipeCompleted':
            view.completedCount++;
            view.completedOn = event.timestamp;
            break;
        case 'RecipeTagAdded':
            if (!view.tags.includes(event.tag)) {
                view.tags.push(event.tag);
                view.tags.sort();
            }
            break;
        case 'RecipeTagRemoved':
            view.tags = view.tags.filter(tag => tag !== event.tag);
            break;
        case 'RecipeDeleted':
            view.deleted = true;
            break;
        case 'RecipeRestored':
            view.deleted = false;
            break;
    }

    return view;
}

export function buildRecipe(events: RecipeEvent[]) {
    events = [...events].sort(orderEvents);

    return events.reduce(recipeReducer, initialRecipeState());
}
