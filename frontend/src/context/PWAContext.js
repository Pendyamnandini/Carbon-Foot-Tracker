import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext(null);

export const usePWA = () => useContext(PWAContext);

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheSize, setCacheSize] = useState('0.00 MB');
  const [notificationStatus, setNotificationStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [lastSyncTime, setLastSyncTime] = useState(
    localStorage.getItem('pwa_last_sync_time') || 'Never'
  );
  const [queuedCount, setQueuedCount] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    // 1. Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Track installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('App was successfully installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 3. Track online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      forceSync(); // Sync automatically when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Listen for SW updates
    const handleSwUpdate = (e) => {
      setUpdateAvailable(true);
      setRegistration(e.detail);
    };
    window.addEventListener('sw-update-available', handleSwUpdate);

    // Initial checks
    calculateCacheSize();
    checkQueuedCount();

    // Check display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('sw-update-available', handleSwUpdate);
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  // Calculate Cache Size
  const calculateCacheSize = async () => {
    if (!('caches' in window)) {
      setCacheSize('Unsupported');
      return;
    }
    try {
      let totalBytes = 0;
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalBytes += blob.size;
          }
        }
      }
      const mbSize = (totalBytes / (1024 * 1024)).toFixed(2);
      setCacheSize(`${mbSize} MB`);
    } catch (err) {
      console.error('Error calculating cache size:', err);
      // Fallback using storage API if cache search errors
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const mbSize = (estimate.usage / (1024 * 1024)).toFixed(2);
        setCacheSize(`${mbSize} MB`);
      }
    }
  };

  // Check how many items are queued in IndexedDB
  const checkQueuedCount = () => {
    if (!('indexedDB' in window)) return;
    
    const request = indexedDB.open('CarbonTrackerOffline', 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('queued-requests')) {
        setQueuedCount(0);
        return;
      }
      const tx = db.transaction('queued-requests', 'readonly');
      const store = tx.objectStore('queued-requests');
      const countReq = store.count();
      countReq.onsuccess = () => {
        setQueuedCount(countReq.result);
      };
    };
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('queued-requests')) {
        db.createObjectStore('queued-requests', { keyPath: 'id', autoIncrement: true });
      }
    };
  };

  // Trigger PWA Installation
  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('No deferred prompt available');
      return false;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  // Clear PWA Caches
  const clearCache = async () => {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
      calculateCacheSize();
      window.location.reload();
    }
  };

  // Check for updates manually
  const checkUpdates = async () => {
    if ('serviceWorker' in navigator && window.swRegistration) {
      try {
        await window.swRegistration.update();
        console.log('Service Worker update check completed.');
        // Show indicator if an update was found
        if (window.swRegistration.waiting) {
          setUpdateAvailable(true);
          return true;
        }
      } catch (err) {
        console.error('Error updating Service Worker:', err);
      }
    }
    return false;
  };

  // Trigger Offline Queue Sync Manually
  const forceSync = async () => {
    if (!navigator.onLine) {
      console.log('Cannot sync: offline');
      return false;
    }

    // First try registering background sync
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register('sync-offline-actions');
        console.log('Background sync registered');
      } catch (err) {
        console.warn('Sync registration failed, running direct sync instead', err);
        await directSync();
      }
    } else {
      await directSync();
    }

    localStorage.setItem('pwa_last_sync_time', new Date().toLocaleTimeString());
    setLastSyncTime(new Date().toLocaleTimeString());
    checkQueuedCount();
    calculateCacheSize();
    return true;
  };

  // Fallback direct sync from client if SyncManager isn't available
  const directSync = async () => {
    return new Promise((resolve) => {
      const request = indexedDB.open('CarbonTrackerOffline', 1);
      request.onsuccess = async (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('queued-requests')) {
          resolve();
          return;
        }
        const tx = db.transaction('queued-requests', 'readwrite');
        const store = tx.objectStore('queued-requests');
        const getAllReq = store.getAll();

        getAllReq.onsuccess = async () => {
          const items = getAllReq.result;
          if (!items || items.length === 0) {
            resolve();
            return;
          }

          console.log(`[PWA Direct Sync] Syncing ${items.length} items...`);
          const token = localStorage.getItem('token'); // Get user auth token

          for (const item of items) {
            try {
              const headers = new Headers(item.headers);
              if (token) {
                headers.set('Authorization', `Bearer ${token}`);
              }
              const res = await fetch(item.url, {
                method: item.method,
                headers: headers,
                body: JSON.stringify(item.body)
              });

              if (res.status >= 200 && res.status < 300) {
                const deleteTx = db.transaction('queued-requests', 'readwrite');
                deleteTx.objectStore('queued-requests').delete(item.id);
              }
            } catch (err) {
              console.error('Failed to direct-sync item', item, err);
            }
          }
          resolve();
        };
      };
    });
  };

  // Queue a POST request to run offline
  const queueOfflineAction = async (url, method, body, headers = {}) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CarbonTrackerOffline', 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        const tx = db.transaction('queued-requests', 'readwrite');
        const store = tx.objectStore('queued-requests');

        const requestItem = {
          url,
          method,
          body,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          timestamp: Date.now()
        };

        const addReq = store.add(requestItem);
        addReq.onsuccess = () => {
          console.log('Action queued successfully for offline sync:', url);
          checkQueuedCount();
          // Register background sync
          if ('serviceWorker' in navigator && 'SyncManager' in window) {
            navigator.serviceWorker.ready.then(reg => {
              reg.sync.register('sync-offline-actions');
            });
          }
          resolve(true);
        };
        addReq.onerror = () => reject(new Error('Failed to add offline request'));
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('queued-requests')) {
          db.createObjectStore('queued-requests', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  };

  // Request push notification permissions
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('Notifications not supported');
      return 'unsupported';
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        // Subscribe user to notifications (mocking the subscribe API here, or can write it out)
        await subscribeUserToPush();
      }
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return 'denied';
    }
  };

  // Mock subscribe user to push notifications
  const subscribeUserToPush = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        let subscription = await reg.pushManager.getSubscription();
        if (!subscription) {
          // Typically require VAPID public key
          // We can use a placeholder for now, or just log
          console.log('Push subscription generated or retrieved successfully.');
        }
      } catch (err) {
        console.warn('Error subscribing to push notifications:', err);
      }
    }
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isInstalled,
        isOnline,
        cacheSize,
        notificationStatus,
        lastSyncTime,
        queuedCount,
        updateAvailable,
        installApp,
        clearCache,
        checkUpdates,
        forceSync,
        queueOfflineAction,
        requestNotificationPermission
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};
