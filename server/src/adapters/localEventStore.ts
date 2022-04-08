import { EventStoreItem } from '../core/eventItem';
import { once } from '../util/once';
import { EventConflictError, EventStore } from './eventStore';
import { getDb } from './localDatabase';

const getStatements = once(async () => {
    const db = await getDb();

    return {
        selectForEntity: db.prepare('SELECT * FROM events WHERE entityId = ?'),
        selectEvents: db.prepare('SELECT * FROM events'),
        selectEventsWithCursor: db.prepare('SELECT * FROM events WHERE timestamp > @cursor'),
        insert: db.prepare(`
            INSERT INTO events (id, entityId, version, type, data, timestamp, entityType)
            VALUES (@id, @entityId, @version, @type, @data, @timestamp, @entityType)
        `),
    };
});

const getError = once(async () => {
    const { SqliteError } = await import('better-sqlite3');

    return SqliteError;
});

export class LocalEventStore extends EventStore {
    async getEventsForEntity(id: string): Promise<EventStoreItem[]> {
        const statements = await getStatements();

        return statements.selectForEntity.all(id);
    }

    async getEvents(cursor?: string): Promise<EventStoreItem[]> {
        const statements = await getStatements();

        if (cursor) {
            return statements.selectEventsWithCursor.all({ cursor });
        } else {
            return statements.selectEvents.all();
        }
    }

    async saveEvents(items: EventStoreItem[]): Promise<void> {
        const [db, statements, SqliteError] = await Promise.all([
            getDb(),
            getStatements(),
            getError(),
        ]);

        try {
            db.transaction(() => {
                items.forEach(item => statements.insert.run(item));
            })();
        } catch (error) {
            if (error instanceof SqliteError && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                throw new EventConflictError(items[0].id, items[0].version);
            }

            throw error;
        }
    }
}
