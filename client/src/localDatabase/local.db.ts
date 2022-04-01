import { DBSchema, IDBPTransaction, openDB } from 'idb/with-async-ittr';

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
}

export interface StoredEvents {
    id: string;
    type: HitpointsEntityType;
    events: Map<string, HitpointsEvent>;
    syncing: Map<string, Date>;
    unsynced?: 1;
}

export interface LocalDB extends DBSchema  {
    assorted: {
        key: string;
        value: unknown;
    };
    recipes: {
        key: string;
        value: Recipe;
    };
    events: {
        key: string;
        value: StoredEvents;
        indexes: {
            unsynced: number;
        };
    }
}

const databaseVersion = 2;

const localDb = openDB<LocalDB>('hitpoints', databaseVersion, {
    upgrade(db, oldVersion) {
        if (db.objectStoreNames.contains('recipeEvents' as any)) {
            db.deleteObjectStore('recipeEvents' as any);
        }

        // v1
        if (oldVersion < 1) {
            db.createObjectStore('assorted');

            db.createObjectStore('recipes', {
                keyPath: 'id',
            });
        }

        // v2
        if (oldVersion < 2) {
            const events = db.createObjectStore('events', {
                keyPath: 'id',
            });

            events.createIndex('unsynced', 'unsynced');
        }
    },
});

export function getDatabase() {
    return localDb;
}

export const keyVal = {
    async get<Key extends keyof AssortedMap, Value extends AssortedMap[Key]>(
        key: Key,
        transaction?: IDBPTransaction<LocalDB, ['assorted'], 'readonly' | 'readwrite'>,
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
        transaction?: IDBPTransaction<LocalDB, ['assorted'], 'readwrite'>,
    ) {
        if (transaction) {
            await transaction.objectStore('assorted').put(value, key);
        }

        const db = await getDatabase();
        await db.put('assorted', value, key);
    },
};
