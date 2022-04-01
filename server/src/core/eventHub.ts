import { Injectable, Logger } from '@nestjs/common';
import { concat, filter, from, Observable, Subject } from 'rxjs';

import { EventValidator, HitpointsEvent, recipeValidator, shoppingListValidator } from '@hitpoints/shared';

import { EventConflictError, EventStore } from '../adapters/eventStore';
import { toEvent, toStoreItem } from './eventItem';

export interface FailedEvent {
    eventId: string;
    error: string;
}

interface EventsResult<EventTypes extends HitpointsEvent> {
    validEvents: EventTypes[];
    failedEvents: FailedEvent[];
}

@Injectable()
export class EventHub {
    private eventsSubject = new Subject<HitpointsEvent[]>();
    private logger = new Logger(EventHub.name);
    private eventValidators: EventValidator[] = [
        shoppingListValidator,
        recipeValidator,
    ];

    constructor(
        private eventStore: EventStore,
    ) { }

    events$(cursor?: string): Observable<HitpointsEvent[]> {
        const getEvents = async (): Promise<HitpointsEvent[]> => {
            const items = await this.eventStore.getEvents(cursor);

            return items.map(event => toEvent(event));
        };

        return concat(
            from(getEvents()),
            this.eventsSubject,
        ).pipe(
            filter(events => !!events.length),
        );
    }

    async addEvents(entityId: string, events: HitpointsEvent[]): Promise<FailedEvent[]> {
        const validator = this.eventValidators.find(validator => validator.matches(events[0]));

        if (!validator) {
            this.logger.error(`Could not find event validator for ${events[0].type}`);

            return events.map(event => ({
                eventId: event.id,
                error: 'Could not find event validator',
            }));
        }

        let attempts = 0;
        let retry = true;
        while (retry) {
            attempts++;
            retry = attempts <= 5;

            try {
                const items = await this.eventStore.getEventsForEntity(entityId);
                const existingEvents = items
                    .sort((a, b) => a.version - b.version)
                    .map(event => toEvent(event));

                const { failedEvents, validEvents } = this.validateEvents(entityId, existingEvents, events, validator);

                // Retry failed events
                if (failedEvents.length && retry) {
                    continue;
                }

                // Save any valid events
                if (validEvents.length) {
                    await this.eventStore.saveEvents(validEvents.map(event => toStoreItem(event, validator.entityType)));

                    this.eventsSubject.next(validEvents);
                }

                // Return any failed events
                return failedEvents;
            } catch (error) {
                if (error instanceof EventConflictError && retry) {
                    continue;
                }

                throw error;
            }
        }

        // Will never get here
        return [];
    }

    /** Validates a list of events. */
    private validateEvents(
        entityId: string,
        existingEvents: HitpointsEvent[],
        nextEvents: HitpointsEvent[],
        validator: EventValidator,
    ): EventsResult<HitpointsEvent> {
        const result: EventsResult<HitpointsEvent> = {
            failedEvents: [],
            validEvents: [],
        };

        let version = existingEvents.length;

        let state = existingEvents.reduce(
            (state, event) => validator.reducer(state, this.parseEvent(validator, event)),
            validator.initialState(),
        );

        const existingIds = new Set(existingEvents.map(event => event.id));

        nextEvents.forEach(event => {
            if (event.entityId !== entityId) {
                throw new Error('Event id does not match provided id');
            }

            // The event has already been saved but the client wasn't updated
            if (existingIds.has(event.id)) {
                this.logger.warn({
                    message: `Dropped event ${event.id} as it already exists.`,
                });
                return;
            }

            try {
                event = this.parseEvent(validator, event);
                state = validator.reducer(state, event);

                version++;
                event.version = version;
                result.validEvents.push(event);
            } catch (error) {
                const message = (error as Error).message;

                result.failedEvents.push({
                    eventId: event.id,
                    error: message,
                });

                this.logger.warn({
                    message: 'Dropped event',
                    event,
                    error: message,
                });
            }
        });

        return result;
    }

    private parseEvent(validator: EventValidator, event: HitpointsEvent): HitpointsEvent {
        const eventSchema = validator.eventSchema(event.type);

        if (!eventSchema) {
            throw new Error(`Unknown event: ${event.type}`);
        }

        const result = eventSchema.safeParse(event);

        if (!result.success) {
            this.logger.error({
                message: 'Event validation error',
                event,
                errors: result.error.issues,
            });

            throw new Error('Invalid event');
        }

        return result.data;
    }
}
