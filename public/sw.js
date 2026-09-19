// A minimal "app shell" service worker: enough that total WiFi loss shows
// this app's own last-known-state UI (see src/lib/cache.ts) instead of the
// browser's own offline error page, without needing a build-time precache
// manifest that would go stale across deploys (Next's chunk hashes change
// every build). Deliberately does NOT touch API routes or cross-origin
// requests (Hue bridge, BOM, Spotify, Supabase) - those should always hit
// the network live, and this app's own panels already degrade gracefully
// when they fail.
const RUNTIME_CACHE = "home-dashboard-runtime-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== RUNTIME_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Static assets (JS/CSS/fonts/icons): stale-while-revalidate, so the app
  // shell keeps working offline after the first successful visit while
  // still picking up the latest build whenever the network is up.
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    )
  );
});
