const CACHE = "elastoclash-v1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/manifest.json",
        "/js/main.js",
        "/js/game.js",
        "/js/controls.js",
        "/js/sounds.js",
        "/js/effects.js",
        "/assets/icon-192.png",
        "/assets/icon-512.png",
        "/assets/drive.mp3",
        "/assets/crash.mp3",
        "/assets/win.mp3"
      ])
    )
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});