/* Minimal PWA Service Worker for Urbex Project */

const CACHE_VERSION = 'v2'
const STATIC_CACHE = `urbex-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `urbex-runtime-${CACHE_VERSION}`

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.webmanifest',
  // Note: Vite emits hashed assets; we do runtime caching for them below
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!key.includes(CACHE_VERSION)) {
              return caches.delete(key)
            }
          }),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

const isSameOrigin = (url) => {
  try {
    const u = new URL(url)
    return u.origin === self.location.origin
  } catch {
    return false
  }
}

const isApiRequest = (url) => {
  // Treat typical API patterns; adjust if needed
  return /\/api\//.test(url) || /91\.134\.99\.3:3000/.test(url)
}

const isMapTile = (url) => /tile|openstreetmap|mapbox|googleapis\.com\/maps/.test(url)
const isFont = (url) => /fonts\.gstatic\.com|fonts\.googleapis\.com/.test(url)

self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') {
    // Never cache non-GET (auth writes, etc.)
    return
  }

  const url = request.url

  // SPA navigation fallback: serve cached index.html when offline
  if (request.mode === 'navigate' && isSameOrigin(url)) {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }

  // Strategy: network-first for API; cache-first for static assets; stale-while-revalidate for tiles/fonts/images
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          if (copy.ok && request.method === 'GET') {
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => caches.match(request)),
    )
    return
  }

  if (isMapTile(url) || isFont(url) || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy))
            return response
          })
          .catch(() => cached)
        return cached || networkFetch
      }),
    )
    return
  }

  if (isSameOrigin(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const copy = response.clone()
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
      }),
    )
  }
})
