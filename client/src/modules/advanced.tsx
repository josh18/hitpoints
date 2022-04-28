import { deleteDB } from 'idb';

import { getDatabase } from '../clientDatabase/client.db';
import { Button } from '../components/button';
import { ReplayIcon } from '../icons/replayIcon';
import { useTitle } from '../util/useTitle';

export function Advanced() {
    useTitle('Advanced');

    const reset = async () => {
        try {
            const db = await getDatabase();
            db.close();
        } catch {}

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
