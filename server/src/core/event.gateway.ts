import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
    AddEventsRequest,
    AddEventsResponse,
    EventApi,
    SyncEventsRequest,
    SyncEventsResponse,
} from '@hitpoints/shared';

import { EventHub } from './eventHub';

interface Request<T> {
    requestId: number;
    data: T;
}

type Response<T> = {
    requestId: number;
    data: T;
} | {
    requestId: number;
    error: string;
};

type Async<T> = Promise<T> | Observable<T> | T;

type EventGatewayApi = {
    [Key in keyof EventApi]: (request: Request<EventApi[Key]['request']>) => Async<Response<EventApi[Key]['response']>>;
};

@WebSocketGateway()
export class EventGateway implements EventGatewayApi {
    constructor(
        private eventHub: EventHub,
    ) { }

    @SubscribeMessage('syncEvents')
    syncEvents(@MessageBody() { data, requestId }: Request<SyncEventsRequest>): Observable<Response<SyncEventsResponse>> {
        return this.eventHub.events$(data.cursor).pipe(
            map(events => {
                const cursor = events.reduce((a, b) => {
                    return a.timestamp > b.timestamp ? a : b;
                }).timestamp;

                return {
                    data: {
                        cursor,
                        events,
                    },
                    requestId,
                };
            }),
        );
    }

    @SubscribeMessage('addEvents')
    async addEvents(@MessageBody() { data, requestId }: Request<AddEventsRequest>): Promise<Response<AddEventsResponse>> {
        const failed = await this.eventHub.addEvents(data.id, data.events);

        return {
            requestId,
            data: {
                failed,
            },
        };
    }
}
