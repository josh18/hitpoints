import { execSync } from 'child_process';
import { copyFileSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '../');
const clientPath = join(root, './client');
const docsPath = join(root, './docs');

function copyFolderSync(from: string, to: string) {
    mkdirSync(to);
    readdirSync(from).forEach(element => {
        if (lstatSync(join(from, element)).isFile()) {
            copyFileSync(join(from, element), join(to, element));
        } else {
            copyFolderSync(join(from, element), join(to, element));
        }
    });
}

function run(command: string, cwd?: string) {
    execSync(command, {
        cwd,
        stdio: 'inherit',
    });
}

run('npm run build-demo', clientPath);

rmSync(docsPath, { recursive: true, force: true });
copyFolderSync(join(clientPath, 'dist'), docsPath);
