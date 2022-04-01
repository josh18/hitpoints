import chalk from 'chalk';
import { StatsError } from 'webpack';

function uppercaseFirst(value: string) {
    return value[0].toUpperCase() + value.slice(1);
}

export function formatError(error: StatsError) {
    return chalk.red('Error') + '\n' + uppercaseFirst(error.message);
}

export function formatWarning(warning: StatsError) {
    return chalk.yellow('WARNING') + '\n' + uppercaseFirst(warning.message);
}
