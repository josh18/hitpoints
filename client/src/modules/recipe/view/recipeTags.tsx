import styled from '@emotion/styled';
import { rgba } from 'polished';

import { RecipeTag } from '@hitpoints/shared';

const Tags = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;

    @media print {
        &:empty {
            // Chrome bug https://bugs.chromium.org/p/chromium/issues/detail?id=1161709
            display: none;
        }
    }
`;

const Tag = styled.div`
    padding: 4px 8px;
    background-color: ${rgba('#000', 0.16)};
    border-radius: 2px;
    font-weight: 600;
`;

export interface RecipeTagsProps {
    tags: RecipeTag[];
}

export function RecipeTags({ tags }: RecipeTagsProps) {
    return (
        <Tags>
            {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </Tags>
    );
}
