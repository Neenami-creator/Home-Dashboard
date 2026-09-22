// A minimal "app shell" service worker for static assets only. Deliberately
// does NOT touch API routes, cross-origin requests (Hue bridge, BOM,
// Spotify, Supabase), or navigations - the target hardware (an iPad mini 2
// capped at iOS 12.5.7) has a known WebKit bug where cloning a
// Brotli-compressed, chunked-transfer Response (exactly what a Vercel HTML
// navigation response looks like) can abort the whole page load instead of
// failing gracefully. Losing "last known state on total WiFi loss" for the
// app shell itself is an acceptable tradeoff for the page actually loading.
const RUNTIME_CACHE = "home-dashboard-runtime-v2";

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
  if (request.mode === "navigate") return;

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
