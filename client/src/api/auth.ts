import { Subject } from '../util/subject';

const authenticatedKey = 'Hitpoints|Authenticated';

class Auth {
    authenticated = !!localStorage.getItem(authenticatedKey);
    authenticatedEvents = new Subject<boolean>();

    constructor() {
        window.addEventListener('storage', event => {
            if (event.key === authenticatedKey) {
                this.setAuthenticated(!!event.newValue);
            }
        });
    }

    /** Returns true if successful or an error message if unsucessful */
    async signIn(password: string) {
        const response = await fetch('/api/sign-in', {
            method: 'POST',
            body: JSON.stringify({ password }),
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
        });

        const result = await response.json() as { message?: string; };

        if (response.status !== 201) {
            return result.message ?? 'Unknown error';
        }

        this.setAuthenticated(true);

        return true;
    }

    setAuthenticated(authenticated: boolean) {
        if (authenticated === this.authenticated) {
            return;
        }

        this.authenticated = authenticated;
        this.authenticatedEvents.emit(authenticated);

        if (authenticated) {
            localStorage.setItem(authenticatedKey, 'true');
        } else {
            localStorage.removeItem(authenticatedKey);
        }
    }
}

export const auth = new Auth();
