const CACHE_NAME = 'gemini-creative-suite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Dalam build nyata, ini akan menjadi file JS/CSS yang dibundel
  // Untuk penyiapan ini, kami akan menargetkan file sumber utama
  '/index.tsx', 
  '/manifest.json'
  // Ikon akan di-cache secara implisit jika diperlukan
];

// Instal service worker
self.addEventListener('install', event => {
  // Lakukan langkah-langkah instalasi
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache dibuka');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error('Gagal meng-cache file selama instalasi:', err);
      })
  );
});

// Cache dan kembalikan permintaan
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - kembalikan respons
        if (response) {
          return response;
        }
        // Tidak di cache, ambil dari jaringan
        return fetch(event.request);
      }
    )
  );
});

// Perbarui service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
