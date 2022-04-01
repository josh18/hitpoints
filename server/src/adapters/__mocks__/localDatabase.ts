import DB, { Database } from 'better-sqlite3';
import { join } from 'path';
import { afterAll } from 'vitest';

const db: Database = new DB(join(__dirname, '../../../test/test.db'), {
    fileMustExist: true,
});

export const getDb = () => db;

afterAll(() => {
    db.close();
});
