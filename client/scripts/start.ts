process.env.NODE_ENV = 'development';

import chalk from 'chalk';
import { webpack } from 'webpack';
import WebpackDevServer, { Configuration } from 'webpack-dev-server';

import { formatError, formatWarning } from './format';
import { paths } from './paths';
import { config } from './webpack.config';

const port = 8080;

const compiler = webpack({
    ...config({
        isProduction: false,
    }),
    infrastructureLogging: {
        level: 'none',
    },
    stats: 'none',
});

const serverConfig: Configuration = {
    static: paths.public,
    proxy: {
        '/api': {
            target: 'http://localhost',
            ws: true,
        },
    },
    client: {
        overlay: {
            errors: true,
            warnings: false,
        },
    },
    host: '0.0.0.0',
    port,
    historyApiFallback: true,
};

console.clear();
compiler.hooks.done.tap('start.ts', stats => {
    const url = `http://localhost:${serverConfig.port}`;

    console.clear();
    console.log(`Serving on ${chalk.cyan(url)}`);
    console.log();

    const info = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
    });

    if (info.errors?.length) {
        console.log(chalk.red('👎 Bad'));
        console.log();
        console.log(info.errors.map(formatError).join('\n\n'));
    } else if (info.warnings?.length) {
        console.log(chalk.yellow('🤔 Maybe?'));
        console.log();
        console.log(info.warnings.map(formatWarning).join('\n\n'));
    } else {
        console.log(chalk.green('👍 Good'));
    }

    console.log();
});

const server = new WebpackDevServer(serverConfig, compiler);
server.start();
