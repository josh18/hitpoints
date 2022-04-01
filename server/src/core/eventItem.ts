import { Logger } from '@nestjs/common';
import { z } from 'zod';

import { HitpointsEvent, isJSON } from '@hitpoints/shared';

const logger = new Logger('EventItem');

const eventStoreItem = HitpointsEvent.extend({
    data: z.string().refine(isJSON, { message: 'Invalid JSON string' }),
    entityType: z.string().min(3),
    version: z.number().int().min(1),
});

export type EventStoreItem = z.infer<typeof eventStoreItem>;

function validateEventRow(event: EventStoreItem): void {
    const result = eventStoreItem.safeParse(event);

    if (!result.success) {
        logger.error({
            message: 'Event item validation error',
            event,
            errors: result.error.issues,
        });

        throw new Error('Invalid event data');
    }
}

export function toStoreItem(event: HitpointsEvent, entityType: string): EventStoreItem {
    const { id, entityId, type, timestamp, version, ...data } = event;

    if (!version) {
        throw new Error('Version is required');
    }

    const row = {
        id,
        entityId,
        type,
        timestamp,
        version,
        data: JSON.stringify(data ?? {}),
        entityType,
    };

    validateEventRow(row);

    return row;
}

export function toEvent<TEvent extends HitpointsEvent>(row: EventStoreItem): TEvent {
    const { data, entityType, ...event } = row;

    return {
        ...JSON.parse(data),
        ...event,
    };
}
