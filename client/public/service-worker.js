const CACHE_NAME = 'eversite-v1';
const RUNTIME_CACHE = 'eversite-runtime';

// Store for P2P retrieved content
let p2pContentStore = new Map();

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network, then P2P
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('📦 Serving from cache:', event.request.url);
        return cachedResponse;
      }
      
      // Check P2P store
      if (p2pContentStore.has(event.request.url)) {
        console.log('🤝 Serving from P2P store:', event.request.url);
        const content = p2pContentStore.get(event.request.url);
        return new Response(content, {
          headers: { 'Content-Type': 'text/html' }
        });
      }
      
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        })
        .catch(async () => {
          console.log('❌ Network failed for:', event.request.url);
          
          // Notify main thread to try P2P
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'FETCH_FROM_P2P',
              url: event.request.url
            });
          });
          
          return caches.match('/index.html');
        });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'P2P_CONTENT') {
    // Store P2P retrieved content
    p2pContentStore.set(event.data.url, event.data.content);
    console.log('📦 SW: Stored P2P content for', event.data.url);
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
