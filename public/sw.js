const CACHE_NAME = 'focusbrew-cache-v1';
const urlsToCache = [
  '/',
  '/app',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/icon.png',
  '/images/preview.png',
  // Additional important assets
  '/fonts/',
  '/app/'
];

// Cache for offline app route functionality
const APP_SHELL_CACHE = 'focusbrew-app-shell-v1';
const APP_SHELL_FILES = [
  '/app',
  '/app/',
  // Essential app shell files
  '/fonts/',
  '/images/'
];

self.addEventListener('install', (event) => {
  // Skip waiting to activate the service worker immediately
  self.skipWaiting();

  event.waitUntil(
    Promise.all([
      // Cache main assets
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(urlsToCache);
      }),
      // Cache app shell separately for better performance
      caches.open(APP_SHELL_CACHE).then((cache) => {
        return cache.addAll(APP_SHELL_FILES);
      })
    ])
  );
});

self.addEventListener('activate', (event) => {
  // Claim clients to take control immediately
  event.waitUntil(clients.claim());

  // Clear old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== APP_SHELL_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Don't handle non-GET requests or browser sync
  if (event.request.method !== 'GET' || event.request.url.includes('browser-sync')) {
    return;
  }

  const url = new URL(event.request.url);

  // Special handling for root navigation in standalone mode
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Check if client is in standalone mode
          const clientList = await clients.matchAll({
            type: 'window'
          });

          // For root path navigation, try to redirect to /app
          if (url.pathname === '/' || url.pathname === '') {
            // Try network first
            try {
              const preloadResponse = await event.preloadResponse;
              if (preloadResponse) {
                return preloadResponse;
              }

              // Try to fetch from network
              const networkResponse = await fetch('/app');
              return networkResponse;
            } catch (error) {
              // If network fails, try to serve from cache
              const cachedResponse = await caches.match('/app');
              if (cachedResponse) {
                return cachedResponse;
              }

              // Fallback to root
              return await caches.match('/');
            }
          }

          // For other navigation requests, use network-first strategy
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }

          // Try network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Fallback to cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }

          // Ultimate fallback to root
          return await caches.match('/');
        }
      })()
    );
    return;
  }

  // For other requests, try the cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      // Clone the request because it can only be used once
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response because it can only be used once
        const responseToCache = response.clone();

        // Cache the fetched resource
        caches.open(CACHE_NAME).then((cache) => {
          // Don't cache API responses or dynamic content
          if (!event.request.url.includes('/api/')) {
            cache.put(event.request, responseToCache);
          }
        });

        return response;
      });
    })
  );
}); 