// Service Worker for CortexEdge — Embedded Platforms (standalone track)
// Provides offline support after first visit

// Cache names are origin-wide (shared with the portal and sibling tracks on
// cortexelearn.github.io), so this worker only ever manages caches that carry
// its own prefix.
const CACHE_PREFIX = 'cortexedge-embedded-platforms-';
const CACHE_NAME = CACHE_PREFIX + 'v6';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// CDN assets — cached on first use so the app works offline after initial load
const RUNTIME_CACHE_HOSTS = [
  'unpkg.com',
  'cdnjs.cloudflare.com',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Precache partially failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Skip YouTube requests — always go to network, never cache
  if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com') ||
      url.hostname.includes('ytimg.com') || url.hostname.includes('googlevideo.com')) {
    return;
  }

  const isAppShell = url.origin === self.location.origin;
  const isCdnAsset = RUNTIME_CACHE_HOSTS.some((host) => url.hostname.includes(host));
  if (!isAppShell && !isCdnAsset) return;

  // The HTML shell (navigations and index.html) uses NETWORK-FIRST so that a new
  // deploy is picked up on the next online launch even if the SW version wasn't
  // bumped. Falls back to cache when offline. Everything else (icons, manifest,
  // versioned CDN libraries) uses CACHE-FIRST since those are immutable per URL.
  const isHtmlShell =
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('/') ||
    url.pathname.endsWith('/index.html');

  if (isHtmlShell) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Static assets + CDN: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
