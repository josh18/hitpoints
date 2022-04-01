import { deleteDB } from 'idb/with-async-ittr';

import { Button } from '../components/button';
import { ReplayIcon } from '../icons/replayIcon';
import { getDatabase } from '../localDatabase/local.db';

export function Advanced() {
    const reset = async () => {
        const db = await getDatabase();
        db.close();

        deleteDB('hitpoints');
    };

    return (
        <Button onClick={reset}>
            <ReplayIcon /> Reset local data
        </Button>
    );
}
