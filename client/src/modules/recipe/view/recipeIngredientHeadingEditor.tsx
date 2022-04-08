import { forwardRef, KeyboardEvent } from 'react';

import { RecipeIngredientHeading, RecipeIngredientHeadingUpdated } from '@hitpoints/shared';

import { TextInput } from '../../../components/textInput';
import { PartialRecipeEvent } from '../hooks/useUpdateRecipe';

export interface RecipeIngredientHeadingProps {
    heading: RecipeIngredientHeading;
    updateIngredient: (event: PartialRecipeEvent<RecipeIngredientHeadingUpdated>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onEnter: () => void;
}

export const RecipeIngredientHeadingEditor = forwardRef<HTMLTextAreaElement, RecipeIngredientHeadingProps>(({ heading, updateIngredient, ...props }, ref) => {
    const commit = (next: string) => {
        const name = next.trim();

        updateIngredient({
            type: 'RecipeIngredientHeadingUpdated',
            itemId: heading.id,
            name,
        });

        return name;
    };

    return <TextInput ref={ref} value={heading.name} onCommit={commit} preventExit {...props} />;
});

RecipeIngredientHeadingEditor.displayName = 'RecipeIngredientHeadingEditor';
