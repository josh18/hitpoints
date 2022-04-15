import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { pinnedRecipesId, Recipe } from '@hitpoints/shared';

import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Menu, MenuItem } from '../../../components/menu';
import { TransitionHeight } from '../../../components/transitionHeight';
import { DeleteIcon } from '../../../icons/deleteIcon';
import { ShoppingIcon } from '../../../icons/shoppingIcon';
import { useDispatch } from '../../../util/useDispatch';
import { useSelector } from '../../../util/useSelector';
import { uuid } from '../../../util/uuid';
import { AddToShoppingList } from '../addToShoppingList';
import { RecipeImage } from '../recipeImage';

const Container = styled(Card)`
    grid-area: PinnedRecipes;
    padding: 8px;
`;

const Heading = styled.h2`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
`;

const Item = styled(Link)`
    position: relative;
    display: flex;
    align-items: center;
    color: inherit;
    padding: 8px;
    border-radius: 2px;
    background-color: #fcfdfe;

    &::before,
    &::after {
        content: '';
        position: absolute;
        display: block;
        opacity: 0;
    }

    &::before {
        inset: 0;
        background-color: #8f633d;
    }

    &::after {
        top: 0;
        bottom: 0;
        left: 0;
        width: 2px;
        background-color: ${props => props.theme.primary};
    }

    &:hover::before,
    &:focus-visible::before {
        opacity: 0.08;
    }

    &:focus-visible::after {
        opacity: 1;
    }
`;

const DragShadow = styled.div<{ isDragging: boolean; }>`
    position: absolute;
    inset: 0;
    border-radius: 2px;
    transition: ${props => props.theme.transition('box-shadow')};

    ${props => props.isDragging && css`
        box-shadow: ${props => props.theme.highShadow};
    `}
`;

const Image = styled(RecipeImage)`
    margin-right: 8px;
`;

const Name = styled.div`
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const NoPinned = styled.div`
    padding: 8px;
`;

const RemoveIndicator = styled.div<{ active?: boolean }>`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.white};
    background-color: ${props => rgba(props.theme.error, 0.8)};
    border-radius: 2px;
    opacity: 0;
    pointer-events: none;
    transition: ${props => props.theme.transition('opacity')};

    ${props => props.active && css`
        opacity: 1;
    `}
`;

interface PinnedVisible {
    recipe: Recipe;
    visible: boolean;
    initial: boolean;
}

export function PinnedRecipes() {
    const dispatch = useDispatch();
    const pinnedRecipes = useSelector(state => state.pinnedRecipes);
    const isFirstRender = useRef(true);
    const visible = useRef<PinnedVisible[]>([]);
    const [_visibleCount, setVisibleCount] = useState(0);
    const [addToShoppingListActive, setAddToShoppingListActive] = useState(false);

    const recipes = pinnedRecipes.ids.reduce<PinnedVisible[]>((recipes, id) => {
        const recipe = pinnedRecipes.recipes[id];
        if (recipe) {
            recipes.push({
                recipe,
                visible: true,
                initial: isFirstRender.current,
            });
        }

        return recipes;
    }, []);

    visible.current.forEach(({ recipe }, i) => {
        if (!pinnedRecipes.ids.includes(recipe.id)) {
            recipes.splice(i, 0, {
                recipe,
                visible: false,
                initial: false,
            });
        }
    });

    useEffect(() => {
        setVisibleCount(recipes.length);
    }, [recipes.length]);

    if (!pinnedRecipes.loaded) {
        return null;
    }

    isFirstRender.current = false;
    visible.current = recipes;

    const onExit = (id: string) => {
        visible.current = visible.current.filter(({ recipe }) => recipe.id !== id);
        setVisibleCount(visible.current.length);
    };

    const onDragEnd = (result: DropResult) => {
        if (result.reason === 'CANCEL') {
            return;
        }

        if (result.destination) {
            dispatch({
                type: 'PinnedRecipeMoved',
                id: uuid(),
                entityId: pinnedRecipesId,
                timestamp: new Date().toISOString(),
                recipeId: result.draggableId,
                index: result.destination.index,
            });
        } else {
            dispatch({
                type: 'RecipeUnpinned',
                id: uuid(),
                entityId: pinnedRecipesId,
                timestamp: new Date().toISOString(),
                recipeId: result.draggableId,
            });
        }
    };

    const items = recipes.map(({ recipe: { id, imageId, name }, visible, initial }, index) => (
        <Draggable key={id} draggableId={id} index={index}>
            {({ draggableProps, dragHandleProps, innerRef }, { isDragging, isDropAnimating, draggingOver }) => (
                <TransitionHeight
                    key={id}
                    visible={visible}
                    onExit={() => onExit(id)}
                    transitionOnMount={!initial}
                >
                    <Item to={id} {...draggableProps} {...dragHandleProps} ref={innerRef}>
                        <DragShadow isDragging={isDragging && !isDropAnimating} />
                        <Image imageId={imageId} small />
                        <Name>{name}</Name>
                        <RemoveIndicator active={isDragging && !draggingOver && !isDropAnimating}>
                            <DeleteIcon /> Remove
                        </RemoveIndicator>
                    </Item>
                </TransitionHeight>
            )}
        </Draggable>
    ));

    const menuItems: MenuItem[] = [
        {
            name: 'Add to shopping list',
            icon: <ShoppingIcon />,
            action: () => setAddToShoppingListActive(true),
        },
    ];

    return (
        <Container>
            <Heading>Pinned <Menu items={menuItems} small /></Heading>
            {items.length ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="pinnedRecipes">
                        {({ droppableProps, innerRef, placeholder }) => {
                        return (
                            <div {...droppableProps} ref={innerRef}>
                                {items}
                                {placeholder}
                            </div>
                        );}}
                    </Droppable>
                </DragDropContext>
            ) : <NoPinned>No pinned recipes</NoPinned>}

        <Dialog active={addToShoppingListActive} onClose={() => setAddToShoppingListActive(false)}>
            <AddToShoppingList recipes={Object.values(pinnedRecipes.recipes)} onClose={() => setAddToShoppingListActive(false)} />
        </Dialog>
        </Container>
    );
}
