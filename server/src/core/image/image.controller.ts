import {
    Controller,
    Get,
    Header,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { Readable } from 'stream';

import { ImageStore } from '../../adapters/imageStore';
import { ImageService } from './image.service';

@Controller('api/images')
export class ImageController {
    private logger = new Logger(ImageController.name);

    constructor(
        private image: ImageService,
        private imageStore: ImageStore,
    ) { }

    @Get(':id')
    @Header('content-type', 'image/webp')
    @Header('cache-control', 'max-age=86400')
    get(
        @Param('id') id: string,
        @Query('width') width: string,
        @Query('height') height: string,
        @Res() response: Response,
    ): void {
        let imageStream: Readable;
        if (width && height) {
            imageStream = this.image.getResized(id, Number(width), Number(height));
        } else {
            imageStream = this.image.get(id);
        }

        imageStream.on('error', error => {
            if (this.imageStore.isNotFoundError(error)) {
                response.type('text/plain');
                response.status(HttpStatus.NOT_FOUND).send(`Image ${id} not found`);
                return;
            }

            this.logger.error(error);

            if (response.headersSent) {
                response.end();
                return;
            }

            response.type('text/plain');
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }).pipe(response);
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async upload(@UploadedFile() file?: Express.Multer.File): Promise<{ id: string }> {
        if (!file) {
            throw new HttpException('Image field is required', HttpStatus.BAD_REQUEST);
        }

        try {
            const id = await this.image.create(file.buffer);

            return { id };
        } catch (error) {
            console.error(error);
            throw new HttpException((error as Error).message, HttpStatus.BAD_REQUEST);
        }
    }
}
