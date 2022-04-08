import lunr from 'lunr';

import { Recipe, RecipeTag } from '@hitpoints/shared';

import { getDatabase, keyVal } from './client.db';

onmessage = () => {
    // TODO debounce
    createIndex();
};

function createDefaultOrder(recipes: Recipe[]) {
    const compare = new Intl.Collator('en', { ignorePunctuation: true }).compare;
    const order = [...recipes].sort((a, b) => compare(a.name, b.name))
        .map(recipe => recipe.id);

    return order;
}

function createTagsIndex(recipes: Recipe[]) {
    const tags: {
        [key in RecipeTag]?: string[];
    } = {};

    recipes.forEach(recipe => {
        recipe.tags.forEach(tag => {
            if (!tags[tag]) {
                tags[tag] = [];
            }

            tags[tag]?.push(recipe.id);
        });
    });

    return tags;
}

function createTextIndex(recipes: Recipe[]) {
    const index = lunr(builder => {
        builder.field('name');
        builder.field('ingredients');

        recipes.forEach(recipe => {
            const ingredients = recipe.ingredients
                .map(ingredient => ingredient.type === 'Ingredient' && ingredient.name)
                .join(' ');

            builder.add({
                id: recipe.id,
                name: recipe.name,
                ingredients,
            });
        });
    });

    return JSON.stringify(index);
}

async function createIndex() {
    const start = new Date();

    const db = await getDatabase();
    const allRecipes = await db.getAll('recipes');

    const recipes = allRecipes.filter(recipe => !recipe.deleted);

    const idMap = new Map<string, string>();
    recipes.forEach((recipe, i) => {
        const shortId = i.toString();

        idMap.set(shortId, recipe.id);
        recipe.id = shortId;
    });

    const index = {
        order: createDefaultOrder(recipes),
        tags: createTagsIndex(recipes),
        text: createTextIndex(recipes),
        idMap,
    };

    const transaction = db.transaction('assorted', 'readwrite');

    const cursor = await keyVal.get('recipeSearchIndexCursor', transaction);
    if (cursor && start < cursor) {
        // Something else has changed the index with a later timestamp
        await transaction.done;
        return;
    }

    await Promise.all([
        keyVal.set('recipeSearchIndex', index, transaction),
        keyVal.set('recipeSearchIndexCursor', start, transaction),
    ]);

    await transaction.done;

    new BroadcastChannel('recipeIndex').postMessage(index);
}
