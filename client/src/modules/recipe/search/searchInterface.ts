import lunr from 'lunr';

import { Recipe, RecipeTag } from '@hitpoints/shared';

import { keyVal, RecipeSearchIndex } from '../../../localDatabase/client.db';
import { getRecipes } from '../../../localDatabase/recipe.db';

export interface RecipeQuery {
    text?: string[];
    hasIngredients?: string[];
    notIngredients?: string[];
    tags?: RecipeTag[];
}

function searchText(index: lunr.Index, query: RecipeQuery) {
    query = {
        ...query,
        text: query.text?.map(text => text.toLowerCase()),
        hasIngredients: query.hasIngredients?.map(ingredient => ingredient.toLowerCase()),
        notIngredients: query.notIngredients?.map(ingredient => ingredient.toLowerCase()),
    };

    try {
        const results = index.query(q => {
            if (query.text) {
                q.term(query.text, {
                    fields: ['name'],
                    boost: 100,
                });
                q.term(query.text, {
                    fields: ['name'],
                    wildcard: lunr.Query.wildcard.TRAILING,
                    boost: 10,
                });
                q.term(query.text, {
                    fields: ['name'],
                    editDistance: 1,
                    boost: 2,
                });
            }

            if (query.hasIngredients) {
                q.term(query.hasIngredients, {
                    fields: ['ingredients'],
                    presence: lunr.Query.presence.OPTIONAL,
                    boost: 100,
                });

                q.term(query.hasIngredients, {
                    fields: ['ingredients'],
                    presence: lunr.Query.presence.REQUIRED,
                    editDistance: 1,
                });
            }

            if (query.notIngredients) {
                q.term(query.notIngredients, {
                    fields: ['ingredients'],
                    presence: lunr.Query.presence.PROHIBITED,
                });
            }
        });

        return results.map(result => result.ref);
    } catch (error) {
        console.error(`Search: ${(error as Error).message}`);

        return [];
    }
}

function search(index: Index, query: RecipeQuery) {
    let recipeIds: string[] = [];

    if (query.text || query.hasIngredients || query.notIngredients) {
        recipeIds = searchText(index.text, query);
    } else {
        recipeIds = index.order;
    }

    if (query.tags) {
        const tagSet = new Set(query.tags.map(tag => index.tags[tag]).flat());

        recipeIds = recipeIds.filter(id => tagSet.has(id));
    }

    return recipeIds.map(id => {
        const realId = index.idMap.get(id);

        if (!realId) {
            throw new Error(`Recipe short id ${id} does not exist in the map.`);
        }

        return realId;
    });
}

interface Index extends Omit<RecipeSearchIndex, 'text'> {
    text: lunr.Index;
}

export class SearchInterface {
    private inScrollRange = false;
    private query: RecipeQuery = {};

    private recipeIds: string[] = [];
    private recipes: Recipe[] = [];
    private isLoading = false;

    private index?: Index;
    private cancelLoad?: () => void;
    private broadcastChannel = new BroadcastChannel('recipeIndex');

    private readonly itemsPerPage = 9;

    constructor(
        private onResults: (recipes: Recipe[]) => void,
    ) {
        this.loadIndex();

        this.indexListener = this.indexListener.bind(this);

        this.broadcastChannel.addEventListener('message', this.indexListener);
    }

    destroy() {
        this.broadcastChannel.removeEventListener('message', this.indexListener);
    }

    setQuery(query: RecipeQuery): void {
        this.query = query;

        this.search();
    }

    setInScrollRange(inRange: boolean): void {
        this.inScrollRange = inRange;

        if (inRange && !this.isLoading) {
            this.loadNextPage();
        }
    }

    private async loadIndex() {
        const index = await keyVal.get('recipeSearchIndex');

        if (!index) {
            return;
        }

        this.index = {
            ...index,
            text: lunr.Index.load(JSON.parse(index.text)),
        };

        this.search();
    }

    private search() {
        this.cancelLoad?.();

        this.recipes = [];

        if (!this.index) {
            this.onResults(this.recipes);
            return;
        }

        this.recipeIds = search(this.index, this.query);

        if (!this.recipeIds.length) {
            // No results
            this.onResults(this.recipes);
        }

        this.loadNextPage();
    }

    private async loadNextPage() {
        if (!this.recipeIds.length) {
            return;
        }

        this.isLoading = true;

        let cancelled  = false;
        this.cancelLoad = () => cancelled = true;

        const nextRecipeIds = this.recipeIds.splice(0, this.itemsPerPage);
        const recipes = await getRecipes(nextRecipeIds);

        if (cancelled) {
            return;
        }

        this.recipes = [
            ...this.recipes,
            ...recipes,
        ];

        this.onResults(this.recipes);

        if (this.inScrollRange) {
            this.loadNextPage();
        }

        this.isLoading = false;
    }

    private indexListener(event: MessageEvent<RecipeSearchIndex>) {
        this.index = {
            ...event.data,
            text: lunr.Index.load(JSON.parse(event.data.text)),
        };

        // If there are no recipe displayed
        if (!this.recipes.length) {
            // Then reload the results
            this.search();
        }
    }
}
