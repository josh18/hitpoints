import fs from 'fs';

import { localConfig } from '../server/src/adapters/localConfig';
import { getDb } from '../server/src/adapters/localDatabase';

async function createEventsTable(): Promise<void> {
    const db = await getDb();

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
}

function createImagesDirectory(): void {
    if (!fs.existsSync(localConfig().imagesDir)) {
        fs.mkdirSync(localConfig().imagesDir);
    }

    if (!fs.existsSync(localConfig().resizedImagesDir)) {
        fs.mkdirSync(localConfig().resizedImagesDir);
    }
}

createEventsTable();
createImagesDirectory();
