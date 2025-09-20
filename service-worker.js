const VERSION = 'you-are-v1';
const APP_SCOPE = '/you-are/';

const ASSETS = [
  APP_SCOPE,
  APP_SCOPE + 'index.html',
  APP_SCOPE + 'manifest.webmanifest',
  APP_SCOPE + 'icon-192.png',
  APP_SCOPE + 'icon-512.png',
  APP_SCOPE + 'icon-512-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k === VERSION ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

// Network-first for HTML, cache-first for other GETs
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (!url.pathname.startsWith(APP_SCOPE)) return;

  const wantsHTML =
    req.headers.get('accept')?.includes('text/html') ||
    url.pathname.endsWith('.html') ||
    url.pathname === APP_SCOPE;

  if (wantsHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        });
      })
    );
  }
});
