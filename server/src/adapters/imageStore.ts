import { Readable, Writable } from 'stream';

export abstract class ImageStore {
    abstract getImage(name: string): Readable;
    abstract getResizedImage(name: string): Readable;
    abstract storeImage(name: string): Writable;
    abstract storeResizedImage(name: string): Writable;
    abstract isNotFoundError(error: any): boolean;
}
