import styled from '@emotion/styled';

import { RecipeTag, recipeTags } from '@hitpoints/shared';

import { Checkbox } from '../../../components/checkbox';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';

const CheckboxStyled = styled(Checkbox)`
    & + & {
        margin-top: 8px;
    }
`;

export interface RecipeTagsEditorProps {
    tags: RecipeTag[];
}

export function RecipeTagsEditor({ tags }: RecipeTagsEditorProps) {
    const updateRecipe = useUpdateRecipe();

    const toggle = (tag: RecipeTag, selected: boolean) => {
        if (selected) {
            updateRecipe({
                type: 'RecipeTagAdded',
                tag,
            });
        } else {
            updateRecipe({
                type: 'RecipeTagRemoved',
                tag,
            });
        }
    };

    return (
        <>
            {recipeTags.map(tag =>
                <CheckboxStyled
                    key={tag}
                    name={tag}
                    value={tags.includes(tag)}
                    commit={selected => toggle(tag, selected)}
                />,
            )}
        </>
    );
}
