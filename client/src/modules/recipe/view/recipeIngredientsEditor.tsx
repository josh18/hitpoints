import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';
import { useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

import { Recipe, RecipeIngredientHeadingUpdated, RecipeIngredientItemAdded, RecipeIngredientUpdated, stringToIngredient } from '@hitpoints/shared';

import { Button } from '../../../components/button';
import { RemoveButton } from '../../../components/removeButton';
import { TextInputContainer } from '../../../components/textInput';
import { AddIcon } from '../../../icons/addIcon';
import { DragIcon } from '../../../icons/dragIcon';
import { useInputGroup } from '../../../util/useInputGroup';
import { uuid } from '../../../util/uuid';
import { PartialRecipeEvent, useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { RecipeIngredientEditor } from './recipeIngredientEditor';
import { RecipeIngredientHeadingEditor } from './recipeIngredientHeadingEditor';

interface RecipeIngredientsEditorProps {
    ingredients: Recipe['ingredients'];
}

const Ingredients = styled.div`
    margin-left: -24px;
`;

const IngredientRow = styled.div<{ isHeading: boolean; isDragging: boolean }>`
    position: relative;
    display: flex;
    align-items: center;

    & + & {
        margin-top: 8px;
    }

    ${TextInputContainer} {
        padding-right: 34px;
        margin-right: -28px;
        background-color: #cbcfd2; // Solid color so it works when dragging
        transition: ${props => props.theme.transition('box-shadow')};

        &:hover,
        &:focus {
            background-color: #c1c6c8;
        }
    }

    ${({ isHeading }) => isHeading && css`
        font-weight: 600;

        &::after {
            content: '';
            position: absolute;
            height: 1px;
            right: 0;
            bottom: 0;
            left: 24px;
            background-color: ${rgba('#000', 0.24)};
        }
    `}

    ${props => props.isDragging && css`
        ${TextInputContainer} {
            box-shadow: ${props.theme.highShadow};
        }
    `}
`;

const DragHandle = styled.div<{ isDragging: boolean; isDragActive: boolean }>`
    display: flex;
    color: ${rgba('#000', 0.48)};
    opacity: 0;

    ${IngredientRow}:hover & {
        opacity: 1;
    }

    @media (hover: none) {
        opacity: 1;
    }

    ${({ isDragActive }) => isDragActive && css`
        opacity: 0 !important;
    `}

    ${({ isDragging }) => isDragging && css`
        opacity: 1 !important;
    `}
`;

const RemoveIngredientButton = styled(RemoveButton)<{ isDragActive: boolean }>`
    margin-right: 6px;
    opacity: 0;

    ${IngredientRow}:hover & {
        opacity: 1;
    }

    ${({ isDragActive }) => isDragActive && css`
        opacity: 0 !important;
    `}
`;

const Actions = styled.div<{ hasItems: boolean }>`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 8px;

    ${props => props.hasItems && css`
        margin-top: 24px;
    `}
`;

export function RecipeIngredientsEditor({ ingredients }: RecipeIngredientsEditorProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const newItem = useRef<string | undefined>();
    const removedItem = useRef<string | undefined>();
    const updateRecipe = useUpdateRecipe();

    const addIngredient = (type: RecipeIngredientItemAdded['itemType'], index?: number) => {
        const itemId = uuid();
        newItem.current = itemId;

        updateRecipe({
            type: 'RecipeIngredientItemAdded',
            itemId,
            itemType: type,
            index,
        });

        return itemId;
    };

    const removeIngredient = (id: string) => {
        removedItem.current = id;

        updateRecipe({
            type: 'RecipeIngredientItemRemoved',
            itemId: id,
        });
    };

    const onDragEnd = (result: DropResult) => {
        setIsDragActive(false);

        if (!result.destination) {
            return;
        }

        updateRecipe({
            type: 'RecipeIngredientItemMoved',
            itemId: result.draggableId,
            index: result.destination.index,
        });
    };

    const updateIngredient = (event: PartialRecipeEvent<RecipeIngredientUpdated | RecipeIngredientHeadingUpdated>) => {
        // Ignore the update event after the remove event trigger from backspace
        if (removedItem.current === event.itemId) {
            return;
        }

        updateRecipe(event);
    };

    const inputGroup = useInputGroup({
        addLine(index, value) {
            const id = addIngredient('Ingredient', index);

            if (value) {
                updateRecipe({
                    type: 'RecipeIngredientUpdated',
                    itemId: id,
                    ...stringToIngredient(value),
                });
            }
        },
        updateLine(index, value) {
            const item = ingredients[index];
            if (item.type === 'Ingredient') {
                updateRecipe({
                    type: 'RecipeIngredientUpdated',
                    itemId: item.id,
                    ...stringToIngredient(value),
                });
            } else {
                updateRecipe({
                    type: 'RecipeIngredientHeadingUpdated',
                    itemId: item.id,
                    name: value.trim(),
                });
            }
        },
        removeLine(index) {
            removeIngredient(ingredients[index].id);
        },
    });

    const createRef = (index: number, id: string) => {
        const inputGroupRef = inputGroup.ref(index);

        return (element: HTMLTextAreaElement | null) => {
            inputGroupRef(element);

            if (element && newItem.current === id) {
                element.focus();
                newItem.current = undefined;
            }
        };
    };

    const items = ingredients.map((item, index) => {
        let component: JSX.Element;
        if (item.type === 'Heading') {
            component = <RecipeIngredientHeadingEditor
                heading={item}
                ref={createRef(index, item.id)}
                updateIngredient={updateIngredient}
                onKeyDown={inputGroup.onKeyDown(index)}
                onEnter={inputGroup.onEnter(index)}
            />;
        } else {
            component = <RecipeIngredientEditor
                ingredient={item}
                ref={createRef(index, item.id)}
                updateIngredient={updateIngredient}
                onKeyDown={inputGroup.onKeyDown(index)}
                onEnter={inputGroup.onEnter(index)}
            />;
        }

        return (
            <Draggable draggableId={item.id} index={index} key={item.id}>
                {({ draggableProps, dragHandleProps, innerRef }, { isDragging, isDropAnimating }) => (
                    <IngredientRow isHeading={item.type === 'Heading'} isDragging={isDragging && !isDropAnimating} {...draggableProps} ref={innerRef}>
                        <DragHandle isDragging={isDragging} isDragActive={isDragActive} {...dragHandleProps}>
                            <DragIcon />
                        </DragHandle>

                        {component}

                        <RemoveIngredientButton isDragActive={isDragActive} small onClick={() => removeIngredient(item.id)} aria-label="Remove ingredient" />
                    </IngredientRow>
                )}
            </Draggable>
        );
    });

    return (
        <>
            <DragDropContext onDragStart={() => setIsDragActive(true)} onDragEnd={onDragEnd}>
                <Droppable droppableId="ingredients">
                    {({ droppableProps, innerRef, placeholder }) => (
                        <Ingredients {...droppableProps} ref={innerRef}>
                            {items}
                            {placeholder}
                        </Ingredients>
                    )}
                </Droppable>
            </DragDropContext>
            <Actions hasItems={!!items.length}>
                <Button onClick={() => addIngredient('Ingredient')}><AddIcon /> Add ingredient</Button>
                <Button onClick={() => addIngredient('Heading')}><AddIcon /> Add heading</Button>
            </Actions>
        </>
    );
}
