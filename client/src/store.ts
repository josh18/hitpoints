import { applyMiddleware, combineReducers, createStore, Dispatch as DispatchBase, MiddlewareAPI } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

import { connectionMiddleware } from './api/connection.middleware';
import { connectedReducer } from './api/connection.state';
import { eventMiddleware } from './api/event.middleware';
import { errorReducer } from './modules/notification/error.state';
import { activeRecipeReducer } from './modules/recipe/activeRecipe.state';
import { activeShoppingListReducer } from './modules/shoppingList/activeShoppingList.state';

const rootReducer = combineReducers({
    connected: connectedReducer,
    error: errorReducer,
    activeRecipe: activeRecipeReducer,
    shoppingList: activeShoppingListReducer,
});

const middleware = [
    connectionMiddleware,
    eventMiddleware,
];

export type StoreState = ReturnType<typeof rootReducer>;
export type StoreEvents = Parameters<typeof rootReducer>[1];
export type Dispatch = DispatchBase<StoreEvents>;

export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(...middleware)));

export type Middleware = (api: MiddlewareAPI<Dispatch, StoreState>) => (next: Dispatch) => (event: StoreEvents) => StoreEvents;
