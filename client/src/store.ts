import { applyMiddleware, combineReducers, createStore, Dispatch as DispatchBase, MiddlewareAPI } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { PinnedRecipesEvent } from '@hitpoints/shared';

import { connectionMiddleware } from './api/connection.middleware';
import { connectedReducer } from './api/connection.state';
import { eventMiddleware, PinnedRecipesViewUpdated } from './api/event.middleware';
import { commonMiddleware } from './modules/common.middleware';
import { errorReducer } from './modules/notification/error.state';
import { activeRecipeReducer } from './modules/recipe/activeRecipe.state';
import { localPinnedRecipesReducer } from './modules/recipe/pinnedRecipes.state';
import { localShoppingListReducer } from './modules/shoppingList/shoppingList.state';

const rootReducer = combineReducers({
    connected: connectedReducer,
    error: errorReducer,
    activeRecipe: activeRecipeReducer,
    shoppingList: localShoppingListReducer,
    pinnedRecipes: localPinnedRecipesReducer,
});

const middleware = [
    commonMiddleware,
    connectionMiddleware,
    eventMiddleware,
];

export type StoreState = ReturnType<typeof rootReducer>;
export type StoreEvents = Parameters<typeof rootReducer>[1] | PinnedRecipesEvent | PinnedRecipesViewUpdated;
export type Dispatch = DispatchBase<StoreEvents>;
export type Middleware = (api: MiddlewareAPI<Dispatch, StoreState>) => (next: Dispatch) => (event: StoreEvents) => StoreEvents;

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middleware)));
