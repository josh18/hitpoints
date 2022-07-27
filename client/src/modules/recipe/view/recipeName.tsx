import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { TextInput } from '../../../components/textInput';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';

const H1 = styled.h1<{ editing: boolean }>`
    position: relative;
    display: flex;
    flex: 1;
    font-size: 70px;

    @media (max-width: 850px) {
        font-size: 60px;
        text-align: center;
    }
`;

const Name = styled.div<{ empty: boolean }>`
    flex: 1;
    padding: 8px;

    ${({ empty }) => empty && css`
        // Matches placeholder color
        color: rgb(27, 32, 35, 0.5);
    `}
`;

const Input = styled(TextInput)`
    background-color: transparent;
`;

export interface RecipeNameProps {
    editing: boolean;
    name: string;
}

export function RecipeName({ editing, name }: RecipeNameProps) {
    const updateRecipe = useUpdateRecipe();

    const commit = (next: string) => {
        updateRecipe({
            type: 'RecipeNameSet',
            name: next,
        });
    };

    const defaultName = 'Untitled Recipe';

    let component;
    if (editing) {
        component = <Input value={name} onCommit={commit} placeholder={defaultName} />;
    } else {
        component = <Name empty={!name}>{name || defaultName}</Name>;
    }

    return (
        <H1 editing={editing} >
            {component}
        </H1>
    );
}
