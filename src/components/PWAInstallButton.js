import React from 'react';
import { useInstallPrompt, useOnlineStatus } from '../hooks/usePWA';

// Offline Indicator Component
export const OfflineIndicator = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#2d3748',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      <span>📴</span>
      <span>Sin conexión - Modo offline</span>
    </div>
  );
};

// Install Prompt Component
export const InstallPrompt = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = React.useState(true);

  if (!isInstallable || !showPrompt) return null;

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Show again after 7 days
    setTimeout(() => setShowPrompt(true), 7 * 24 * 60 * 60 * 1000);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '20px',
      right: '20px',
      background: 'white',
      borderRadius: '12px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>📱</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#2d3748' }}>
            Instala VisaQuest
          </h4>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#718096' }}>
            Accede más rápido y funciona sin internet
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstall}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Instalar
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#718096',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// PWA Install Button (fixed position)
const PWAInstallButton = () => {
  const { isInstallable, promptInstall } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <button
      onClick={promptInstall}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        cursor: 'pointer',
        boxShadow: '0 2px 10px rgba(102, 126, 234, 0.3)',
        zIndex: 999,
        transition: 'all 0.3s ease'
      }}
      title="Instalar app"
    >
      📲
    </button>
  );
};

export default PWAInstallButton;
