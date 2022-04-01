import { initializeApp } from 'firebase-admin/app';

let initialized = false;
export function initializeFirebase(): void {
    if (initialized) {
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        process.env.GCLOUD_PROJECT = 'hitpoints';
        process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
        process.env.FIRESTORE_EMULATOR_HOST = 'localhost:9090';
    }

    initialized = true;
    initializeApp({
        projectId: 'hitpoints',
        storageBucket: 'hitpoints.appspot.com',
    });
}
