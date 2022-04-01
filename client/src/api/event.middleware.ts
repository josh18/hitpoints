import {
    AddEventsRequest,
    eventEntityType,
    HitpointsEntityType,
    HitpointsEvent,
    isHitpointsEvent,
    isRecipeEvent,
    isShoppingListEvent,
    RecipeEvent,
    ShoppingListEvent,
} from '@hitpoints/shared';

import { getDatabase, keyVal, StoredEvents } from '../localDatabase/local.db';
import { rebuildRecipe, updateRecipe } from '../localDatabase/recipe.db';
import { rebuildShoppingList, updateShoppingList } from '../localDatabase/shoppingList.db';
import { Middleware } from '../store';
import { connection } from './connection';

const syncCursorKey = 'eventSyncCursor';

async function addEvent(event: HitpointsEvent, connected: boolean) {
    const id = event.entityId;

    const db = await getDatabase();
    const transaction = db.transaction('events', 'readwrite');

    let storedEvents = await transaction.store.get(id);
    storedEvents = storedEvents ?? {
        id,
        type: eventEntityType(event),
        events: new Map(),
        syncing: new Map(),
    };

    storedEvents.events.set(event.id, event);

    if (!event.version) {
        storedEvents.unsynced = 1;

        if (connected) {
            storedEvents.syncing.set(event.id, new Date());
        }
    }

    await transaction.store.put(storedEvents);
    await transaction.done;
}

function syncEventsFromServer(onUpdate: (events: HitpointsEvent[]) => void) {
    const request = async () => {
        const cursor = await keyVal.get(syncCursorKey);

        return { cursor };
    };

    connection.subscribe('syncEvents', request, async result => {
        await keyVal.set(syncCursorKey, result.cursor);

        // Group events by entityId
        const groupedEvents: { [key: string]: HitpointsEvent[]; } = {};
        result.events.forEach(event => {
            groupedEvents[event.entityId] = groupedEvents[event.entityId] ?? [];
            groupedEvents[event.entityId].push(event);
        });

        const db = await getDatabase();
        const transaction = db.transaction('events', 'readwrite');

        // Save events
        const updatedEvents = await Promise.all(
            Object.entries(groupedEvents).map(async ([id, events]) => {
                const existingEvents = await transaction.objectStore('events').get(id);
                const storedEvents: StoredEvents = existingEvents ?? {
                    id,
                    type: eventEntityType(events[0]),
                    events: new Map(),
                    syncing: new Map(),
                };

                events.forEach(event => {
                    storedEvents.events.set(event.id, event);
                    storedEvents.syncing.delete(event.id);
                });

                if ([...storedEvents.events.values()].some(event => !event.version)) {
                    storedEvents.unsynced = 1;
                } else {
                    delete storedEvents.unsynced;
                }

                await transaction.objectStore('events').put(storedEvents);

                return [...storedEvents.events.values()];
            }),
        );

        await transaction.done;

        updatedEvents.forEach(events => onUpdate(events));
    });
}

async function getUnsavedEvents() {
    const db = await getDatabase();
    const transaction = db.transaction(['events'], 'readwrite');
    const unsyncedEvents = await transaction.objectStore('events').index('unsynced').getAll();

    const unsyncedMap = new Map<string, HitpointsEvent[]>();

    // 30 seconds ago
    const timeout = new Date(Date.now() - 30_000);

    unsyncedEvents.forEach(({ id, events, syncing }) => {
        const unsyncedEvents = [...events.values()]
            .filter(event => {
                if (event.version) {
                    return false;
                }

                const syncTime = syncing.get(event.id);

                return !syncTime || timeout > syncTime;
            })
            .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

        if (unsyncedEvents.length) {
            unsyncedMap.set(id, unsyncedEvents);
        }
    });

    return unsyncedMap;
}

function sendEventsToServer(
    entityId: string,
    events: HitpointsEvent[],
    onUpdate: (events: HitpointsEvent[]) => void,
    onDelete: (entityType: HitpointsEntityType, entityId: string) => void,
    onError: (errors: string[]) => void,
) {
    const data: AddEventsRequest = { id: entityId, events };

    connection.request('addEvents', data, async response => {
        const failed = response.failed;
        if (!failed.length) {
            return;
        }

        onError(failed.map(({ error }) => error));

        const db = await getDatabase();
        const transaction = db.transaction('events', 'readwrite');
        const storedEvents = await transaction.store.get(entityId);

        if (!storedEvents) {
            return;
        }

        failed.forEach(({ eventId }) => {
            storedEvents.syncing.delete(eventId);
            storedEvents.events.delete(eventId);
        });

        // Failed to create the entity so removing it from the local db
        if (!storedEvents.events.size) {
            await transaction.store.delete(entityId);
            await transaction.done;
            onDelete(storedEvents.type, entityId);
            return;
        }

        if ([...storedEvents.events.values()].some(event => !event.version)) {
            storedEvents.unsynced = 1;
        } else {
            delete storedEvents.unsynced;
        }

        await transaction.store.put(storedEvents);
        await transaction.done;

        onUpdate([...storedEvents.events.values()]);
    });
}

async function sendUnsavedEventsToServer(
    onUpdate: (events: HitpointsEvent[]) => void,
    onDelete: (entityType: HitpointsEntityType, entityId: string) => void,
    onError: (errors: string[],
) => void) {
    const unsavedEvents = await getUnsavedEvents();

    for (const [entityId, events] of unsavedEvents) {
        sendEventsToServer(entityId, events, onUpdate, onDelete, onError);
    }
}

export const eventMiddleware: Middleware = ({ getState, dispatch }) => {
    const onUpdate = (events: HitpointsEvent[]) => {
        if (events.every(isRecipeEvent)) {
            rebuildRecipe(events , getState(), dispatch);
        }

        if (events.every(isShoppingListEvent)) {
            rebuildShoppingList(events, dispatch);
        }
    };

    const onDelete = async (entityType: HitpointsEntityType, entityId: string) => {
        const db = await getDatabase();

        if (entityType === 'recipe') {
            await db.delete('recipes', entityId);
        }
    };

    const onError = (errors: string[]) => {
        dispatch({
            type: 'ShowError',
            message: errors,
        });
    };

    syncEventsFromServer(onUpdate);

    return next => event => {
        if (event.type === 'Connected') {
            sendUnsavedEventsToServer(onUpdate, onDelete, onError);
        }

        if (isHitpointsEvent(event)) {
            const connected = getState().connected;

            addEvent(event, connected);

            if (connected && !event.version) {
                sendEventsToServer(event.entityId, [event], onUpdate, onDelete, onError);
            }
        }

        if (isRecipeEvent(event)) {
            updateRecipe(event);
        }

        if (isShoppingListEvent(event)) {
            updateShoppingList(event);
        }

        return next(event);
    };
};
