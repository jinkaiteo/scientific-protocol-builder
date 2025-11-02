const CACHE_NAME = 'scientific-protocol-builder-v1.0.0';
const STATIC_CACHE_NAME = 'static-cache-v1.0.0';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1.0.0';
const API_CACHE_NAME = 'api-cache-v1.0.0';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/auth/profile',
  '/api/protocols',
  '/api/instruments',
  '/api/instruments/categories'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME).then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
      }),
      
      // Cache API endpoints
      caches.open(API_CACHE_NAME).then(cache => {
        console.log('Pre-caching API endpoints');
        // We'll cache these when they're first requested
        return Promise.resolve();
      })
    ]).then(() => {
      console.log('Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE_NAME && 
              cacheName !== DYNAMIC_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with fallback to cache
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|woff|woff2)$/)) {
    // Static assets - Cache First
    event.respondWith(handleStaticAssets(request));
  } else {
    // Navigation requests - Network First with offline fallback
    event.respondWith(handleNavigation(request));
  }
});

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful responses
      const responseClone = response.clone();
      
      // Only cache GET requests
      if (request.method === 'GET') {
        cache.put(request, responseClone);
      }
      
      return response;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    
    // Try cache fallback
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static assets with Cache First strategy
async function handleStaticAssets(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network and cache
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Failed to fetch static asset:', request.url);
    return new Response('Asset not available offline', { status: 404 });
  }
}

// Handle navigation requests with Network First strategy
async function handleNavigation(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  
  try {
    // Try network first
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
      return response;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed for navigation, trying cache:', request.url);
    
    // Try cache fallback
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Try to return cached index.html for SPA routing
    const indexResponse = await cache.match('/');
    if (indexResponse) {
      return indexResponse;
    }
    
    // Return offline page
    const offlineResponse = await cache.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort - minimal offline response
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - Protocol Builder</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-message { max-width: 400px; margin: 0 auto; }
            .retry-btn { background: #1976d2; color: white; border: none; padding: 10px 20px; margin-top: 20px; border-radius: 4px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="offline-message">
            <h1>🔬 Protocol Builder</h1>
            <h2>You're offline</h2>
            <p>Some features may not be available without an internet connection.</p>
            <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for protocol data
self.addEventListener('sync', event => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'protocol-sync') {
    event.waitUntil(syncProtocolData());
  } else if (event.tag === 'analysis-sync') {
    event.waitUntil(syncAnalysisData());
  }
});

// Sync protocol data when online
async function syncProtocolData() {
  try {
    console.log('Syncing protocol data...');
    
    // Get pending protocol changes from IndexedDB
    const pendingChanges = await getPendingProtocolChanges();
    
    for (const change of pendingChanges) {
      try {
        const response = await fetch('/api/protocols', {
          method: change.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(change.data)
        });
        
        if (response.ok) {
          await removePendingChange(change.id);
          console.log('Synced protocol change:', change.id);
        }
      } catch (error) {
        console.error('Failed to sync protocol change:', error);
      }
    }
  } catch (error) {
    console.error('Protocol sync failed:', error);
  }
}

// Sync analysis data when online
async function syncAnalysisData() {
  try {
    console.log('Syncing analysis data...');
    
    // Refresh cached analysis data
    const cache = await caches.open(API_CACHE_NAME);
    const analysisRequests = await cache.keys();
    
    for (const request of analysisRequests) {
      if (request.url.includes('/api/protocol-analysis/')) {
        try {
          const freshResponse = await fetch(request);
          if (freshResponse.ok) {
            await cache.put(request, freshResponse.clone());
          }
        } catch (error) {
          console.log('Failed to refresh analysis cache:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('Analysis sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Push notification received:', event);
  
  const options = {
    title: 'Protocol Builder',
    body: 'New update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.title = data.title || options.title;
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for data freshness
self.addEventListener('periodicsync', event => {
  console.log('Periodic sync triggered:', event.tag);
  
  if (event.tag === 'protocol-refresh') {
    event.waitUntil(refreshProtocolData());
  }
});

async function refreshProtocolData() {
  try {
    console.log('Refreshing protocol data in background...');
    
    // Refresh frequently accessed protocol data
    const cache = await caches.open(API_CACHE_NAME);
    const protocolRequests = [
      '/api/protocols',
      '/api/instruments/categories',
      '/api/auth/profile'
    ];
    
    for (const url of protocolRequests) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response.clone());
        }
      } catch (error) {
        console.log('Failed to refresh:', url);
      }
    }
  } catch (error) {
    console.error('Background refresh failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingProtocolChanges() {
  // Implementation would use IndexedDB to store pending changes
  // For now, return empty array
  return [];
}

async function removePendingChange(changeId) {
  // Implementation would remove from IndexedDB
  console.log('Removing pending change:', changeId);
}

// Message handling from main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CACHE_PROTOCOL') {
    event.waitUntil(cacheProtocolData(event.data.protocol));
  } else if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    event.waitUntil(sendCacheStatus(event.ports[0]));
  }
});

async function cacheProtocolData(protocolData) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(protocolData), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/api/protocols/${protocolData.id}`, response);
    console.log('Protocol cached for offline use:', protocolData.id);
  } catch (error) {
    console.error('Failed to cache protocol:', error);
  }
}

async function sendCacheStatus(port) {
  try {
    const cacheNames = await caches.keys();
    const status = {
      caches: cacheNames.length,
      online: navigator.onLine,
      version: CACHE_NAME
    };
    port.postMessage({ type: 'CACHE_STATUS', status });
  } catch (error) {
    console.error('Failed to get cache status:', error);
  }
}