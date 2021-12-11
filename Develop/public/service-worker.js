const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/style.css',
    'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@2.8.0'
];

const PRECACHE = 'precache-v1';
const RUNTIME = 'runtime';

self.addevtListener('install', (evt) => {
  evt.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
      .then(self.skipWaiting())
  );
});

// cleans up old caches.
self.addevtListener('activate', (evt) => {
  const currentCaches = [PRECACHE, RUNTIME];
  evt.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addevtListener('fetch', (evt) => {
    if (evt.request.url.startsWith(self.location.origin)) {
        evt.respondWith(
      caches.match(evt.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then((cache) => {
          return fetch(evt.request).then((response) => {
            return cache.put(evt.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});