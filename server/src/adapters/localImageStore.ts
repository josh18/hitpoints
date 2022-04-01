import { createReadStream, createWriteStream } from 'fs';
import path from 'path';
import { Readable, Writable } from 'stream';

import { ImageStore } from './imageStore';
import { localConfig } from './localConfig';

export class LocaleImageStore extends ImageStore {
    getImage(name: string): Readable {
        return createReadStream(this.imagePath(name));
    }

    getResizedImage(name: string): Readable {
        return createReadStream(this.imageResizePath(name));
    }

    storeImage(name: string): Writable {
        return createWriteStream(this.imagePath(name));
    }

    storeResizedImage(name: string): Writable {
        return createWriteStream(this.imageResizePath(name));
    }

    isNotFoundError(error: any): boolean {
        return error.code === 'ENOENT';
    }

    private imagePath(name: string): string {
        return path.join(localConfig().imagesDir, name);
    }

    private imageResizePath(name: string): string {
        return path.join(localConfig().resizedImagesDir, name);
    }
}
