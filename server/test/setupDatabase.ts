import DB from 'better-sqlite3';
import { unlinkSync } from 'fs';
import { join } from 'path';

export default () => {
    const db = new DB(join(__dirname, 'test.db'));

    db.prepare(`
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            entityId TEXT NOT NULL,
            version INTEGER NOT NULL,
            type TEXT NOT NULL,
            data TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            entityType TEXT NOT NULL,
            UNIQUE(entityId, version)
        ) WITHOUT ROWID;
    `).run();

    db.prepare(`
        CREATE INDEX IF NOT EXISTS entityId
        ON events (entityId);
    `).run();

    return () => {
        unlinkSync(join(__dirname, 'test.db'));
    };
};
