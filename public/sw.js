// Service worker WorkSpace : rend l'app installable et rapide, sans jamais mettre en cache
// les pages ou données des utilisateurs (seuls les fichiers statiques versionnés le sont).
const STATIC_CACHE = 'ws-static-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll([OFFLINE_URL, '/icons/icon-192.png'])));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)))),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;
    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Fichiers de build (noms uniques par version) et icônes : cache d'abord.
    if (url.pathname.startsWith('/build/assets/') || url.pathname.startsWith('/icons/')) {
        event.respondWith(
            caches.match(request).then((hit) => hit || fetch(request).then((res) => {
                if (res.ok) caches.open(STATIC_CACHE).then((c) => c.put(request, res.clone()));
                return res;
            })),
        );
        return;
    }

    // Navigation : toujours le réseau ; page hors-ligne si pas de connexion.
    if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
    }
});
