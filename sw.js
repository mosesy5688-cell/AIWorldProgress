const CACHE = 'aiwp-v1';
const urls = ['/', '/projects.html', '/reports.html', '/feedback.html', '/suggest.html', '/about.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(urls)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
