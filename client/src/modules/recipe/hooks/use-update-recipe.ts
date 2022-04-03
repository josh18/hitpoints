import { useCallback } from 'react';
import { useParams } from 'react-router';

import { RecipeEvent } from '@hitpoints/shared';

import { DistributiveOmit } from '../../../util/types';
import { useDispatch } from '../../../util/useDispatch';
import { uuid } from '../../../util/uuid';

export type PartialRecipeEvent<T extends RecipeEvent> = DistributiveOmit<T, 'id' | 'entityId' | 'timestamp'> & { recipeId?: string; };

export function useUpdateRecipe() {
    const { id } = useParams();
    const dispatch = useDispatch();

    return useCallback(({ recipeId, ...event }: PartialRecipeEvent<RecipeEvent>) => {
        const entityId = recipeId ?? id;
        if (!entityId) {
            throw new Error('No recipe id set');
        }

        dispatch({
            ...event,
            id: uuid(),
            entityId,
            timestamp: new Date().toISOString(),
        });
    }, [id, dispatch]);
}
