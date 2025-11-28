// Service Worker para cache avanzado
const CACHE_NAME = 'mazuhi-v1.0.0';
const STATIC_CACHE = 'mazuhi-static-v1.0.0';
const API_CACHE = 'mazuhi-api-v1.0.0';

// Recursos críticos para cache inmediato
const CRITICAL_RESOURCES = [
  '/',
  '/menu',
  '/sucursales',
  '/images/logo.svg',
  '/images/iconologo.svg',
];

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/images/',
];

// Cache API responses
const API_ENDPOINTS = [
  '/api/menu',
  '/api/platillos-destacados',
  '/api/sucursales',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url => !url.includes('/api/')));
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediato
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) return;

  // Estrategia Network First para APIs
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Estrategia Cache First para recursos estáticos
  if (STATIC_RESOURCES.some(resource => url.pathname.includes(resource))) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Estrategia Stale While Revalidate para páginas
  event.respondWith(staleWhileRevalidateStrategy(request, CACHE_NAME));
});

// Network First Strategy - APIs
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First Strategy - Static Assets
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Stale While Revalidate Strategy - Pages
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}