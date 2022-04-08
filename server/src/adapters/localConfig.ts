import { existsSync, lstatSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join as pathJoin } from 'path';

import { once } from '../util/once';

function isDirectory(path: string): boolean {
    try {
        return lstatSync(path).isDirectory();
    } catch {
        return false;
    }
}

function getDataPath(): string {
    if (process.env.HITPOINTS_DATA_PATH && isDirectory(process.env.HITPOINTS_DATA_PATH)) {
        return process.env.HITPOINTS_DATA_PATH;
    }

    const documentsPath = pathJoin(homedir(), 'Documents');

    if (!isDirectory(documentsPath)) {
        throw new Error('Could not find Documents directory');
    }

    const defaultPath = pathJoin(documentsPath, 'hitpoints');

    if (!existsSync(defaultPath)) {
        mkdirSync(defaultPath);
    }

    return defaultPath;
}

interface LocalConfig {
    dbPath: string;
    imagesDir: string;
    resizedImagesDir: string;
}

export const localConfig = once((): LocalConfig => {
    const dataPath = getDataPath();
    const dbPath = pathJoin(dataPath, 'hitpoints.db');
    const imagesDir = pathJoin(dataPath, 'images');
    const resizedImagesDir = pathJoin(imagesDir, 'resized');

    return {
        dbPath,
        imagesDir,
        resizedImagesDir,
    };
});
