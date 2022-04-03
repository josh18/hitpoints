import { useCallback } from 'react';

import { ShoppingListEvent, shoppingListId } from '@hitpoints/shared';

import { DistributiveOmit } from '../../util/types';
import { useDispatch } from '../../util/useDispatch';
import { uuid } from '../../util/uuid';

export type PartialShoppingListEvent = DistributiveOmit<ShoppingListEvent, 'id' | 'entityId' | 'timestamp'>;

export function useUpdateShoppingList() {
    const dispatch = useDispatch();

    return useCallback((event: PartialShoppingListEvent) => {
        dispatch({
            ...event,
            id: uuid(),
            entityId: shoppingListId,
            timestamp: new Date().toISOString(),
        });
    }, [dispatch]);
}
