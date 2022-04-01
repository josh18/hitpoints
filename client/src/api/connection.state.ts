export interface Connected {
    type: 'Connected',
}

export interface Disconnected {
    type: 'Disconnected',
}

export type ConnectionEvent = Connected | Disconnected;

export function connectedReducer(connected = false, event: ConnectionEvent) {
    switch (event.type) {
        case 'Connected':
            return true;
        case 'Disconnected':
            return false;
        default:
            return connected;
    }
}
