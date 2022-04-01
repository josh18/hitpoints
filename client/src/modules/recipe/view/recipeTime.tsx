import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { NumberInput } from '../../../components/numberInput';
import { TimeIcon } from '../../../icons/timeIcon';
import { useTransitionResize } from '../../../util/useTransitionResize';
import { useUpdateRecipe } from '../hooks/use-update-recipe';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    position: relative;
    align-self: start;
    transition: ${props => props.theme.transition('height', 'width')};
    overflow: hidden;
    padding-bottom: 2px;

    &::before {
        content: '';
        position: absolute;
        z-index: -1;
        top: 12px;
        left: 0;
        bottom: 0;
        right: 0;
        border: 2px solid ${rgba('#000', 0.87)};
        border-radius: 8px;
        clip-path: polygon(
            0 0,
            calc(50% - 14px) 0,
            calc(50% - 14px) 3px,
            calc(50% + 14px) 3px,
            calc(50% + 14px) 0,
            100% 0,
            100% 100%,
            0 100%
        );
    }
`;

const Content = styled.div`
    display: grid;
    grid-template-columns: auto 48px;
    grid-auto-rows: 28px;
    grid-gap: 4px 8px;
    align-items: center;
    padding: 8px;
`;

const TimeIconStyled = styled(TimeIcon)`
    align-self: center;
`;

const NumberInputStyled = styled(NumberInput)`
    width: 48px;
    padding: 4px;
    margin-left: -4px;
`;

const Label = styled.div`
    font-weight: 600;
    text-align: right;
`;

const Minutes = styled.span`
    margin-top: 8px;
    text-align: center;
    font-size: 12px;
    font-weight: 300;
    font-style: italic;
`;

interface RecipeTimeProps {
    cookTime?: number;
    prepTime?: number;
    editing: boolean;
}

export function RecipeTime({ cookTime, prepTime, editing: editingProp }: RecipeTimeProps) {
    const [editing, setEditing] = useState(editingProp);
    const updateRecipe = useUpdateRecipe();
    const ref = useRef<HTMLDivElement>(null);
    const resize = useTransitionResize(ref);

    useEffect(() => {
        resize();
        setEditing(editingProp);
    }, [resize, editingProp]);

    const setCookTime = (time?: number) => {
        updateRecipe({
            type: 'RecipeCookTimeSet',
            time,
        });
    };

    const setPrepTime = (time?: number) => {
        updateRecipe({
            type: 'RecipePrepTimeSet',
            time,
        });
    };

    let cook;
    let prep;
    if (editing) {
        cook = <NumberInputStyled onCommit={setCookTime} value={cookTime} />;
        prep = <NumberInputStyled onCommit={setPrepTime} value={prepTime} />;
    } else {
        cook = cookTime;
        prep = prepTime;
    }

    return (
        <Container ref={ref}>
            <TimeIconStyled />

            <Minutes>(minutes)</Minutes>

            <Content>
                <Label>Prep</Label> <div>{prep}</div>
                <Label>Cook</Label> <div>{cook}</div>
            </Content>
        </Container>
    );
}
