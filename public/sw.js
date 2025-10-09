/* Minimal PWA Service Worker for Urbex Project */

const CACHE_VERSION = 'v3' // bump version
const STATIC_CACHE = `urbex-static-${CACHE_VERSION}`
const RUNTIME_CACHE = `urbex-runtime-${CACHE_VERSION}`

const BASE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '')
const withBase = (p) => `${BASE_PATH}${p.startsWith('/') ? p : '/' + p}`

const CORE_ASSETS = [
  withBase('/index.html'),
  withBase('/favicon.ico'),
  withBase('/manifest.webmanifest'),
]

// Unique "install"
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// "activate" pour nettoyer et prendre le contrôle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
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

const isApiRequest = (url) => /\/api\//.test(url) || /91\.134\.99\.3:3000/.test(url)
const isMapTile = (url) => /tile|openstreetmap|mapbox|googleapis\.com\/maps/.test(url)
const isFont = (url) => /fonts\.gstatic\.com|fonts\.googleapis\.com/.test(url)

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = request.url

  // Fallback SPA
  if (request.mode === 'navigate' && isSameOrigin(url)) {
    event.respondWith(fetch(request).catch(() => caches.match(withBase('/index.html'))))
    return
  }

  // API: network-first
  if (isApiRequest(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          if (copy.ok) caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy))
          return response
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Tiles, fonts, images: stale-while-revalidate
  if (isMapTile(url) || isFont(url) || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            const copy = response.clone()
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, copy))
            return response
          })
          .catch(() => cached)
        return cached || networkFetch
      })
    )
    return
  }

  // Assets same-origin: cache-first
  if (isSameOrigin(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const copy = response.clone()
          caches.open(STATIC_CACHE).then((c) => c.put(request, copy))
          return response
        })
      })
    )
  }
})