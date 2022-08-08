import { ClientOptions } from 'armoury';
import { resolve } from 'path';

const appPath = process.env.APP_PATH;
const isDemo = process.env.HITPOINTS_DEMO === 'true';
const port = isDemo ? 9090 : 8080;

export const options: ClientOptions = {
    replacementVariables: {
        HITPOINTS_DEMO: isDemo,
        APP_PATH: appPath ?? '',
    },
    start: {
        port,
        staticPaths: [resolve(__dirname, '../docs')],
    },
    build: {
        appPath,
    }
}
