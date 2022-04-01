import { z, ZodType } from 'zod';

import { HitpointsEvent } from '../event.js';
import { RecipeIngredient, RecipeInstruction, recipeMeasurements, recipeTags } from './recipe.types.js';

const RecipeCreated = HitpointsEvent.extend({
    type: z.literal('RecipeCreated'),
});

const RecipeImported = HitpointsEvent.extend({
    type: z.literal('RecipeImported'),
    name: z.string(),
    ingredients: RecipeIngredient.array(),
    instructions: RecipeInstruction.array(),
    cookTime: z.number().min(0).optional(),
    prepTime: z.number().min(0).optional(),
    imageId: z.string().uuid().optional(),
    source: z.string(),
});

const RecipeNameSet = HitpointsEvent.extend({
    type: z.literal('RecipeNameSet'),
    name: z.string(),
});

const RecipeImageSet = HitpointsEvent.extend({
    type: z.literal('RecipeImageSet'),
    imageId: z.string().uuid(),
});

const RecipeIngredientItemAdded = HitpointsEvent.extend({
    type: z.literal('RecipeIngredientItemAdded'),
    itemId: z.string().uuid(),
    itemType: z.union([z.literal('Heading'), z.literal('Ingredient')]),
    index: z.number().min(0).optional(),
});

const RecipeIngredientItemMoved = HitpointsEvent.extend({
    type: z.literal('RecipeIngredientItemMoved'),
    itemId: z.string().uuid(),
    index: z.number().min(0),
});

const RecipeIngredientItemRemoved = HitpointsEvent.extend({
    type: z.literal('RecipeIngredientItemRemoved'),
    itemId: z.string().uuid(),
});

const RecipeIngredientUpdated = HitpointsEvent.extend({
    type: z.literal('RecipeIngredientUpdated'),
    itemId: z.string().uuid(),
    id: z.string().uuid(),
    name: z.string().optional(),
    amount: z.string().optional(),
    measurement: z.enum(recipeMeasurements).optional(),
});

const RecipeIngredientHeadingUpdated = HitpointsEvent.extend({
    type: z.literal('RecipeIngredientHeadingUpdated'),
    itemId: z.string().uuid(),
    name: z.string(),
});

const RecipeInstructionsSet = HitpointsEvent.extend({
    type: z.literal('RecipeInstructionsSet'),
    instructions: RecipeInstruction.array(),
});

const RecipeCookTimeSet = HitpointsEvent.extend({
    type: z.literal('RecipeCookTimeSet'),
    time: z.number().min(0).optional(),
});

const RecipePrepTimeSet = HitpointsEvent.extend({
    type: z.literal('RecipePrepTimeSet'),
    time: z.number().min(0).optional(),
});

const RecipeCompleted = HitpointsEvent.extend({
    type: z.literal('RecipeCompleted'),
});

const RecipeTagAdded = HitpointsEvent.extend({
    type: z.literal('RecipeTagAdded'),
    tag: z.enum(recipeTags),
});

const RecipeTagRemoved = HitpointsEvent.extend({
    type: z.literal('RecipeTagRemoved'),
    tag: z.enum(recipeTags),
});

const RecipeDeleted = HitpointsEvent.extend({
    type: z.literal('RecipeDeleted'),
});

const RecipeRestored = HitpointsEvent.extend({
    type: z.literal('RecipeRestored'),
});

export type RecipeCreated = z.infer<typeof RecipeCreated>;
export type RecipeImported = z.infer<typeof RecipeImported>;
export type RecipeNameSet = z.infer<typeof RecipeNameSet>;
export type RecipeImageSet = z.infer<typeof RecipeImageSet>;
export type RecipeIngredientItemAdded = z.infer<typeof RecipeIngredientItemAdded>;
export type RecipeIngredientItemMoved = z.infer<typeof RecipeIngredientItemMoved>;
export type RecipeIngredientItemRemoved = z.infer<typeof RecipeIngredientItemRemoved>;
export type RecipeIngredientUpdated = z.infer<typeof RecipeIngredientUpdated>;
export type RecipeIngredientHeadingUpdated = z.infer<typeof RecipeIngredientHeadingUpdated>;
export type RecipeInstructionsSet = z.infer<typeof RecipeInstructionsSet>;
export type RecipeCookTimeSet = z.infer<typeof RecipeCookTimeSet>;
export type RecipePrepTimeSet = z.infer<typeof RecipePrepTimeSet>;
export type RecipeCompleted = z.infer<typeof RecipeCompleted>;
export type RecipeTagAdded = z.infer<typeof RecipeTagAdded>;
export type RecipeTagRemoved = z.infer<typeof RecipeTagRemoved>;
export type RecipeDeleted = z.infer<typeof RecipeDeleted>;
export type RecipeRestored = z.infer<typeof RecipeRestored>;

export type RecipeEvent =
    RecipeCreated |
    RecipeImported |
    RecipeNameSet |
    RecipeImageSet |
    RecipeIngredientItemAdded |
    RecipeIngredientItemMoved |
    RecipeIngredientItemRemoved |
    RecipeIngredientUpdated |
    RecipeIngredientHeadingUpdated |
    RecipeInstructionsSet |
    RecipeCookTimeSet |
    RecipePrepTimeSet |
    RecipeCompleted |
    RecipeTagAdded |
    RecipeTagRemoved |
    RecipeDeleted |
    RecipeRestored;

export const recipeTypeMap: {
    [key in RecipeEvent['type']]: ZodType<RecipeEvent>;
} = {
    RecipeCreated,
    RecipeImported,
    RecipeNameSet,
    RecipeImageSet,
    RecipeIngredientItemAdded,
    RecipeIngredientItemMoved,
    RecipeIngredientItemRemoved,
    RecipeIngredientUpdated,
    RecipeIngredientHeadingUpdated,
    RecipeInstructionsSet,
    RecipeCookTimeSet,
    RecipePrepTimeSet,
    RecipeCompleted,
    RecipeTagAdded,
    RecipeTagRemoved,
    RecipeDeleted,
    RecipeRestored,
};

const recipeEventTypes = Object.keys(recipeTypeMap);

export function isRecipeEvent<Event extends { type: string; }>(event: Event | RecipeEvent): event is RecipeEvent {
    return recipeEventTypes.includes(event.type);
}
