import { ApiSchema } from '@hitpoints/shared';

import { demoMode } from '../config';
import { Subject } from '../util/subject';
import { Unsubscribe } from '../util/types';
import { auth } from './auth';

let requestIdCounter = 0;

interface ServerMessage<T = unknown> {
    requestId: number;
    data: T;
}

interface ServerError {
    requestId: number;
    error: string;
}

function isError(response: ServerMessage | ServerError): response is ServerError {
    return (response as ServerError).error !== undefined;
}

const websocketUrl = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api`;
const idleTimeout = 30_000;

export class Connection {
    statusEvents = new Subject<boolean>();
    unhandledErrorEvents = new Subject<{ type: string, error: string }>();

    private socket?: WebSocket;
    private messageEvents = new Subject<ServerMessage | ServerError>();
    private waitingToReconnect = false;
    private idle = false;

    private get connected() {
        return this.socket && this.socket.readyState === this.socket.OPEN;
    }

    constructor() {
        if (demoMode) {
            return;
        }

        this.startPings();

        const startTimer = () => window.setTimeout(() => {
            this.idle = true;
            this.disconnect();
        }, idleTimeout);

        let timeoutId = startTimer();

        const onAction = () => {
            this.idle = false;
            window.clearTimeout(timeoutId);

            timeoutId = startTimer();

            if (!this.socket) {
                this.connect();
            }
        };

        window.addEventListener('mousemove', onAction, { passive: true });
        window.addEventListener('keydown', onAction, { passive: true });

        auth.authenticatedEvents.subscribe(authenticated => {
            if (authenticated) {
                this.connect();
            } else {
                this.disconnect();
            }
        });

        this.connect();
    }

    /**
     * @param data If a function is provided it will be called whenever a new connection is established.
     * @returns A function that can be used to unsubscribe.
     */
    subscribe<
        Type extends keyof ApiSchema,
        Data extends ApiSchema[Type]['request'],
        Response extends ApiSchema[Type]['response'],
    >(
        type: Type,
        data: Data | (() => Data | Promise<Data>),
        handler: (response: Response) => void,
        errorHandler?: (error: string) => void,
    ): Unsubscribe {
        let unsubscribeFromMessages = () => { return; };

        const start = async () => {
            if (typeof data === 'function') {
                data = await data();
            }

            const requestId = this.send(type, data);

            if (!requestId) {
                return;
            }

            unsubscribeFromMessages();

            unsubscribeFromMessages = this.messageEvents.subscribe(message => {
                if (message.requestId !== requestId) {
                    return;
                }

                if (isError(message)) {
                    if (errorHandler) {
                        errorHandler(message.error);
                    } else {
                        this.unhandledErrorEvents.emit({ type, error: message.error });
                    }

                    return;
                }

                handler(message.data as Response);
            });
        };

        // If the socket is already connected then we can subscribe straight away
        if (this.connected) {
            start();
        }

        // Reconnect whenever the socket is opened
        const unsubscribeFromStatus = this.statusEvents.subscribe(connected => {
            if (connected) {
                start();
            }
        });

        return () => {
            unsubscribeFromStatus();
            unsubscribeFromMessages();
        };
    }

    /**
     * @returns A function that can be used to unsubscribe.
     */
    request<
        Type extends keyof ApiSchema,
        Data extends ApiSchema[Type]['request'],
        Response extends ApiSchema[Type]['response'],
    >(
        type: Type,
        data: Data,
        handler: (response: Response) => void,
        errorHandler?: (error: string) => void,
    ): Unsubscribe {
        let timeoutId: number | undefined;

        const unsubscribe = this.subscribe<Type, Data, Response>(
            type,
            () => {
                timeoutId = window.setTimeout(() => {
                    console.error('Server never responded to request', type, data);
                    unsubscribe();
                }, 10000);

                return data;
            },
            response => {
                unsubscribe();
                window.clearTimeout(timeoutId);

                handler(response);
            },
            error => {
                unsubscribe();
                window.clearTimeout(timeoutId);

                if (errorHandler) {
                    errorHandler(error);
                } else {
                    this.unhandledErrorEvents.emit({ type, error });
                }
            },
        );

        return unsubscribe;
    }

    private connect(): void {
        if (!auth.authenticated || this.idle || this.waitingToReconnect) {
            return;
        }

        if (this.socket) {
            throw new Error('Socket was not disconnected before attempting to create new connection');
        }

        this.socket = new WebSocket(websocketUrl);

        this.socket.addEventListener('close', event => {
            this.socket = undefined;
            this.statusEvents.emit(false);

            if (event.reason === 'Authentication failed') {
                auth.setAuthenticated(false);
            }

            if (auth.authenticated && !this.idle) {
                this.waitingToReconnect = true;
                window.setTimeout(() => {
                    this.waitingToReconnect = false;
                    this.connect();
                }, 5000);
            }
        });

        this.socket.addEventListener('message', ({ data }) => {
            const message = JSON.parse(data);

            if (message.SOCKET_IS_OPEN) {
                this.statusEvents.emit(true);
            }

            this.messageEvents.emit(message as ServerMessage | ServerError);
        });
    }

    private disconnect(): void {
        this.socket?.close();
        this.socket = undefined;
    }

    private send(type: string, data: unknown): number | undefined {
        if (!this.connected || !this.socket) {
            console.error(`Attempted to send ${type} with no connection established.`);
            return;
        }

        const requestId = ++requestIdCounter;

        this.socket.send(JSON.stringify({
            type,
            requestId,
            data,
        }));

        return requestId;
    }

    private startPings(): void {
        let pingTimeoutId: number | undefined;

        const ping = () => {
            window.clearTimeout(pingTimeoutId);

            pingTimeoutId = window.setTimeout(() => {
                this.request('ping', undefined, () => ping(), () => this.socket?.close());
            }, 30000);
        };

        this.statusEvents.subscribe(connected => {
            if (connected) {
                ping();
            } else {
                window.clearTimeout(pingTimeoutId);
            }
        });
    }
}

export const connection = new Connection();
