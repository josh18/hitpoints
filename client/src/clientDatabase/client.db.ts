import { DBSchema, IDBPTransaction, openDB } from 'idb';

import { HitpointsEntityType, HitpointsEvent, Recipe, RecipeTag, ShoppingList } from '@hitpoints/shared';

export interface RecipeSearchIndex {
    order: string[];
    tags: {
        [key in RecipeTag]?: string[];
    };
    text: string;
    idMap: Map<string, string>;
}

export interface AssortedMap {
    eventSyncCursor: string;
    shoppingList: ShoppingList;
    recipeSearchIndexCursor: Date;
    recipeSearchIndex: RecipeSearchIndex;
    pinnedRecipes: string[];
}

export interface StoredEvents {
    id: string;
    type: HitpointsEntityType;
    events: Map<string, HitpointsEvent>;
    syncing: Map<string, Date>;
    unsynced?: 1;
}

export interface ClientDB extends DBSchema  {
    assorted: {
        key: string;
        value: unknown;
    };
    recipes: {
        key: string;
        value: Recipe;
        indexes: {
            pinned: number;
        }
    };
    events: {
        key: string;
        value: StoredEvents;
        indexes: {
            unsynced: number;
        };
    }
}

const databaseVersion = 1;

const clientDB = openDB<ClientDB>('hitpoints', databaseVersion, {
    upgrade(db) {
        db.createObjectStore('assorted');

        const events = db.createObjectStore('events', {
            keyPath: 'id',
        });
        events.createIndex('unsynced', 'unsynced');

        db.createObjectStore('recipes', {
            keyPath: 'id',
        });
    },
});

export function getDatabase() {
    return clientDB;
}

export const keyVal = {
    async get<Key extends keyof AssortedMap, Value extends AssortedMap[Key]>(
        key: Key,
        transaction?: IDBPTransaction<ClientDB, ['assorted'], 'readonly' | 'readwrite'>,
    ) {
        if (transaction) {
            return transaction.objectStore('assorted').get(key) as Promise<Value | undefined>;
        }

        const db = await getDatabase();

        return db.get('assorted', key) as Promise<Value | undefined>;
    },
    async set<Key extends keyof AssortedMap, Value extends AssortedMap[Key]>(
        key: Key,
        value: Value,
        transaction?: IDBPTransaction<ClientDB, ['assorted'], 'readwrite'>,
    ) {
        if (transaction) {
            await transaction.objectStore('assorted').put(value, key);
        }

        const db = await getDatabase();
        await db.put('assorted', value, key);
    },
};
