const CACHE_NAME = 'gemini-creative-suite-v6'; // Incremented version for update
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install service worker and cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(err => {
        console.error('Failed to cache app shell during install:', err);
      })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Serve requests with a robust strategy
self.addEventListener('fetch', event => {
  // For navigation requests (e.g., loading a page), use a network-first strategy
  // that falls back to the app shell's index.html. This is key for SPAs.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          console.log('Network fetch failed, serving index.html from cache.');
          return caches.match('/'); // Or '/index.html'
        })
    );
    return;
  }

  // For all other requests (CSS, JS, fonts, images), use a stale-while-revalidate strategy.
  // This serves content from cache immediately for speed, then updates the cache in the background.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // If the fetch is successful, update the cache
        if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
            });
        }
        return networkResponse;
      }).catch(err => {
        // If network fails, and we have a cached response, we've already served it.
        // If not, the request will fail, which is the expected behavior.
        console.warn(`Fetch failed for ${event.request.url}:`, err);
      });

      // Return the cached response immediately if it exists, otherwise wait for the network
      return cachedResponse || fetchPromise;
    })
  );
});