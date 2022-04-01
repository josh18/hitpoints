import { Middleware } from '../store';
import { connection } from './connection';

export const connectionMiddleware: Middleware = ({ dispatch }) => {
    connection.statusEvents.subscribe(connected => {
        if (connected) {
            dispatch({ type: 'Connected' });
        } else {
            dispatch({ type: 'Disconnected' });
        }
    });

    connection.unhandledErrorEvents.subscribe(({ type, error }) => dispatch({
        type: 'ShowError',
        message: `[${type}]: ${error}`,
    }));

    return next => event => next(event);
};
