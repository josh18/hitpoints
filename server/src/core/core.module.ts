import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import multer from 'multer';

import { EventStore } from '../adapters/eventStore';
import { ImageStore } from '../adapters/imageStore';
import { config } from '../config';
import { EventGateway } from './event.gateway';
import { EventHub } from './eventHub';
import { ImageController } from './image/image.controller';
import { ImageService } from './image/image.service';
import { ConnectionGateway } from './ping.gateway';

@Global()
@Module({
    controllers: [ImageController],
    providers: [
        ConnectionGateway,
        EventGateway,
        EventHub,
        ImageService,
        {
            provide: ImageStore,
            useClass: config().adapters.imageStore,
        }, {
            provide: EventStore,
            useClass: config().adapters.eventStore,
        },
    ],
    imports: [
        MulterModule.register({
            storage: multer.memoryStorage(),
        }),
    ],
    exports: [
        ImageService,
        EventHub,
        EventStore,
    ],
})
export class CoreModule { }
