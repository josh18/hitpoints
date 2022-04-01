import { RecipeIngredient, RecipeInstruction, RecipeTag } from './recipe.types.js';

export interface Recipe {
    id: string;
    name: string;
    version: number;
    ingredients: Array<RecipeIngredientHeading | RecipeIngredient>;
    instructions: RecipeInstruction[];
    imageId?: string;
    createdOn: string;
    updatedOn: string;
    cookTime?: number;
    prepTime?: number;
    completedCount: number;
    completedOn?: string;
    tags: RecipeTag[];
    deleted: boolean;
}

export interface RecipeIngredientHeading {
    type: 'Heading';
    id: string;
    name: string;
}
