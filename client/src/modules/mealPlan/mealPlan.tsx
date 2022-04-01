import { useState } from 'react';

import { Button } from '../../components/button';
import { Card } from '../../components/card';
import { TextInput } from '../../components/textInput';
import { useTitle } from '../../util/useTitle';

export function MealPlan() {
    const [value, setValue] = useState('');
    const [count, setCount] = useState(0);

    useTitle('Meal Plan');

    return (
        <Card style={{ padding: '32px' }}>
            <TextInput value={value} onCommit={setValue} onEnter={() => setCount(count + 1)} />

            <hr />

            <Button onClick={() => setTimeout(() => setValue('test'), 2000)}>Test</Button>

            <p>{count}</p>
        </Card>
    );
}
