const cacheName = 'anime-notes-v1';
const assets = [
  './',
  './notuu.html',
  './notuu.css',
  './notuu.js',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;500;700&display=swap'
];

// Install Service Worker
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

// Fetching assets
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});