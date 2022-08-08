/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// Activate the service worker as soon as it is installed
clientsClaim();

// Activate the service worker as soon as it is updated
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Precache build files
precacheAndRoute(self.__WB_MANIFEST);

// Redirect to index.html
registerRoute(
    // Return false to exempt requests from being fulfilled by index.html.
    ({ request, url }: { request: Request; url: URL }) => {
        // If this isn't a navigation
        if (request.mode !== 'navigate') {
            return false;
        }

        // If this is an api request
        if (url.pathname.startsWith('/api')) {
            return false;
        }

        // If the url has an extension
        if (new RegExp('/[^/?]+\\.[^/]+$').test(url.pathname)) {
            return false;
        }

        return true;
    },
    createHandlerBoundToURL(`${process.env.APP_PATH!}/index.html`),
);

// Cache google fonts
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new StaleWhileRevalidate({
        cacheName: 'google-fonts',
        plugins: [
            new ExpirationPlugin({ maxEntries: 20 }),
        ],
    }),
);

// Cache favicon
registerRoute(
    ({ url }) => url.pathname === '/favicon.svg',
    new StaleWhileRevalidate({
        cacheName: 'favicon',
    }),
);

// Cache images
registerRoute(
    ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/images/'),
    new CacheFirst({
        cacheName: 'images',
        plugins: [
            new ExpirationPlugin({ maxEntries: 100 }),
        ],
    }),
);
