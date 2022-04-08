import { z, ZodType } from 'zod';

import { HitpointsEntityType } from './index.js';
import { isISOString } from './validation/iso8601.js';

export const HitpointsEvent = z.object({
    id: z.string().uuid(),
    entityId: z.string().uuid(),
    version: z.number().int().min(1).optional(),
    type: z.string().min(3),
    timestamp: z.string().refine(isISOString, { message: 'Unexpected timestamp format' }),
});

export type HitpointsEvent = z.infer<typeof HitpointsEvent>;

export interface EventValidator<EventTypes extends HitpointsEvent = HitpointsEvent, ValidationState = unknown> {
    entityType: HitpointsEntityType;
    eventSchema(type: EventTypes['type']): ZodType<EventTypes> | undefined;
    matches(event: HitpointsEvent): boolean;
    initialState(): ValidationState;
    reducer(state: ValidationState, event: EventTypes): ValidationState;
}
