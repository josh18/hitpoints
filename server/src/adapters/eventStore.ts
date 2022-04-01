import { EventStoreItem } from '../core/eventItem';

type Resolvable<T> = T | Promise<T>;

export class EventConflictError extends Error {
    constructor(id: string, version: number) {
        super(`Event conflict error - ${id} version ${version}`);
        this.name = 'EventConflictError';
    }
}

export abstract class EventStore {
    abstract getEventsForEntity(id: string): Resolvable<EventStoreItem[]>;
    abstract getEvents(cursor?: string): Resolvable<EventStoreItem[]>;
    abstract saveEvents(events: EventStoreItem[]): Resolvable<void>;
}
