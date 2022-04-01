import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { getDatabase } from '../../../localDatabase/local.db';
import { useDispatch } from '../../../util/useDispatch';
import { useSelector } from '../../../util/useSelector';

export function useActiveRecipe() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [recipeNotFound, setRecipeNotFound] = useState(false);

    if (!id) {
        throw new Error('No recipe id set');
    }

    useEffect(() => {
        let cancelled = false;

        dispatch({
            type: 'ActiveRecipeViewSet',
            id,
        });

        const open = async (id: string) => {
            const db = await getDatabase();
            const recipe = await db.get('recipes', id);

            if (cancelled) {
                return;
            }

            if (!recipe) {
                setRecipeNotFound(true);
                return;
            }

            dispatch({
                type: 'ActiveRecipeViewUpdated',
                recipe,
            });
        };

        if (id) {
            open(id);
        }

        return () => {
            cancelled = true;

            dispatch({
                type: 'ActiveRecipeViewUnset',
            });
        };
    }, [id, dispatch]);

    const recipe = useSelector(state => state.activeRecipe.recipe);

    return { recipe, recipeNotFound };
}
