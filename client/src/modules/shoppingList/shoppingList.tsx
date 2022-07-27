import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';
import { useEffect, useRef } from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';

import { ShoppingListItem } from '@hitpoints/shared';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { Checkbox } from '../../components/checkbox';
import { Menu, MenuItem } from '../../components/menu';
import { RemoveButton } from '../../components/removeButton';
import { TextInput } from '../../components/textInput';
import { AddIcon } from '../../icons/addIcon';
import { DragIcon } from '../../icons/dragIcon';
import { useInputGroup } from '../../util/useInputGroup';
import { useSelector } from '../../util/useSelector';
import { useTitle } from '../../util/useTitle';
import { uuid } from '../../util/uuid';
import { useUpdateShoppingList } from './useUpdateShoppingList';

const Container = styled(Card)`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 48px 32px;
`;

const List = styled.div`
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    width: 100%;

    & + & {
        margin-top: 8px;
    }
`;

const Line = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
`;

export const EditableListDragHandle = styled.div<{ isDragging: boolean; dragActive: boolean; }>`
    position: absolute;
    right: 100%;
    display: flex;
    color: ${rgba('#000', 0.48)};
    opacity: 0;

    ${Line}:hover & {
        opacity: 1;
    }

    @media (hover: none) {
        opacity: 1;
    }

    ${({ dragActive }) => dragActive && css`
        opacity: 0 !important;
    `}

    ${({ isDragging }) => isDragging && css`
        opacity: 1 !important;
    `}
`;

export const EditableListRemoveButton = styled(RemoveButton) <{ dragActive: boolean; }>`
    position: absolute;
    right: 6px;
    opacity: 0;

    ${Line}:hover & {
        opacity: 1;
    }

    ${({ dragActive }) => dragActive && css`
        opacity: 0 !important;
    `}
`;

const CheckboxStyled = styled(Checkbox)`
    margin-right: 8px;
`;

const TextInputStyled = styled(TextInput)<{ checked: boolean; isDragging: boolean }>`
    flex: 1;
    background-color: #e8e9ea; // Solid color so it works when dragging
    transition: ${props => props.theme.transition('box-shadow')};
    transition: box-shadow 2s;
    width: 100%;
    padding-right: 34px;

    &:hover,
    &:focus {
        background-color: #dddedf;
    }

    ${props => props.checked && css`
        text-decoration: line-through;
        color: ${rgba('#000', 0.6)};
    `}

    ${props => props.isDragging && css`
        box-shadow: ${props.theme.highShadow};
    `}
`;

const ListActions = styled.div`
    display: flex;
    column-gap: 8px;
    margin-bottom: 32px;
    margin-left: auto;
`;

export function ShoppingList() {
    const updateShoppingList = useUpdateShoppingList();
    const newItem = useRef<string | undefined>();
    const removedItem = useRef<string | undefined>();

    const shoppingList = useSelector(state => state.shoppingList);

    useTitle('Shopping List');

    // Add item if there are none
    useEffect(() => {
        if (!shoppingList) {
            return;
        }

        if (!shoppingList.items.length && !shoppingList.checked.length) {
            updateShoppingList({
                type: 'ShoppingListItemsAdded',
                items: [{
                    id: uuid(),
                    name: '',
                }],
            });
        }
    }, [shoppingList, updateShoppingList]);

    const inputGroup = useInputGroup({
        addLine(index, value) {
            const id = addItem(index);

            if (value) {
                updateItem(id, value);
            }
        },
        updateLine(index, value) {
            if (!shoppingList) {
                return;
            }

            updateItem(shoppingList.items[index].id, value);
        },
        removeLine(index) {
            if (!shoppingList) {
                return;
            }

            removeItem(shoppingList.items[index]);
        },
    });

    if (!shoppingList) {
        return null;
    }

    const addItem = (index?: number) => {
        const id = uuid();
        newItem.current = id;

        updateShoppingList({
            type: 'ShoppingListItemsAdded',
            items: [{
                id,
                name: '',
            }],
            index,
        });

        return id;
    };

    const removeItem = (item: ShoppingListItem) => {
        removedItem.current = item.id;

        updateShoppingList({
            type: 'ShoppingListItemsRemoved',
            itemIds: [item.id],
        });
    };

    const updateItem = (id: string, name: string) => {
        // Ignore updates to removed items
        if (removedItem.current === id) {
            return;
        }

        updateShoppingList({
            type: 'ShoppingListItemUpdated',
            item: {
                id,
                name: name.trim(),
            },
        });
    };

    const toggleItem = (id: string, checked: boolean) => {
        if (checked) {
            updateShoppingList({
                type: 'ShoppingListItemsChecked',
                itemIds: [id],
            });
        } else {
            updateShoppingList({
                type: 'ShoppingListItemsUnchecked',
                itemIds: [id],
            });
        }
    };

    const checkAllItems = () => {
        updateShoppingList({
            type: 'ShoppingListItemsChecked',
            itemIds: shoppingList.items.map(item => item.id),
        });
    };

    const removeAllCheckedItems = () => {
        updateShoppingList({
            type: 'ShoppingListItemsRemoved',
            itemIds: shoppingList.checked.map(item => item.id),
        });
    };

    const copyList = () => {
        const text = shoppingList.items
            .map(item => item.name.trim())
            .filter(item => item.length > 0)
            .join('\n');
        navigator.clipboard.writeText(text);
    };

    const menuItems: MenuItem[] = [
        {
            name: 'Copy',
            action: copyList,
        }, {
            name: 'Check all items',
            action: checkAllItems,
        }, {
            name: 'Delete checked items',
            action: removeAllCheckedItems,
        },
    ];

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        updateShoppingList({
            type: 'ShoppingListItemMoved',
            itemId: result.draggableId,
            index: result.destination.index,
        });
    };

    const createRef = (index: number, id: string) => {
        const inputGroupRef = inputGroup.ref(index);

        return (element: HTMLElement | null) => {
            inputGroupRef(element);

            if (element && newItem.current === id) {
                element.focus();
                newItem.current = undefined;
            }
        };
    };

    const uncheckedItems = (dragActive: boolean) => shoppingList.items.map((item, index) => (
        <Draggable draggableId={item.id} index={index} key={item.id}>
            {({ draggableProps, dragHandleProps, innerRef }, { isDragging, isDropAnimating }) => (
                <Line {...draggableProps} ref={innerRef}>
                    <EditableListDragHandle isDragging={isDragging} dragActive={dragActive} {...dragHandleProps}>
                        <DragIcon />
                    </EditableListDragHandle>

                    <CheckboxStyled value={false} commit={checked => toggleItem(item.id, checked)} />

                    <TextInputStyled
                        checked={false}
                        isDragging={isDragging && !isDropAnimating}
                        ref={createRef(index, item.id)}
                        value={item.name}
                        onCommit={value => updateItem(item.id, value)}
                        onKeyDown={inputGroup.onKeyDown(index)}
                        onEnter={inputGroup.onEnter(index)}
                    />

                    <EditableListRemoveButton dragActive={dragActive} small onClick={() => removeItem(item)} aria-label="Remove" />
                </Line>
            )}
        </Draggable>
    ));

    let uncheckedList;
    if (uncheckedItems.length) {
        uncheckedList = (
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="shoppingList">
                    {({ droppableProps, innerRef, placeholder }, { draggingFromThisWith }) => (
                        <List {...droppableProps} ref={innerRef}>
                            {uncheckedItems(!!draggingFromThisWith)}
                            {placeholder}
                        </List>
                    )}
                </Droppable>
            </DragDropContext>
        );
    }

    const checkedItems = shoppingList.checked.map((item, index) => {
        index += shoppingList.items.length;

        return (
            <Line key={item.id}>
                <CheckboxStyled value={true} commit={checked => toggleItem(item.id, checked)} />

                <TextInputStyled
                    checked={true}
                    isDragging={false}
                    ref={createRef(index, item.id)}
                    value={item.name}
                    onCommit={value => updateItem(item.id, value)}
                    onKeyDown={inputGroup.onKeyDown(index)}
                />

                <EditableListRemoveButton dragActive={false} small onClick={() => removeItem(item)} aria-label="Remove" />
            </Line>
        );
    });

    let checkedList;
    if (checkedItems.length) {
        checkedList = (
            <List>
                {checkedItems}
            </List>
        );
    }

    return (
        <Container>
            <ListActions>
                <Button onClick={() => addItem()}><AddIcon /> Add item</Button>
                <Menu items={menuItems} />
            </ListActions>

            {uncheckedList}

            {checkedList}
        </Container>
    );
}
