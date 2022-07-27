import { ClientOptions } from 'armoury';
import { resolve } from 'path';

const publicPath = process.env.PUBLIC_PATH ?? '';
const isDemo = process.env.HITPOINTS_DEMO === 'true';
const port = isDemo ? 9090 : 8080;

export const options: ClientOptions = {
    replacementVariables: {
        HITPOINTS_DEMO: isDemo,
        PUBLIC_PATH: publicPath,
    },
    devServer: {
        port,
        staticPaths: [resolve(__dirname, '../docs')],
    },
}
