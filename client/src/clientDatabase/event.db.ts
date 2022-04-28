import { eventEntityType, HitpointsEvent } from '@hitpoints/shared';

import { getDatabase, StoredEvents } from './client.db';

/** Adds a new event that was created locally */
export async function addEvent(event: HitpointsEvent, syncing: boolean) {
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

        if (syncing) {
            storedEvents.syncing.set(event.id, new Date());
        }
    }

    await transaction.store.put(storedEvents);
    await transaction.done;
}

/** Adds events that were pushed from the server */
export async function addSyncedEvents(events: HitpointsEvent[]) {
    // Group events by entityId
    const groupedEvents: { [key: string]: HitpointsEvent[]; } = {};
    events.forEach(event => {
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

    return updatedEvents;
}

/**
 * Removes events that were deemed invalid by the server
 * @return a list of valid events
 */
export async function removeFailedEvents(entityId: string, failedEvents: string[]): Promise<HitpointsEvent[]> {
    const db = await getDatabase();
    const transaction = db.transaction('events', 'readwrite');
    const storedEvents = await transaction.store.get(entityId);

    if (!storedEvents) {
        return [];
    }

    failedEvents.forEach(eventId => {
        storedEvents.syncing.delete(eventId);
        storedEvents.events.delete(eventId);
    });

    if (storedEvents.events.size) {
        if ([...storedEvents.events.values()].some(event => !event.version)) {
            storedEvents.unsynced = 1;
        } else {
            delete storedEvents.unsynced;
        }

        await transaction.store.put(storedEvents);
        await transaction.done;
    } else {
        // Failed to create the entity so removing it from the local db
        await transaction.store.delete(entityId);
        await transaction.done;
    }

    return [...storedEvents.events.values()];
}

/** Gets a list of unsynced events and marks them as being synced */
export async function checkoutUnsavedEvents() {
    const db = await getDatabase();
    const transaction = db.transaction('events', 'readwrite');
    const unsyncedEntities = await transaction.store.index('unsynced').getAll();

    const unsyncedMap = new Map<string, HitpointsEvent[]>();

    // 30 seconds ago
    const timeout = new Date(Date.now() - 30_000);

    await Promise.all(
        unsyncedEntities.map(async storedEvents => {
            // All events that have never been synced or the previous sync wasn't completed
            const unsyncedEvents = [...storedEvents.events.values()]
                .filter(event => {
                    if (event.version) {
                        return false;
                    }

                    const syncTime = storedEvents.syncing.get(event.id);

                    return !syncTime || timeout > syncTime;
                })
                .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

            if (unsyncedEvents.length) {
                unsyncedMap.set(storedEvents.id, unsyncedEvents);

                unsyncedEvents.forEach(event => {
                    storedEvents.syncing.set(event.id, new Date());
                });

                await transaction.store.put(storedEvents);
            }
        }),
    );

    return unsyncedMap;
}
