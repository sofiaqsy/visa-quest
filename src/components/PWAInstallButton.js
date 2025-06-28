import React from 'react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallButton = ({ className = '' }) => {
  const { isInstallable, isInstalled, installApp, isOnline } = usePWA();

  // Don't show button if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      // You can add analytics tracking here
      console.log('VisaQuest: App installed successfully');
    }
  };

  return (
    <button
      onClick={handleInstall}
      className={`
        bg-gradient-to-r from-green-500 to-blue-500 
        text-white font-semibold py-3 px-6 rounded-xl 
        flex items-center space-x-2 
        hover:from-green-600 hover:to-blue-600 
        transform hover:scale-105 transition-all duration-300
        shadow-lg hover:shadow-xl
        ${className}
      `}
    >
      <span className="text-lg">📱</span>
      <span>Instalar App</span>
    </button>
  );
};

// Offline indicator component
export const OfflineIndicator = () => {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-2 text-sm font-medium z-50">
      <div className="flex items-center justify-center space-x-2">
        <span>📡</span>
        <span>Sin conexión - Modo offline activo</span>
      </div>
    </div>
  );
};

// PWA features showcase component
export const PWAFeatures = () => {
  const { isInstalled } = usePWA();

  const features = [
    {
      icon: '📱',
      title: 'Instala como App',
      description: 'Funciona como app nativa en tu teléfono',
      available: !isInstalled
    },
    {
      icon: '🔄',
      title: 'Funciona Offline',
      description: 'Revisa tu progreso sin conexión a internet',
      available: true
    },
    {
      icon: '📸',
      title: 'Escanea Documentos',
      description: 'Usa la cámara para fotos de documentos',
      available: true
    },
    {
      icon: '🔔',
      title: 'Notificaciones',
      description: 'Recordatorios de tareas importantes',
      available: true
    },
    {
      icon: '⚡',
      title: 'Carga Rápida',
      description: 'Optimizada para velocidad móvil',
      available: true
    },
    {
      icon: '🔒',
      title: 'Datos Seguros',
      description: 'Tu información se guarda localmente',
      available: true
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
        ✨ Características de la App
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`
              p-4 rounded-lg border-2 text-center
              ${feature.available 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50 opacity-60'
              }
            `}
          >
            <div className="text-2xl mb-2">{feature.icon}</div>
            <div className="font-semibold text-gray-800 text-sm mb-1">
              {feature.title}
            </div>
            <div className="text-xs text-gray-600">
              {feature.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Install prompt component
export const InstallPrompt = ({ onDismiss }) => {
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success || onDismiss) {
      onDismiss?.();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">📱</div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-800 text-sm mb-1">
              Instalar VisaQuest
            </h4>
            <p className="text-xs text-gray-600 mb-3">
              Instala la app para acceso rápido y funciones offline
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Instalar
              </button>
              <button
                onClick={onDismiss}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallButton;