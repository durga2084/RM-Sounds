const CACHE_NAME = "rm-sounds-pwa-cache-v1";
const urlsToCache = [
  "/",
  "/admin",
  "/client",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Add each URL individually and tolerate failures so the install doesn't fail
      await Promise.all(
        urlsToCache.map(async (url) => {
          try {
            const resp = await fetch(url, { cache: "no-store" });
            if (resp && resp.ok) {
              await cache.put(url, resp.clone());
            }
          } catch (err) {
            // ignore failed entries (they may 404 on some hosts)
            console.warn("Service worker: failed to cache", url, err);
          }
        }),
      );
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          const clonedResponse = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (fetchResponse.ok) {
              cache.put(event.request, clonedResponse);
            }
          });
          return fetchResponse;
        })
      );
    }),
  );
});
