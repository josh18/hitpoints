import { z } from 'zod';

export const recipeMeasurements = [
    'Teaspoon',
    'Tablespoon',
    'Cup',
    'Millilitre',
    'Litre',
    'Gram',
] as const;

export type RecipeMeasurement = typeof recipeMeasurements[number];

export const recipeTags = [
    'Baking',
    'Bread',
    'Breakfast',
    'Main',
    'Pasta',
    'Pudding',
    'Salad',
    'Side',
    'Soup',
    'Vegetarian',
] as const;

export type RecipeTag = typeof recipeTags[number];

export const RecipeIngredient = z.object({
    type: z.literal('Ingredient'),
    id: z.string().uuid(),
    name: z.string().optional(),
    amount: z.string().optional(),
    measurement: z.enum(recipeMeasurements).optional(),
});

export const RecipeInstructionText = z.object({
    text: z.string(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
});

export const RecipeInstructionAt = z.object({
    at: z.string().uuid(),
});

export const RecipeInstruction = z.union([RecipeInstructionText, RecipeInstructionAt]).array();

export type RecipeIngredient = z.infer<typeof RecipeIngredient>;
export type RecipeInstructionText = z.infer<typeof RecipeInstructionText>;
export type RecipeInstructionAt = z.infer<typeof RecipeInstructionAt>;
export type RecipeInstruction = z.infer<typeof RecipeInstruction>;

export function isInstructionText(content: RecipeInstructionText | RecipeInstructionAt): content is RecipeInstructionText {
    return (content as RecipeInstructionText).text !== undefined;
}
