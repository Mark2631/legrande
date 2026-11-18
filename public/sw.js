const CACHE = 'legrande-member-v7'
const CORE = ['/','/manifest.json','/legrande-logo.png','/offline.html']
const MEMBER_SHELL = '/member-shell'

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)))
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    const cache = await caches.open(CACHE)
    try {
      const response = await fetch('/member',{credentials:'same-origin'})
      const type = response.headers.get('content-type') || ''
      if (response.ok && type.includes('text/html') && new URL(response.url).pathname === '/member') await cache.put(MEMBER_SHELL,response.clone())
    } catch {
      // Keep the generic offline fallback available.
    }
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', event => {
  const request = event.request
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    if (url.pathname === '/member' || url.pathname === '/member/') {
      event.respondWith((async () => {
        const cache = await caches.open(CACHE)
        try {
          const response = await fetch(request)
          const type = response.headers.get('content-type') || ''
          if (response.ok && type.includes('text/html') && new URL(response.url).pathname === '/member') await cache.put(MEMBER_SHELL,response.clone())
          return response
        } catch {
          return await cache.match(MEMBER_SHELL) || await cache.match('/offline.html')
        }
      })())
      return
    }
    // Public, login and administrator HTML is never written to the cache.
    event.respondWith(fetch(request).catch(async () => (await caches.open(CACHE)).match('/offline.html')))
    return
  }

  // Only cache same-origin static files. API and authentication responses are excluded.
  if (!['script','style','image','font'].includes(request.destination)) return
  event.respondWith((async () => {
    const cache = await caches.open(CACHE)
    const cached = await cache.match(request)
    const network = fetch(request).then(response => {
      if (response.ok) void cache.put(request,response.clone())
      return response
    })
    return cached || network
  })())
})
