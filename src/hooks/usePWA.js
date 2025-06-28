import { useState, useEffect } from 'react';

// Custom hook for PWA functionality
export const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = window.navigator.standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      console.log('VisaQuest: Install prompt available');
    };

    // Handle app installed event
    const handleAppInstalled = () => {
      console.log('VisaQuest: App was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    checkInstalled();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to trigger install prompt
  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('VisaQuest: No install prompt available');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('VisaQuest: User accepted install prompt');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      } else {
        console.log('VisaQuest: User dismissed install prompt');
        return false;
      }
    } catch (error) {
      console.error('VisaQuest: Install prompt error:', error);
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOnline,
    installApp
  };
};

// Service Worker registration utility
export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('VisaQuest: SW registered successfully:', registration);

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              console.log('VisaQuest: New SW available');
              
              // You can show a notification to user here
              if (window.confirm('Nueva versión disponible. ¿Actualizar ahora?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        });

        // Handle controlling service worker change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('VisaQuest: SW controller changed');
          window.location.reload();
        });

      } catch (error) {
        console.error('VisaQuest: SW registration failed:', error);
      }
    });
  }
};

// Push notification utilities
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('VisaQuest: Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const scheduleNotification = (title, options = {}, delay = 0) => {
  if (Notification.permission !== 'granted') {
    console.log('VisaQuest: Notification permission not granted');
    return;
  }

  setTimeout(() => {
    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

  }, delay);
};

// Offline storage utilities
export const saveOfflineData = (key, data) => {
  try {
    localStorage.setItem(`visa-quest-offline-${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
      synced: false
    }));
    return true;
  } catch (error) {
    console.error('VisaQuest: Failed to save offline data:', error);
    return false;
  }
};

export const getOfflineData = (key) => {
  try {
    const stored = localStorage.getItem(`visa-quest-offline-${key}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('VisaQuest: Failed to get offline data:', error);
    return null;
  }
};

export const clearOfflineData = (key) => {
  try {
    localStorage.removeItem(`visa-quest-offline-${key}`);
    return true;
  } catch (error) {
    console.error('VisaQuest: Failed to clear offline data:', error);
    return false;
  }
};

// Camera access for document scanning
export const requestCameraAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } // Use back camera
    });
    
    // Stop the stream immediately - we just wanted to check permission
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('VisaQuest: Camera access denied:', error);
    return false;
  }
};

// Share API for sharing progress or documents
export const shareContent = async (data) => {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.error('VisaQuest: Share failed:', error);
      return false;
    }
  } else {
    // Fallback for browsers without Web Share API
    if (navigator.clipboard && data.text) {
      try {
        await navigator.clipboard.writeText(data.text);
        return true;
      } catch (error) {
        console.error('VisaQuest: Copy to clipboard failed:', error);
        return false;
      }
    }
    return false;
  }
};