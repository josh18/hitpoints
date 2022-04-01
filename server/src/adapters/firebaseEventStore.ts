import firestore, { BulkWriterError } from '@google-cloud/firestore';
import assert from 'assert';
import { CollectionGroup, CollectionReference, Firestore, getFirestore } from 'firebase-admin/firestore';

import { EventStoreItem } from '../core/eventItem';
import { EventConflictError, EventStore } from './eventStore';
import { initializeFirebase } from './firebase';

const { GrpcStatus } = firestore;

export class FirebaseEventStore extends EventStore {
    private collection: CollectionReference;
    private db: Firestore;

    constructor() {
        super();

        initializeFirebase();

        this.db = getFirestore();
        this.collection = this.db.collection('entities');
    }

    async getEventsForEntity(id: string): Promise<EventStoreItem[]> {
        const events = this.collection.doc(id).collection('events') as CollectionReference<EventStoreItem>;
        const { docs } = await events.get();

        return docs.map(doc => doc.data());
    }

    async getEvents(cursor?: string): Promise<EventStoreItem[]> {
        const collectionGroup = this.db.collectionGroup('events') as CollectionGroup<EventStoreItem>;

        let snapshot;
        if (cursor) {
            snapshot = await collectionGroup.where('timestamp', '>', cursor).get();
        } else {
            snapshot = await collectionGroup.get();
        }

        return snapshot.docs.map(doc => doc.data());
    }

    async saveEvents(items: EventStoreItem[]): Promise<void> {
        const batch = this.db.batch();
        const events = this.collection.doc(items[0].entityId).collection('events') as CollectionReference<EventStoreItem>;

        items.forEach(item => {
            batch.create(events.doc(item.version.toString()), item);
        });

        try {
            await batch.commit();
        } catch (error) {
            assert(error instanceof Error);

            if ((error as BulkWriterError).code === GrpcStatus.ALREADY_EXISTS) {
                throw new EventConflictError(items[0].entityId, items[0].version);
            }

            throw error;
        }
    }
}
