import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';
import { useState } from 'react';

import { Recipe } from '@hitpoints/shared';

import { Button } from '../../components/button';
import { Checkbox } from '../../components/checkbox';
import { DailogScrollContent, DialogActions } from '../../components/dialog';
import { TransitionHeight } from '../../components/transitionHeight';
import { AddIcon } from '../../icons/addIcon';
import { CheckboxCheckedIcon } from '../../icons/checkboxCheckedIcon';
import { CheckboxUncheckedIcon } from '../../icons/checkboxUncheckedIcon';
import { DropdownIcon } from '../../icons/dropdownIcon';
import { useMaxWidth } from '../../util/useMaxWidth';
import { useSelector } from '../../util/useSelector';
import { uuid } from '../../util/uuid';
import { useUpdateShoppingList } from '../shoppingList/useUpdateShoppingList';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-width: 800px;
`;

const ListActions = styled.div`
    display: flex;
    margin-bottom: 32px;
    column-gap: 8px;
`;

const IgnoredIngredients = styled.div`
    color: ${rgba('#000', 0.4)};
    font-style: italic;
    margin-bottom: 16px;
`;

const Items = styled.div`
    display: flex;
    flex-direction: column;
    column-gap: 4px;
    row-gap: 4px;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    column-gap: 8px;
`;

const CheckboxStyled = styled(Checkbox)`
    grid-area: Checkbox;
`;

const CollapseButton = styled.button<{ collapsed: boolean }>`
    grid-area: CollapseButton;
    flex: 0;
    border-radius: 50%;
    padding: 8px;
    margin: -8px;
    color: ${rgba('#000', 0.4)};

    @media (hover: hover) {
        &:hover,
        &:focus-visible {
            background-color: ${rgba('#000', 0.08)};
        }
    }

    svg {
        transition: ${props => props.theme.transition('transform')};
    }

    ${props => !props.collapsed && css`
        svg {
            transform: rotate(180deg);
        }
    `}
`;

const RecipeNamesText = styled.div`
    grid-area: RecipeNamesText;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    color: ${rgba('#000', 0.4)};
    font-style: italic;
    font-size: 13px;
`;

interface ItemProps {
    name: string;
    value: boolean;
    commit: (checked: boolean) => void;
    recipes: Recipe[];
    showRecipes: boolean;
}

function Item({ name, value, commit, recipes, showRecipes }: ItemProps) {
    const [collapsed, setCollapsed] = useState(true);
    const collapseEnabled = useMaxWidth(800);

    const recipeText = recipes.map(recipe => recipe.name).join(' / ');
    const checkbox = <CheckboxStyled
        name={name}
        value={value}
        commit={commit}
    />;

    if (!showRecipes) {
        return <Row>{checkbox}</Row>;
    }

    if (collapseEnabled) {
        return (
            <div>
                <Row>
                    {checkbox}
                    <CollapseButton onClick={() => setCollapsed(!collapsed)} collapsed={collapsed}>
                        <DropdownIcon />
                    </CollapseButton>
                </Row>
                <TransitionHeight visible={!collapsed}>
                    <RecipeNamesText>{recipeText}</RecipeNamesText>
                </TransitionHeight>
            </div>
        );
    }

    return (
        <Row>
            {checkbox}

            <RecipeNamesText>{recipeText}</RecipeNamesText>
        </Row>
    );
}

export interface AddToShoppingListProps {
    recipes: Recipe[];
    onClose(): void;
}

export function AddToShoppingList({ recipes, onClose }: AddToShoppingListProps) {
    const shoppingListItems = useSelector(state => state.shoppingList?.items) ?? [];
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const updateShoppingList = useUpdateShoppingList();

    const existingItems = new Set(shoppingListItems.map(item => item.name));
    const ignoredIngredients = new Set<string>();
    const itemToRecipeMap = new Map<string, Recipe[]>();
    const uniqueItems = new Set<string>();
    recipes.forEach(recipe => {
        recipe.ingredients.forEach(({ name }) => {
            if (!name) {
                return;
            }

            if (existingItems.has(name)) {
                ignoredIngredients.add(name);
            } else {
                const items = itemToRecipeMap.get(name) ?? [];
                items.push(recipe);
                itemToRecipeMap.set(name, items);

                uniqueItems.add(name);
            }
        });
    });

    const items = [...uniqueItems].sort((a, b) => a.localeCompare(b));

    const selectAll = () => {
        setSelectedItems(items);
    };

    const unselectAll = () => {
        setSelectedItems([]);
    };

    const toggleItem = (item: string, selected: boolean) => {
        if (selected) {
            setSelectedItems([...selectedItems, item]);
        } else {
            setSelectedItems(selectedItems.filter(i => i !== item));
        }
    };

    const addToShoppingList = () => {
        const newItems = items
            .filter(item => selectedItems.includes(item))
            .map(name => ({
                id: uuid(),
                name,
            }));

        updateShoppingList({
            type: 'ShoppingListItemsAdded',
            items: newItems,
        });

        onClose();
    };

    return (
        <Container>
            <DailogScrollContent>
                <ListActions>
                    <Button secondary onClick={selectAll}><CheckboxCheckedIcon /> Check all</Button>
                    <Button secondary onClick={unselectAll}><CheckboxUncheckedIcon />Uncheck all</Button>
                </ListActions>

                {ignoredIngredients.size && <IgnoredIngredients>{ignoredIngredients.size} ingredients are already on the shopping list</IgnoredIngredients>}

                <Items>
                    {items.map(item => (
                        <Item
                            key={item}
                            name={item}
                            value={selectedItems.includes(item)}
                            commit={selected => toggleItem(item, selected)}
                            recipes={itemToRecipeMap.get(item) ?? []}
                            showRecipes={recipes.length > 1}
                        />
                    ))}
                </Items>
            </DailogScrollContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button disabled={!selectedItems.length} onClick={addToShoppingList}>
                    <AddIcon /> Add to shopping list
                </Button>
            </DialogActions>
        </Container>
    );
}
