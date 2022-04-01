import { Type } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { EventStore } from './adapters/eventStore';
import { FirebaseEventStore } from './adapters/firebaseEventStore';
import { FirebaseImageStore } from './adapters/firebaseImageStore';
import { ImageStore } from './adapters/imageStore';
import { LocalEventStore } from './adapters/localEventStore';
import { LocaleImageStore } from './adapters/localImageStore';
import { once } from './util/once';

export interface Config {
    isDevelopment: boolean;
    port: number;
    auth?: {
        password: string;
        token: string;
    };
    adapters: {
        imageStore: Type<ImageStore>;
        eventStore: Type<EventStore>;
    };
}

function developmentConfig(): Config {
    function auth(): Config['auth'] {
        const __dirname = fileURLToPath(new URL('.', import.meta.url));

        try {
            const authFile = fs.readFileSync(path.join(__dirname, '../../.auth'), 'utf8');

            const authData = authFile.split('\n')
                .reduce((data, line) => {
                    const [key, value] = line.split('=');

                    if (key && value) {
                        data[key] = value;
                    }

                    return data;
                }, {} as Record<string, string>);

            return {
                password: authData['AUTH_PASSWORD'],
                token: authData['AUTH_TOKEN'],
            };
        } catch { }
    }

    const config: Config = {
        isDevelopment: true,
        port: 80,
        auth: auth(),
        adapters: {
            imageStore: LocaleImageStore,
            eventStore: LocalEventStore,
        },
    };

    return config;
}

function productionConfig(): Config {
    if (!process.env.PORT) {
        throw new Error('PORT is not set');
    }

    if (!process.env.AUTH_PASSWORD) {
        throw new Error('AUTH_PASSWORD is not set');
    }

    if (!process.env.AUTH_TOKEN) {
        throw new Error('AUTH_TOKEN is not set');
    }

    return {
        isDevelopment: false,
        port: Number(process.env.PORT),
        auth:{
            password: process.env.AUTH_PASSWORD,
            token: process.env.AUTH_TOKEN,
        },
        adapters: {
            imageStore: FirebaseImageStore,
            eventStore: FirebaseEventStore,
        },
    };
}

export const config = once(() => {
    return process.env.NODE_ENV === 'development' ? developmentConfig() : productionConfig();
});
