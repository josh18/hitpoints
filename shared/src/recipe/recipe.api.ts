import { RecipeEvent } from './recipe.events.js';

export interface ImportRecipeRequest {
    url: string;
}

export interface ImportRecipeResponse {
    id: string;
    event: RecipeEvent;
}

export interface RecipeApi {
    importRecipe: {
        request: ImportRecipeRequest;
        response: ImportRecipeResponse;
    };
}
