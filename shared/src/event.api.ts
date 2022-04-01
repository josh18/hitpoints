import { HitpointsEvent } from './event';

export interface SyncEventsRequest {
    cursor?: string;
}

export interface SyncEventsResponse {
    cursor: string;
    events: HitpointsEvent[];
}

export interface AddEventsRequest {
    id: string;
    events: HitpointsEvent[];
}

export interface AddEventsResponse {
    failed: Array<{
        eventId: string;
        error: string;
    }>;
}

export interface EventApi {
    syncEvents: {
        request: SyncEventsRequest;
        response: SyncEventsResponse;
    };
    addEvents: {
        request: AddEventsRequest;
        response: AddEventsResponse;
    };
}
