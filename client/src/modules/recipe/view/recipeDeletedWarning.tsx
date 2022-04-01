import { rgba } from 'polished';
import styled from 'styled-components';

import { TextButton } from '../../../components/button';
import { WarningIcon } from '../../../icons/warningIcon';
import { useUpdateRecipe } from '../hooks/use-update-recipe';

const Warning = styled.div`
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: 2px;
    background-color: ${({ theme }) => theme.warning};

    svg {
        margin-left: -4px;
        margin-right: 8px;
        fill: ${rgba('#000', 0.5)};
    }
`;

const RestoreButton = styled(TextButton)`
    margin-left: 12px;
`;

export function RecipeDeletedWarning() {
    const updateRecipe = useUpdateRecipe();

    const restoreRecipe = () => {
        updateRecipe({
            type: 'RecipeRestored',
        });
    };

    return (
        <Warning><WarningIcon />This recipe has been deleted. <RestoreButton onClick={restoreRecipe}>Restore</RestoreButton></Warning>
    );
}
