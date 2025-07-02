import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { requestNotificationToken } from '../../firebase/config';

const NotificationManager = () => {
  const [permission, setPermission] = useState('default');
  const [isSupported, setIsSupported] = useState(false);
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        console.log('Service Worker ready:', registration);
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) return;

    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        // Get FCM token
        const token = await requestNotificationToken();
        if (token) {
          setFcmToken(token);
          console.log('FCM Token obtained:', token);

          // Send test notification
          await sendTestNotification();
        }
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') return;

    // Send via service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        notificationId: 'test-notification',
        notificationData: {
          body: '¡Las notificaciones están activadas! Recibirás recordatorios de tus tareas.',
          taskId: 'test',
          actions: [
            {
              action: 'view',
              title: 'Entendido',
              icon: '/icon-192x192.png'
            }
          ]
        },
        scheduledTime: Date.now() + 1000 // 1 second from now
      });
    } else {
      // Fallback to direct notification
      new Notification('VisaQuest', {
        body: '¡Las notificaciones están activadas! Recibirás recordatorios de tus tareas.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        vibrate: [200, 100, 200]
      });
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BellOff className="text-yellow-600" size={20} />
          <p className="text-sm text-yellow-800">
            Tu navegador no soporta notificaciones push
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg p-4 ${
      permission === 'granted' 
        ? 'bg-green-50 border border-green-200' 
        : permission === 'denied' 
        ? 'bg-red-50 border border-red-200'
        : 'bg-blue-50 border border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {permission === 'granted' ? (
            <>
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Notificaciones activadas
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Recibirás recordatorios de tus tareas
                </p>
              </div>
            </>
          ) : permission === 'denied' ? (
            <>
              <XCircle className="text-red-600" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Notificaciones bloqueadas
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Habilítalas en la configuración del navegador
                </p>
              </div>
            </>
          ) : (
            <>
              <Bell className="text-blue-600" size={20} />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Activa las notificaciones
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Recibe recordatorios de tus tareas importantes
                </p>
              </div>
            </>
          )}
        </div>

        {permission === 'default' && (
          <button
            onClick={requestPermission}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Bell size={16} />
            {loading ? 'Activando...' : 'Activar'}
          </button>
        )}
      </div>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && fcmToken && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600 break-all">
          FCM Token: {fcmToken}
        </div>
      )}
    </div>
  );
};

// Export helper function for other components
export const scheduleNotification = (task, reminderTime) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      notificationId: `task-${task.id}-${reminderTime.getTime()}`,
      notificationData: {
        body: `Recordatorio: ${task.title} - ${task.description}`,
        taskId: task.id,
        taskTitle: task.title,
        icon: task.icon,
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
            title: 'Posponer',
            icon: '/icon-192x192.png'
          }
        ]
      },
      scheduledTime: reminderTime.getTime()
    });
  }
};

export default NotificationManager;
