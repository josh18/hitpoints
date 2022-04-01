import cookie from 'cookie';
import { IncomingMessage } from 'http';

import { config } from '../config';

export function isAuthorized(request: IncomingMessage): boolean {
    const authToken = config().auth?.token;

    const cookies = cookie.parse(request.headers.cookie ?? '');

    return !authToken || cookies.auth === authToken;
}
