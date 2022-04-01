import styled from 'styled-components';

import { Menu, MenuItem } from '../../../components/actionsMenu';
import { DeleteIcon } from '../../../icons/deleteIcon';
import { useUpdateRecipe } from '../hooks/use-update-recipe';

export const Container = styled.div`
    margin-left: 8px;
`;

export function RecipeMenu() {
    const updateRecipe = useUpdateRecipe();

    const deleteRecipe = () => {
        updateRecipe({
            type: 'RecipeDeleted',
        });
    };

    const items: MenuItem[] = [{
        icon: <DeleteIcon />,
        name: 'Delete',
        action: deleteRecipe,
    }];

    return (
        <Container>
            <Menu items={items} />
        </Container>
    );
}
