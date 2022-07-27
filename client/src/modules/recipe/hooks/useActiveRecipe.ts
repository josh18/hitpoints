import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { getRecipe } from '../../../clientDatabase/recipe.db';
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

        const open = async () => {
            const recipe = await getRecipe(id);

            if (cancelled) {
                return;
            }

            if (!recipe) {
                setRecipeNotFound(true);
                return;
            }

            dispatch({
                type: 'ActiveRecipeLoaded',
                recipe,
            });
        };

        open();

        return () => {
            cancelled = true;

            dispatch({
                type: 'ActiveRecipeUnloaded',
            });
        };
    }, [id, dispatch]);

    const recipe = useSelector(state => state.activeRecipe);

    return { recipe, recipeNotFound };
}
