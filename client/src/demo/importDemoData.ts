import { deleteDB } from 'idb';

import { buildRecipe, RecipeImported, RecipeIngredient, RecipeInstruction, RecipeTag } from '@hitpoints/shared';

import { getDatabase } from '../clientDatabase/client.db';
import { addSyncedEvents } from '../clientDatabase/event.db';
import { indexRecipes } from '../clientDatabase/recipe.db';
import { uuid } from '../util/uuid';

interface DemoRecipe {
    name: string;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    tags?: RecipeTag[],
    source: string;
}

const storageKey = 'Hitpoints|RecipesImported';

export async function importDemoData() {
    if (localStorage.getItem(storageKey)) {
        return;
    }

    const response = await fetch('recipes.json');
    const data: DemoRecipe[] = await response.json();

    // Prevent parallel imports
    if (localStorage.getItem(storageKey)) {
        return;
    }

    localStorage.setItem('Hitpoints|RecipesImported', 'true');

    const events: RecipeImported[] = data.map(recipe => ({
        type: 'RecipeImported',
        id: uuid(),
        entityId: uuid(),
        name: recipe.name,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        tags: recipe.tags,
        source: recipe.source,
        timestamp: new Date().toISOString(),
    }));

    await Promise.all([
        addSyncedEvents(events),
        addRecipes(events),
    ]);

    indexRecipes();
}

async function addRecipes(events: RecipeImported[]) {
    const recipes = events.map(event => buildRecipe([event]));

    const db = await getDatabase();
    const transaction = db.transaction('recipes', 'readwrite');

    recipes.forEach(recipe => transaction.store.put(recipe));

    await transaction.done;
}

// TODO
(window as any).resetDemo = async () => {
    localStorage.removeItem('Hitpoints|RecipesImported');

    try {
        const db = await getDatabase();
        db.close();
    } catch { }

    await deleteDB('hitpoints', {
        blocked: () => location.reload(),
    });

    location.reload();
};
