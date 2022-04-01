import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import http from 'http';

import { AppModule } from './app.module';
import { config } from './config';
import { WebSocketAdapter } from './core/websocketAdapter';

async function bootstrap(): Promise<void> {
    const server = express();

    const httpServer = http.createServer(server).listen(config().port);

    const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(server),
    );

    app.useWebSocketAdapter(new WebSocketAdapter(httpServer));

    await app.init();
}

bootstrap();
