import type { Database } from 'better-sqlite3';

import { once } from '../util/once';
import { localConfig } from './localConfig';

export const getDb: () => Promise<Database> = once(async () => {
    const { default: DB } = await import('better-sqlite3');

    return new DB(localConfig().dbPath);
});
