import { HitpointsEvent } from '..';

export function orderEvents(a: HitpointsEvent, b: HitpointsEvent) {
    if (!a.version && !b.version) {
        return a.timestamp.localeCompare(b.timestamp);
    }

    if (!a.version) {
        return 1;
    }

    if (!b.version) {
        return -1;
    }

    return a.version - b.version;
}
