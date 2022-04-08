import { rgba } from 'polished';
import styled from 'styled-components';

import { Recipe } from '@hitpoints/shared';

import { Menu, MenuItem } from '../../../components/menu';
import { BookmarkIcon } from '../../../icons/bookmarkIcon';
import { DeleteIcon } from '../../../icons/deleteIcon';
import { usePinnedRecipe } from '../hooks/usePinRecipe';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';

const Container = styled.div`
    margin-left: 8px;
`;

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

    const deleteRecipe = () => {
        updateRecipe({
            type: 'RecipeDeleted',
        });
    };

    const items: MenuItem[] = [
        {
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
        <Container>
            <Menu items={items} />
        </Container>
    );
}
