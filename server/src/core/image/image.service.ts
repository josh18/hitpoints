import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { PassThrough, Readable } from 'stream';
import { v4 as uuid } from 'uuid';

import { ImageStore } from '../../adapters/imageStore';

@Injectable()
export class ImageService {
    constructor(
        private imageStore: ImageStore,
    ) { }

    getResized(id: string, width: number, height: number): Readable {
        const readable = new PassThrough();

        this.imageStore.getResizedImage(this.resizedName(id, width, height))
            .on('error', () => {
                this.resize(id, width, height)
                    .on('error', error => {
                        readable.emit('error', error);
                    }).pipe(readable);
            })
            .pipe(readable);

        return readable;
    }

    get(id: string): Readable {
        return this.imageStore.getImage(this.name(id));
    }

    async create(input: Buffer): Promise<string> {
        const id = uuid();

        const writeStream = sharp(input)
            .resize({
                width: 10000,
                height: 10000,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .toFormat('webp')
            .pipe(this.imageStore.storeImage(this.name(id)));

        await new Promise((resolve, reject) => {
            writeStream.once('finish', resolve);
            writeStream.once('error', reject);
        });

        return id;
    }

    private resize(name: string, width: number, height: number): Readable {
        const readable = new PassThrough();

        const imageReadable = this.imageStore.getImage(this.name(name))
            .on('error', error => {
                readable.emit('error', error);
            });

        const resizePipeline = imageReadable.pipe(sharp().resize(width, height))
            .once('data', () => {
                // Only create the write stream if the image is actually resized
                const writeable = this.imageStore.storeResizedImage(this.resizedName(name, width, height));
                resizePipeline.pipe(writeable);
            }).pipe(readable);

        return readable;
    }

    private name(id: string): string {
        return `${id}.webp`;
    }

    private resizedName(id: string, width: number, height: number): string {
        return `${id}-${width}x${height}.webp`;
    }
}
