import {
    AddEventsRequest,
    buildPinnedRecipes,
    buildRecipe,
    buildShoppingList,
    eventEntityType,
    HitpointsEntityType,
    HitpointsEvent,
    isHitpointsEvent,
    isPinnedRecipesEvent,
    isRecipeEvent,
    isShoppingListEvent,
    Recipe,
    ShoppingList,
} from '@hitpoints/shared';

import { keyVal } from '../clientDatabase/client.db';
import { addEvent, addSyncedEvents, checkoutUnsavedEvents, removeFailedEvents } from '../clientDatabase/event.db';
import { putPinnedRecipes, updatePinnedRecipes } from '../clientDatabase/pinnedRecipes.db';
import { deleteRecipe, putRecipe, updateRecipe } from '../clientDatabase/recipe.db';
import { putShoppingList, updateShoppingList } from '../clientDatabase/shoppingList.db';
import { Middleware } from '../store';
import { connection } from './connection';

export interface RecipeViewUpdated {
    type: 'RecipeViewUpdated';
    recipe: Recipe;
}

export interface ShoppingListViewUpdated {
    type: 'ShoppingListViewUpdated';
    shoppingList: ShoppingList;
}

export interface PinnedRecipesViewUpdated {
    type: 'PinnedRecipesViewUpdated';
    pinnedRecipes: string[];
}

const syncCursorKey = 'eventSyncCursor';

function syncEventsFromServer(onUpdate: (events: HitpointsEvent[]) => void) {
    const request = async () => {
        const cursor = await keyVal.get(syncCursorKey);

        return { cursor };
    };

    connection.subscribe('syncEvents', request, async result => {
        await keyVal.set(syncCursorKey, result.cursor);

        const updatedEvents = await addSyncedEvents(result.events);
        updatedEvents.forEach(events => onUpdate(events));
    });
}

function sendEventsToServer(
    entityId: string,
    events: HitpointsEvent[],
    onUpdate: (events: HitpointsEvent[]) => void,
    onDelete: (entityType: HitpointsEntityType, entityId: string) => void,
    onError: (errors: string[]) => void,
) {
    const data: AddEventsRequest = { id: entityId, events };

    connection.request('addEvents', data, async response => {
        const failed = response.failed;
        if (!failed.length) {
            return;
        }

        onError(failed.map(({ error }) => error));

        const validEvents = await removeFailedEvents(entityId, failed.map(({ eventId }) => eventId));

        if (validEvents.length) {
            onUpdate(validEvents);
        } else {
            onDelete(eventEntityType(events[0]), entityId);
        }
    });
}

async function sendUnsavedEventsToServer(
    onUpdate: (events: HitpointsEvent[]) => void,
    onDelete: (entityType: HitpointsEntityType, entityId: string) => void,
    onError: (errors: string[],
) => void) {
    const unsavedEvents = await checkoutUnsavedEvents();

    for (const [entityId, events] of unsavedEvents) {
        sendEventsToServer(entityId, events, onUpdate, onDelete, onError);
    }
}

export const eventMiddleware: Middleware = ({ getState, dispatch }) => {
    const onUpdate = (events: HitpointsEvent[]) => {
        if (events.every(isRecipeEvent)) {
            const recipe = buildRecipe(events);

            dispatch({
                type: 'RecipeViewUpdated',
                recipe,
            });

            putRecipe(recipe);
        }

        if (events.every(isShoppingListEvent)) {
            const shoppingList = buildShoppingList(events);

            dispatch({
                type: 'ShoppingListViewUpdated',
                shoppingList,
            });

            putShoppingList(shoppingList);
        }

        if (events.every(isPinnedRecipesEvent)) {
            const pinnedRecipes = buildPinnedRecipes(events);

            dispatch({
                type: 'PinnedRecipesViewUpdated',
                pinnedRecipes,
            });

            putPinnedRecipes(pinnedRecipes);
        }
    };

    const onDelete = async (entityType: HitpointsEntityType, entityId: string) => {
        if (entityType === 'recipe') {
            await deleteRecipe(entityId);
        }
    };

    const onError = (errors: string[]) => {
        dispatch({
            type: 'ShowError',
            message: errors,
        });
    };

    syncEventsFromServer(onUpdate);

    return next => event => {
        if (event.type === 'Connected') {
            sendUnsavedEventsToServer(onUpdate, onDelete, onError);
        }

        if (isHitpointsEvent(event)) {
            const connected = getState().connected;

            addEvent(event, connected);

            if (connected && !event.version) {
                sendEventsToServer(event.entityId, [event], onUpdate, onDelete, onError);
            }
        }

        if (isRecipeEvent(event)) {
            updateRecipe(event);
        }

        if (isShoppingListEvent(event)) {
            updateShoppingList(event);
        }

        if (isPinnedRecipesEvent(event)) {
            updatePinnedRecipes(event);
        }

        return next(event);
    };
};
