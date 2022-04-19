import { rgba } from 'polished';
import { useState } from 'react';
import styled from 'styled-components';

import { Recipe } from '@hitpoints/shared';

import { Dialog } from '../../../components/dialog';
import { Menu, MenuItem } from '../../../components/menu';
import { BookmarkIcon } from '../../../icons/bookmarkIcon';
import { DeleteIcon } from '../../../icons/deleteIcon';
import { ShoppingIcon } from '../../../icons/shoppingIcon';
import { AddToShoppingList } from '../addToShoppingList';
import { usePinnedRecipe } from '../hooks/usePinRecipe';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';

const BookmarkFilled = styled(BookmarkIcon)`
    path:first-child {
        fill: ${rgba('#000', 0.2)};
    }
`;

interface RecipeMenuProps {
    recipe: Recipe;
}

export function RecipeMenu({ recipe }: RecipeMenuProps) {
    const updateRecipe = useUpdateRecipe();
    const { pinned, togglePinnedRecipe } = usePinnedRecipe(recipe.id);
    const [addToShoppingListActive, setAddToShoppingListActive] = useState(false);

    const deleteRecipe = () => {
        updateRecipe({
            type: 'RecipeDeleted',
        });
    };

    const items: MenuItem[] = [
        {
            name: 'Add to shopping list',
            icon: <ShoppingIcon />,
            action: () => setAddToShoppingListActive(true),
        }, {
            name: pinned ? 'Unpin Recipe' : 'Pin Recipe',
            icon: pinned ? <BookmarkFilled /> : <BookmarkIcon />,
            action: togglePinnedRecipe,
        }, {
            name: 'Delete',
            icon: <DeleteIcon />,
            action: deleteRecipe,
        },
    ];

    return (
        <>
            <Menu items={items} />

            <Dialog active={addToShoppingListActive} onClose={() => setAddToShoppingListActive(false)}>
                <AddToShoppingList recipes={[recipe]} onClose={() => setAddToShoppingListActive(false)} />
            </Dialog>
        </>
    );
}
