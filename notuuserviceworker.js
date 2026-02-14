const CACHE_NAME = "anime-notes-v1";

const assets = [
  "/",
  "index.html",
  "notuu.css",
  "notuu.js",
  "notuumanifest.json",
  "192notuu.png",
  "512notuu.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
