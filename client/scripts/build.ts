process.env.NODE_ENV = 'production';

import chalk from 'chalk';
import { copySync, emptyDirSync } from 'fs-extra';
import webpack, { WebpackError } from 'webpack';

import { formatError, formatWarning } from './format';
import { paths } from './paths';
import { config } from './webpack.config';

const start = Date.now();

// Clean
emptyDirSync(paths.dist);
// Copy public
copySync(paths.public, paths.dist);
// Build
webpack(config({
    isProduction: true,
    isDemo: process.argv[2] === 'demo',
}), (error, stats) => {
    if (error) {
        console.error(error.stack ?? error);

        if ((error as WebpackError).details) {
            console.error((error as WebpackError).details);
        }

        return;
    }

    if (!stats) {
        return;
    }

    const info = stats.toJson({
        all: false,
        errors: true,
        warnings: true,
        assets: true,
        assetsSort: 'name',
    });

    if (info.errors?.length) {
        console.log(info.errors.map(formatError).join('\n\n'));
        console.log();
    }

    if (info.warnings?.length) {
        console.log(info.warnings.map(formatWarning).join('\n\n'));
        console.log();
    }

    const buildTime = ((Date.now() - start) / 1000).toFixed(1) + 's';

    console.log(`Built in ${chalk.cyan(buildTime)}`);
    if (info.errors?.length) {
        console.log(chalk.red(`${info.errors.length} Error${pluralS(info.errors.length)}`));
    }
    if (info.warnings?.length) {
        console.log(chalk.yellow(`${info.warnings.length} Warning${pluralS(info.warnings.length)}`));
    }

    console.log();

    const assets = info.assets!.filter(asset => asset.type === 'asset');

    const maxNameLength = Math.max(...assets.map(asset => asset.name.length));
    assets.forEach(asset => {
        const size = fileSize(asset.size);

        console.log(`${chalk.cyan(asset.name.padEnd(maxNameLength))} ${size}`);
    });

    console.log();
});

function fileSize(bytes: number) {
    const units = ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    let unit = 0;
    while (bytes >= 1024) {
        bytes /= 1024;
        unit++;
    }

    return `${bytes.toFixed(1)} ${units[unit]}`;
}

function pluralS(n: number) {
    return n > 1 ? 's' : '';
}
