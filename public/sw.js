const CACHE_NAME = 'visa-quest-v1.1.0';
const STATIC_CACHE_URLS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

// Scheduled notifications storage
const scheduledNotifications = new Map();

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('VisaQuest SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('VisaQuest SW: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.log('VisaQuest SW: Cache failed:', error);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('VisaQuest SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('VisaQuest SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests and non-GET requests
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('VisaQuest SW: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response since it can only be consumed once
            const responseToCache = response.clone();

            // Cache successful responses
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('VisaQuest SW: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      syncOfflineData()
    );
  }
  
  if (event.tag === 'check-scheduled-notifications') {
    event.waitUntil(
      checkAndShowScheduledNotifications()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('VisaQuest SW: Push notification received');
  
  let notificationData = {
    title: 'VisaQuest',
    body: '¡Tienes nuevas tareas pendientes!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'visa-quest-notification',
    timestamp: Date.now(),
    data: {}
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }
  
  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: [200, 100, 200],
    tag: notificationData.tag,
    timestamp: notificationData.timestamp,
    data: notificationData.data,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Tarea',
        icon: '/icon-192x192.png'
      },
      {
        action: 'complete',
        title: 'Completar',
        icon: '/icon-192x192.png'
      },
      {
        action: 'snooze',
        title: 'Posponer 10min',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('VisaQuest SW: Notification clicked', event.action);
  
  event.notification.close();

  if (event.action === 'view') {
    // Open the app to the specific task
    event.waitUntil(
      clients.openWindow(`/dashboard?task=${event.notification.data.taskId}`)
    );
  } else if (event.action === 'complete') {
    // Mark task as complete
    event.waitUntil(
      completeTaskInBackground(event.notification.data.taskId)
    );
  } else if (event.action === 'snooze') {
    // Snooze for 10 minutes
    event.waitUntil(
      snoozeNotification(event.notification.data, 10)
    );
  } else {
    // Default: open app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper function for background sync
async function syncOfflineData() {
  try {
    console.log('VisaQuest SW: Syncing offline data...');
    
    // Get all clients
    const allClients = await clients.matchAll();
    
    // Send sync message to all clients
    allClients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_SYNC',
        timestamp: Date.now()
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('VisaQuest SW: Sync failed:', error);
    return Promise.reject(error);
  }
}

// Complete task in background
async function completeTaskInBackground(taskId) {
  try {
    // Send message to client to complete task
    const allClients = await clients.matchAll();
    
    allClients.forEach(client => {
      client.postMessage({
        type: 'COMPLETE_TASK',
        taskId: taskId,
        timestamp: Date.now()
      });
    });
    
    // Show success notification
    await self.registration.showNotification('VisaQuest', {
      body: '¡Tarea completada! 🎉',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      tag: 'task-complete',
      requireInteraction: false
    });
  } catch (error) {
    console.error('VisaQuest SW: Error completing task:', error);
  }
}

// Snooze notification
async function snoozeNotification(notificationData, minutes) {
  try {
    const snoozeTime = Date.now() + (minutes * 60 * 1000);
    
    // Store for later
    scheduledNotifications.set(`snooze-${notificationData.taskId}`, {
      ...notificationData,
      scheduledTime: snoozeTime
    });
    
    // Set timeout
    setTimeout(() => {
      self.registration.showNotification('VisaQuest - Recordatorio', {
        body: notificationData.body || 'Es hora de completar tu tarea',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: `snooze-${notificationData.taskId}`,
        data: notificationData
      });
      
      scheduledNotifications.delete(`snooze-${notificationData.taskId}`);
    }, minutes * 60 * 1000);
    
    // Show confirmation
    await self.registration.showNotification('VisaQuest', {
      body: `Recordatorio pospuesto ${minutes} minutos`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100],
      tag: 'snooze-confirm',
      requireInteraction: false
    });
  } catch (error) {
    console.error('VisaQuest SW: Error snoozing notification:', error);
  }
}

// Check and show scheduled notifications
async function checkAndShowScheduledNotifications() {
  const now = Date.now();
  
  for (const [key, notification] of scheduledNotifications.entries()) {
    if (notification.scheduledTime <= now) {
      await self.registration.showNotification('VisaQuest - Recordatorio', {
        body: notification.body,
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200],
        tag: key,
        data: notification
      });
      
      scheduledNotifications.delete(key);
    }
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('VisaQuest SW: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { notificationId, notificationData, scheduledTime } = event.data;
    scheduledNotifications.set(notificationId, {
      ...notificationData,
      scheduledTime
    });
    
    // Calculate delay
    const delay = scheduledTime - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        self.registration.showNotification('VisaQuest - Recordatorio', {
          body: notificationData.body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          tag: notificationId,
          data: notificationData,
          requireInteraction: true,
          actions: notificationData.actions || []
        });
        
        scheduledNotifications.delete(notificationId);
      }, delay);
    }
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-tasks') {
    console.log('VisaQuest SW: Periodic sync - checking tasks');
    event.waitUntil(checkAndShowScheduledNotifications());
  }
});
