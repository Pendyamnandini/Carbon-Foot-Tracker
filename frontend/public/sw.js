const CACHE_NAME = 'carbon-tracker-static-v2';
const DYNAMIC_CACHE_NAME = 'carbon-tracker-dynamic-v2';
const OFFLINE_URL = '/offline.html';

// Assets to precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install Event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Pre-caching offline pages and assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Ignore browser extensions and non-HTTP requests
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  // API Requests caching strategy: Network First, falling back to cache
  if (requestUrl.pathname.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before caching
          const resClone = response.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            // Only cache successful GET requests
            if (event.request.method === 'GET' && response.status === 200) {
              cache.put(event.request, resClone);
            }
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If it is chatbot or other POST APIs, return a JSON error
            if (event.request.method === 'POST') {
              return new Response(JSON.stringify({ 
                error: 'Offline', 
                message: 'You are currently offline. Your request has been queued and will sync when connection is restored.' 
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            return new Response(JSON.stringify({ error: 'Network error occurred' }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Navigation requests: Network First, falling back to offline.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Static Assets (images, fonts, stylesheets, JS files)
  // Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(event.request, resClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for images
        if (event.request.headers.get('Accept').includes('image')) {
          return caches.match('/icons/icon-192x192.png');
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notifications
self.addEventListener('push', event => {
  let data = { title: 'Carbon Tracker Update', body: 'New updates are available!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Carbon Tracker Update', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Handler
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if a tab is already open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new tab/window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-emissions' || event.tag === 'sync-offline-actions') {
    console.log('[Service Worker] Triggering background sync for', event.tag);
    event.waitUntil(syncOfflineActions());
  }
});

// IndexedDB Helper to sync offline actions
async function syncOfflineActions() {
  // We can open the IndexedDB store and fetch queued actions
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CarbonTrackerOffline', 1);
    
    request.onerror = () => reject();
    
    request.onsuccess = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queued-requests')) {
        resolve();
        return;
      }
      
      const transaction = db.transaction(['queued-requests'], 'readwrite');
      const store = transaction.objectStore('queued-requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const requests = getAllRequest.result;
        if (!requests || requests.length === 0) {
          resolve();
          return;
        }
        
        console.log(`[Service Worker] Syncing ${requests.length} queued requests...`);
        
        for (const req of requests) {
          try {
            const headers = new Headers(req.headers);
            // Append auth token if present
            if (req.token) {
              headers.set('Authorization', `Bearer ${req.token}`);
            }
            
            const response = await fetch(req.url, {
              method: req.method,
              headers: headers,
              body: JSON.stringify(req.body)
            });
            
            if (response.status >= 200 && response.status < 300) {
              // Delete from queue upon successful sync
              const deleteTx = db.transaction(['queued-requests'], 'readwrite');
              deleteTx.objectStore('queued-requests').delete(req.id);
              console.log(`[Service Worker] Successfully synced request: ${req.url}`);
            }
          } catch (err) {
            console.error('[Service Worker] Failed to sync request', req.url, err);
            // Keep in queue to retry later
          }
        }
        resolve();
      };
    };
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('queued-requests')) {
        db.createObjectStore('queued-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
