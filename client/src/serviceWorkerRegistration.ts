export async function registerServiceWorker() {
    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register(`${process.env.PUBLIC_PATH}/serviceWorker.js`);

       registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (!installingWorker) {
                return;
            }

            installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                    // If the service worker was already installed
                    if (navigator.serviceWorker.controller) {
                        window.dispatchEvent(new CustomEvent('serviceWorkerUpdated'));
                    }
                }
            });
        });
    } catch (error) {
        console.error('Service worker registration failed', error);
    }
}
