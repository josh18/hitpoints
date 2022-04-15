import { deleteDB } from 'idb';

import { Button } from '../components/button';
import { ReplayIcon } from '../icons/replayIcon';
import { getDatabase } from '../localDatabase/client.db';
import { useTitle } from '../util/useTitle';

export function Advanced() {
    useTitle('Advanced');

    const reset = async () => {
        const db = await getDatabase();
        db.close();

        await deleteDB('hitpoints', {
            blocked: () => location.reload(),
        });

        location.reload();
    };

    return (
        <Button onClick={reset}>
            <ReplayIcon /> Reset local data
        </Button>
    );
}
