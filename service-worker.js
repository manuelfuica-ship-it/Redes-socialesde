const CACHE_NAME = 'agenda-v1';
const URLS_TO_CACHE = [
  '/Redes-socialesde/agenda.html',
  '/Redes-socialesde/css/agenda.css',
  '/Redes-socialesde/js/agenda.js',
  '/Redes-socialesde/manifest.json'
];

// Install event - cache assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE).catch(err => {
        // If addAll fails (e.g., 404), just continue
        // The app will still work with partial cache
        console.log('Cache add error (continuing):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Otherwise try to fetch from network
      return fetch(event.request)
        .then(response => {
          // Cache successful responses
          if (!response || response.status !== 200 || response.type === 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Offline fallback
          return new Response('Offline - unable to fetch resource', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});

// Background sync for future use
self.addEventListener('sync', event => {
  if (event.tag === 'sync-contacts') {
    event.waitUntil(
      // Sync logic here
      Promise.resolve()
    );
  }
});
