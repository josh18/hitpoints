import { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { Recipe, RecipeTag } from '@hitpoints/shared';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { ScrollObserver } from '../../../components/scrollObserver';
import { TextInput } from '../../../components/textInput';
import { AddIcon } from '../../../icons/addIcon';
import { SearchIcon } from '../../../icons/searchIcon';
import { useRefInstance } from '../../../util/useRefInstance';
import { useTitle } from '../../../util/useTitle';
import { uuid } from '../../../util/uuid';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { PinnedRecipes } from './pinnedRecipes';
import { RecipeImport } from './recipeImport';
import { RecipeSearchFilter } from './recipeSearchFilter';
import { RecipeSearchItem } from './recipeSearchItem';
import { SearchInterface } from './searchInterface';
import { SeachQuery } from './searchQuery';

const Container = styled.div`
    display: grid;
    grid-template-areas: 'SearchBar Actions'
                         'RecipeGrid PinnedRecipes';
    grid-template-columns: 1fr 350px;
    grid-template-rows: auto;
    align-items: start;
    column-gap: 32px;
    row-gap: 32px;
    max-width: 1600px;
    margin-right: auto;
    margin-left: auto;

    @media (max-width: 1500px) {
        grid-template-columns: 1fr 250px;
    }

    @media (max-width: 850px) {
        grid-template-columns: 1fr min-content;
        grid-template-areas: 'PinnedRecipes PinnedRecipes'
                             'SearchBar Actions'
                             'RecipeGrid RecipeGrid';
        column-gap: 16px;
        row-gap: 16px;
    }

    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        grid-template-areas: 'PinnedRecipes'
                             'Actions'
                             'SearchBar'
                             'RecipeGrid';
    }
`;

const RecipeGrid = styled.div`
    grid-area: RecipeGrid;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: 32px;
    row-gap: 32px;

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 850px) {
        column-gap: 24px;
        row-gap: 24px;
    }

    @media (max-width: 500px) {
        grid-template-columns: 1fr;
    }
`;

const SearchBar = styled.div`
    grid-area: SearchBar;
    position: relative;
    display: flex;
    align-items: center;

    @media print {
        display: none;
    }
`;

const SearchBarIcon = styled(SearchIcon)`
    position: absolute;
    pointer-events: none;
    left: 4px;
`;

const SearchInput = styled(TextInput)`
    background-color: transparent;
    width: 100%;
    padding-left: 32px;
    padding-bottom: 6px;
    border-bottom: 2px solid rgba('#000', 0.88);
`;

const Actions = styled.div`
    grid-area: Actions;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 8px;

    @media (max-width: 850px) {
        grid-template-columns: auto auto;
        justify-content: end;
    }

    @media print {
        display: none;
    }
`;

const NoResults = styled.div`
    padding-left: 6px;
`;

export function RecipeSearch(): JSX.Element {
    const navigate = useNavigate();
    const updateRecipe = useUpdateRecipe();

    const [textQuery, setTextQuery] = useState('');
    const [tagFilters, setTagFilters] = useState<RecipeTag[]>([]);
    const [hasFilter, setHasFilter] = useState('');
    const [notFilter, setNotFilter] = useState('');
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [importActive, setImportActive] = useState(false);

    const search = useRefInstance(() => new SearchInterface(setRecipes));
    const searchQuery = useRefInstance(() => new SeachQuery());

    useTitle('Recipes');

    const setQuery = (value: string) => {
        searchQuery.setQuery(value);

        setTextQuery(searchQuery.toString());

        const recipeQuery = searchQuery.toRecipeQuery();
        search.setQuery(recipeQuery);
        setTagFilters(recipeQuery.tags ?? []);
        setHasFilter(recipeQuery.hasIngredients?.[0] ?? '');
        setNotFilter(recipeQuery.notIngredients?.[0] ?? '');
    };

    const toggleTagFilter = (tag: RecipeTag) => {
        searchQuery.toggleTagFilter(tag);

        setTextQuery(searchQuery.toString());

        const recipeQuery = searchQuery.toRecipeQuery();
        search.setQuery(recipeQuery);
        setTagFilters(recipeQuery.tags ?? []);
    };

    const setIngredientFilter = (type: 'has' | 'not', value: string) => {
        searchQuery.setIngredientFilter(type, value);

        setTextQuery(searchQuery.toString());

        const recipeQuery = searchQuery.toRecipeQuery();
        search.setQuery(recipeQuery);
        setTagFilters(recipeQuery.tags ?? []);
    };

    const addRecipe = () => {
        const id = uuid();

        updateRecipe({
            type: 'RecipeCreated',
            recipeId: id,
        });

        navigate(id);
    };

    const openImportRecipe = () => {
        setImportActive(true);
    };

    const items = recipes.map((recipe, i) => {
        // Add observer to the last child
        let observer;
        if (i === recipes.length - 1) {
            observer = <ScrollObserver onRangeChange={inRange => search.setInScrollRange(inRange)} />;
        }

        return <RecipeSearchItem recipe={recipe} key={recipe.id + i} observer={observer} />;
    });

    return (
        <Container>
            <SearchBar>
                <SearchBarIcon />
                <SearchInput value={textQuery} onCommit={value => setQuery(value)} debounceTime={0} />
                <RecipeSearchFilter
                    tagFilters={tagFilters}
                    hasFilter={hasFilter}
                    notFilter={notFilter}
                    toggleTagFilter={toggleTagFilter}
                    setIngredientFilter={setIngredientFilter}
                />
            </SearchBar>

            <Actions>
                <Button onClick={addRecipe}>
                    <AddIcon /> Add
                </Button>

                <Button onClick={openImportRecipe}>
                    <AddIcon /> Import
                </Button>
            </Actions>

            <RecipeGrid>
                {items.length ? items : <NoResults>No recipes found</NoResults>}
            </RecipeGrid>

            <PinnedRecipes />

            <Dialog active={importActive} onClose={() => setImportActive(false)}>
                <RecipeImport onClose={() => setImportActive(false)} />
            </Dialog>
        </Container>
    );
}
