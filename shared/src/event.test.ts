import { describe, expect, test } from 'vitest';
import { SafeParseError } from 'zod';

import { HitpointsEvent } from './event.js';

describe('HitpointsEvent', () => {
    test('it passes validation on valid event', () => {
        const result = HitpointsEvent.safeParse({
            id: '18397af6-12d6-422c-8dd6-87b10d02c8e3',
            entityId: '222ce4ad-424f-4010-98cb-c03e57e21780',
            version: 1,
            type: 'Test',
            timestamp: '2000-01-01T00:00:00.000Z',
        });

        expect(result.success).toBe(true);
    });

    test('it fails validation on invalid event', () => {
        const result = HitpointsEvent.safeParse({
            id: 'abc',
            entityId: 'xyz',
            version: 0,
            type: 'A',
            timestamp: '2000',
        });

        expect(result.success).toBe(false);
        expect((result as SafeParseError<unknown>).error.issues.length).toBe(5);
    });
});
