import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { EventValidator, HitpointsEvent } from '@hitpoints/shared';

import { FirebaseEventStore } from '../adapters/firebaseEventStore';
import { LocalEventStore } from '../adapters/localEventStore';
import { EventHub } from './eventHub';

const useFirebase = false;

let eventValidators: EventValidator[];
vi.mock('@hitpoints/shared', async () => {
    const actual: any = await vi.importActual('@hitpoints/shared');

    return {
        ...actual,
        get eventValidators() {
            return eventValidators;
        },
    };
});

const warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => vi.fn());

function createEvent(event?: Partial<HitpointsEvent>): HitpointsEvent {
    return {
        id: uuid(),
        entityId: uuid(),
        type: 'test',
        timestamp: new Date().toISOString(),
        ...event,
    };
}

const validator: EventValidator = {
    entityType: 'test' as any,
    eventSchema() {
        return HitpointsEvent;
    },
    matches() {
        return true;
    },
    initialState() {
        return {};
    },
    reducer(state) {
        return state;
    },
};

describe('EventHub', () => {
    const store = useFirebase ? new FirebaseEventStore() : new LocalEventStore();
    const eventHub = new EventHub(store);

    beforeEach(() => {
        eventValidators = [validator];
    });

    test('drops duplicate events', async () => {
        const event = createEvent();

        await eventHub.addEvents(event.entityId, [event]);
        const failed = await eventHub.addEvents(event.entityId, [event]);

        expect(failed).toEqual([]);
        expect(warnSpy).toHaveBeenCalledWith({
            message: `Dropped event ${event.id} as it already exists.`,
        });
    });

    test('retries events', async () => {
        let fail = true;

        const modifiedValidator: EventValidator = {
            ...validator,
            reducer(state) {
                if (fail) {
                    fail = false;
                    throw new Error('Failed validation');
                }

                return state;
            },
        };

        eventValidators = [modifiedValidator];

        const event = createEvent();

        await eventHub.addEvents(event.entityId, [event]);
        const failed = await eventHub.addEvents(event.entityId, [event]);

        expect(failed).toEqual([]);
    });

    test('handles adding events in parallel', async () => {
        const entityId = uuid();
        const event1 = createEvent({ entityId });
        const event2 = createEvent({ entityId });
        const event3 = createEvent({ entityId });

        const [failed1, failed2] = await Promise.all([
            eventHub.addEvents(entityId, [event1]),
            eventHub.addEvents(entityId, [event2, event3]),
        ]);

        expect(failed1).toEqual([]);
        expect(failed2).toEqual([]);

        const events = await store.getEventsForEntity(entityId);
        events.sort((a, b) => a.version - b.version);

        expect(events.map(event => event.version)).toEqual([1, 2, 3]);
        expect(new Set(events.map(event => event.id))).toEqual(new Set([event1.id, event2.id, event3.id]));
    });

    test('publishes events', async () => {
        const cursor = new Date(Date.now() - 10).toISOString();

        const event1 = createEvent();
        const event2 = createEvent();
        const event3 = createEvent();

        await Promise.all([
            eventHub.addEvents(event1.entityId, [event1]),
            eventHub.addEvents(event2.entityId, [event2]),
            eventHub.addEvents(event3.entityId, [event3]),
        ]);

        const events = await firstValueFrom(eventHub.events$(cursor));

        expect(new Set(events)).toEqual(new Set([
            { version: 1, ...event1 },
            { version: 1, ...event2 },
            { version: 1, ...event3 },
        ]));
    });
});
