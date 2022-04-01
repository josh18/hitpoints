import { WebSocketAdapter as BaseAdapter, Logger } from '@nestjs/common';
import { MessageMappingProperties } from '@nestjs/websockets/gateway-metadata-explorer';
import http from 'http';
import { Socket } from 'net';
import { EMPTY, fromEvent, Observable } from 'rxjs';
import { filter, first, mergeMap, share, takeUntil } from 'rxjs/operators';
import { WebSocket, WebSocketServer } from 'ws';

import { isAuthorized } from '../auth/isAuthorized';

export class WebSocketAdapter implements BaseAdapter<WebSocketServer, WebSocket> {
    private logger = new Logger(WebSocketAdapter.name);

    constructor(
        private server: http.Server,
    ) { }

    create(): WebSocketServer {
        const wss = new WebSocketServer({
            noServer: true,
            path: '/api',
        });

        this.server.on('upgrade', (request, socket, head) => {
            wss.handleUpgrade(request, socket as Socket, head, ws => {
                if (!isAuthorized(request)) {
                    ws.close(4000, 'Authentication failed');
                    return;
                }

                ws.send(JSON.stringify({ SOCKET_IS_OPEN: true }));
                wss.emit('connection', ws, request);
            });
        });

        wss.on('error', error => this.logger.error(error));

        return wss;
    }

    bindMessageHandlers(
        client: WebSocket,
        handlers: MessageMappingProperties[],
        transform: (data: unknown) => Observable<unknown>,
    ): void {
        const close$ = fromEvent(client, 'close').pipe(share(), first());
        const source$ = fromEvent(client, 'message').pipe(
            mergeMap(data =>
                this.bindMessageHandler(data as MessageEvent, handlers, transform).pipe(
                    filter(result => !!result),
                ),
            ),
            takeUntil(close$),
        );

        source$.subscribe((response: unknown): void => {
            if (client.readyState !== WebSocket.OPEN) {
                return;
            }

            client.send(JSON.stringify(response));
        });
    }

    bindClientConnect(server: WebSocketServer, callback: () => void): void {
        server.on('connection', callback);
    }

    bindClientDisconnect(client: WebSocket, callback: () => void): void {
        client.on('close', callback);
    }

    close(server: WebSocketServer): void {
        server.close();
    }

    private bindMessageHandler(
        buffer: MessageEvent,
        handlers: MessageMappingProperties[],
        transform: (data: unknown) => Observable<unknown>,
    ): Observable<unknown> {
        const message = JSON.parse(buffer.data);
        const messageHandler = handlers.find(
            handler => handler.message === message.type,
        );

        if (!messageHandler) {
            return EMPTY;
        }

        return transform(messageHandler.callback({
            data: message.data,
            requestId: message.requestId,
        }));
    }
}
