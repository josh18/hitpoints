import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { RecipeTag, recipeTags } from '@hitpoints/shared';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Portal } from '../../../components/portal';
import { TextInput } from '../../../components/textInput';
import { CheckIcon } from '../../../icons/check';
import { DropdownIcon } from '../../../icons/dropdownIcon';
import { AnchorPosition, positionInViewport } from '../../../util/positionInViewport';

const FilterButton = styled(Button)`
    margin-left: 8px;
    flex: 0 0 auto;

    svg {
        margin-left: 4px;
        margin-right: -4px;
    }
`;

const Panel = styled(Card)`
    position: absolute;
    min-width: 250px;
`;

const InputContainer = styled.div`
    padding: 16px;
    margin-top: -1px;
    border-top: 1px solid ${rgba('#000', 0.08)};
`;

const FilterItemContainer = styled.div<{ active: boolean }>`
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    min-height: 41px;

    svg {
        margin-left: auto;
        fill: ${rgba('#000', 0.5)};
    }

    @media (hover: hover) {
        &:hover {
            background-color: ${rgba('#000', 0.16)};
        }
    }

    ${props => props.active && css`
        background-color: ${rgba('#000', 0.08)};
    `}

    & + & {
        margin-top: -1px;
        border-top: 1px solid ${rgba('#000', 0.08)};
    }
`;

interface FilterItemProps {
    tag: RecipeTag;
    active: boolean;
    toggle(): void;
}

function FilterItem({ tag, active, toggle }: FilterItemProps) {
    const icon = active ? <CheckIcon /> : null;

    return (
        <FilterItemContainer active={active} onClick={toggle}>
            {tag} {icon}
        </FilterItemContainer>
    );
}

interface RecipeSearchFilterProps {
    tagFilters: RecipeTag[];
    hasFilter: string;
    notFilter: string;
    toggleTagFilter(tag: RecipeTag): void;
    setIngredientFilter(type: 'has' | 'not', value: string): void;
}

export function RecipeSearchFilter({ tagFilters, hasFilter, notFilter, toggleTagFilter, setIngredientFilter }: RecipeSearchFilterProps) {
    const buttonPosition = useRef<AnchorPosition>();
    const panelRef = useRef<HTMLElement | null>();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const listener = (event: MouseEvent) => {
            if (!open) {
                return;
            }

            if (!panelRef.current || event.composedPath().includes(panelRef.current)) {
                return;
            }

            setOpen(false);
        };

        document.addEventListener('click', listener);

        return () => document.removeEventListener('click', listener);
    }, [open]);

    const toggleMenu = () => {
        setOpen(!open);
    };

    const setButtonRef = (element: HTMLButtonElement | null) => {
        if (element) {
            buttonPosition.current = element.getBoundingClientRect();
        }
    };

    const setMenuRef = (element: HTMLDivElement | null) => {
        panelRef.current = element;

        if (element && buttonPosition.current) {
            positionInViewport(element, buttonPosition.current, 'left');
        }
    };

    let panel;
    if (open) {
        panel = (
            <Panel floating ref={setMenuRef} role="menu">
                {recipeTags.map(tag =>
                    <FilterItem
                        key={tag}
                        tag={tag}
                        active={tagFilters.includes(tag)}
                        toggle={() => toggleTagFilter(tag)}
                    />,
                )}

                <InputContainer>
                    <label htmlFor="recipeSearchHas">Has ingredient</label>
                    <TextInput id="recipeSearchHas" value={hasFilter} onCommit={value => setIngredientFilter('has', value)} debounceTime={0} />
                </InputContainer>

                <InputContainer>
                    <label htmlFor="recipeSearchNot">Does not have ingredient</label>
                    <TextInput id="recipeSearchNot" value={notFilter} onCommit={value => setIngredientFilter('not', value)} debounceTime={0} />
                </InputContainer>
            </Panel>
        );
    }

    return (
        <>
            <FilterButton
                active={open}
                onClick={toggleMenu}
                ref={setButtonRef}
                aria-label="More actions"
                aria-haspopup="true"
                aria-expanded={open}
                secondary
            >
                Filter <DropdownIcon />
            </FilterButton>

            <Portal>
                {panel}
            </Portal>
        </>
    );
}
