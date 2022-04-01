export interface ShowError {
    type: 'ShowError',
    message: string | string[],
}

export interface HideError {
    type: 'HideError',
}

export type ErrorEvent = ShowError | HideError;

type Errors = string[] | null;

export function errorReducer(errors: Errors = null, event: ErrorEvent): Errors {
    switch (event.type) {
        case 'ShowError': {
            let message = event.message;
            if (typeof message === 'string') {
                message = [message];
            }

            const next = [
                ...message,
                ...errors ?? [],
            ];

            return next.length ? next : null;
        }
        case 'HideError':
            return null;
        default:
            return errors;
    }
}
