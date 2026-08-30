const CACHE = 'market-shopping-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  '/mercados.json',
  '/assets/fonts/fonts.css',
  '/assets/fonts/Roboto-300.ttf',
  '/assets/fonts/Roboto-400.ttf',
  '/assets/fonts/Roboto-500.ttf',
  '/assets/fonts/MaterialIcons-Regular.woff2',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Las rutas /api/ siempre van a la red (nunca a cache)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(fetch(req).catch(() => new Response('{}', { status: 503 })));
    return;
  }

  // Navegación (HTML): siempre intenta red primero, cae al cache si offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put('/index.html', clone));
        return res;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Assets estáticos: cache primero, actualiza en segundo plano
  e.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
