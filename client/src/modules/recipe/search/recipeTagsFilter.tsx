import { useState } from 'react';
import styled from 'styled-components';

import { RecipeTag, recipeTags } from '@hitpoints/shared';

import { Checkbox } from '../../../components/checkbox';

const CheckboxStyled = styled(Checkbox)`
    & + & {
        margin-top: 8px;
    }
`;

export interface RecipeTagsFilterProps {
    onFilter(tags: RecipeTag[]): void;
}

export function RecipeTagsFilter({ onFilter }: RecipeTagsFilterProps) {
    const [tags, setTags] = useState<Set<RecipeTag>>(new Set());

    const toggle = (tag: RecipeTag, selected: boolean) => {
        if (selected) {
            tags.add(tag);
        } else {
            tags.delete(tag);
        }

        setTags(tags);
        onFilter([...tags]);
    };

    return (
        <>
            {recipeTags.map(tag =>
                <CheckboxStyled
                    key={tag}
                    name={tag}
                    value={tags.has(tag)}
                    commit={selected => toggle(tag, selected)}
                />,
            )}
        </>
    );
}
