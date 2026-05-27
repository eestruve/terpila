const CACHE_NAME = 'terpila-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.png',
  './icon_512.png',
  './audio/phrase_0.mp3',
  './audio/phrase_1.mp3',
  './audio/phrase_2.mp3',
  './audio/phrase_3.mp3',
  './audio/phrase_4.mp3',
  './audio/phrase_5.mp3'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Fetch Event (Offline-First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Return cached asset, otherwise fetch from network
      return cachedResponse || fetch(event.request).catch(() => {
        // Fallback for document requests if network fails
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
