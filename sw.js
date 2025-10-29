const CACHE = 'aiwp-v1';
// List of all static assets to pre-cache
const urls = [
    '/', 
    '/projects.html', 
    '/reports.html', 
    '/feedback.html', 
    '/suggest.html', 
    '/about.html', 
    '/manifest.json',
    '/favicon.ico', // Often missed, good to include
    // Note: CSS is inline, so no need to cache separately
];

// 1. Installation: Cache all essential static assets
self.addEventListener('install', e => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE).then(cache => {
            console.log('[Service Worker] Pre-caching static assets:', urls);
            return cache.addAll(urls);
        }).catch(err => {
            console.error('[Service Worker] Failed to pre-cache:', err);
        })
    );
});

// 2. Activation: Clean up old caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE) {
                    console.log('[Service Worker] Deleting old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    // Ensure the service worker claims clients immediately after activation
    return self.clients.claim();
});


// 3. Fetching: Cache-first strategy for static assets, Network-only for API
self.addEventListener('fetch', e => {
    const requestUrl = new URL(e.request.url);

    // If the request is for the API endpoint, go straight to the network.
    // This prevents caching dynamic data.
    if (requestUrl.pathname.startsWith('/api/') || requestUrl.hostname.includes('api.')) {
        return; // Skip cache, use network-only strategy implicitly
    }
    
    // For all other requests (static assets/HTML pages): Cache-first, then network
    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request);
        })
    );
});
