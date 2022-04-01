import { z } from 'zod';

export const ShoppingListItem = z.object({
    id: z.string().uuid(),
    name: z.string(),
});

export type ShoppingListItem = z.infer<typeof ShoppingListItem>;
