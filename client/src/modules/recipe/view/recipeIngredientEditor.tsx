import { forwardRef, KeyboardEvent } from 'react';

import { ingredientToString, RecipeIngredient, RecipeIngredientUpdated, stringToIngredient } from '@hitpoints/shared';

import { TextInput } from '../../../components/textInput';
import { PartialRecipeEvent } from '../hooks/useUpdateRecipe';

export interface RecipeIngredientProps {
    ingredient: RecipeIngredient;
    updateIngredient: (event: PartialRecipeEvent<RecipeIngredientUpdated>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onEnter: () => void;
}

export const RecipeIngredientEditor = forwardRef<HTMLTextAreaElement, RecipeIngredientProps>(({ ingredient, updateIngredient, ...props }, ref) => {
    const onCommit = (next: string) => {
        const nextIngredient = stringToIngredient(next);

        updateIngredient({
            type: 'RecipeIngredientUpdated',
            itemId: ingredient.id,
            ...nextIngredient,
        });

        return ingredientToString(nextIngredient);
    };

    return <TextInput ref={ref} value={ingredientToString(ingredient)} onCommit={onCommit} preventExit {...props} />;
});

RecipeIngredientEditor.displayName = 'RecipeIngredientEditor';
