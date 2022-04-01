import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { writeFile } from 'fs/promises';
import { join as pathJoin } from 'path';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Set password: ', password => {
    setAuth(password);
    rl.close();
});

async function setAuth(password: string): Promise<void> {
    const passwordHash = await bcrypt.hash(password, 10);
    const token = crypto.randomBytes(64).toString('hex');

    let auth = '';
    auth += `AUTH_PASSWORD=${passwordHash}\n`;
    auth += `AUTH_TOKEN=${token}\n`;

    const path = pathJoin(__dirname, '../.auth');
    writeFile(path, auth);
}
