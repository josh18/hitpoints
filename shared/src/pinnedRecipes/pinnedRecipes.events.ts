import { z, ZodType } from 'zod';

import { HitpointsEvent } from '../event.js';

const RecipePinned = HitpointsEvent.extend({
    type: z.literal('RecipePinned'),
    recipeId: z.string().uuid(),
});

const RecipeUnpinned = HitpointsEvent.extend({
    type: z.literal('RecipeUnpinned'),
    recipeId: z.string().uuid(),
});

const PinnedRecipeMoved = HitpointsEvent.extend({
    type: z.literal('PinnedRecipeMoved'),
    recipeId: z.string().uuid(),
    index: z.number().min(0),
});

export type RecipePinned = z.infer<typeof RecipePinned>;
export type RecipeUnpinned = z.infer<typeof RecipeUnpinned>;
export type PinnedRecipeMoved = z.infer<typeof PinnedRecipeMoved>;

export type PinnedRecipesEvent =
    RecipePinned |
    RecipeUnpinned |
    PinnedRecipeMoved;

export const pinnedRecipesTypeMap: {
    [key in PinnedRecipesEvent['type']]: ZodType<PinnedRecipesEvent>;
} = {
    RecipePinned,
    RecipeUnpinned,
    PinnedRecipeMoved,
};

const pinnedRecipesEventTypes = Object.keys(pinnedRecipesTypeMap);

export function isPinnedRecipesEvent<Event extends { type: string; }>(event: Event | PinnedRecipesEvent): event is PinnedRecipesEvent {
    return pinnedRecipesEventTypes.includes(event.type);
}
