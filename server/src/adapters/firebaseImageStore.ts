import { Bucket } from '@google-cloud/storage';
import { getStorage } from 'firebase-admin/storage';
import { Readable, Writable } from 'stream';

import { initializeFirebase } from './firebase';
import { ImageStore } from './imageStore';

export class FirebaseImageStore extends ImageStore {
    bucket: Bucket;

    constructor() {
        super();

        initializeFirebase();

        this.bucket = getStorage().bucket();
    }

    getImage(name: string): Readable {
        return this.bucket.file(`images/${name}`).createReadStream({
            validation: false,
        });
    }

    getResizedImage(name: string): Readable {
        return this.bucket.file(`images/resized/${name}`).createReadStream({
            validation: false,
        });
    }

    storeImage(name: string): Writable {
        return this.bucket.file(`images/${name}`).createWriteStream();
    }

    storeResizedImage(name: string): Writable {
        return this.bucket.file(`images/resized/${name}`).createWriteStream();
    }

    isNotFoundError(error: any): boolean {
        return error.code === 404;
    }
}
