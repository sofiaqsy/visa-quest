import React, { useState, useEffect } from 'react';
// Temporarily remove all complex imports to test
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import LoginForm from './components/Auth/LoginForm';
// import Dashboard from './components/Dashboard/Dashboard';
// import { registerSW, requestNotificationPermission } from './hooks/usePWA';
// import PWAInstallButton, { OfflineIndicator, InstallPrompt } from './components/PWAInstallButton';
// import { moodService, userService, analyticsService } from './firebase/services';

// Simple test app to identify the issue
function App() {
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    // Test if useEffect works
    console.log('App mounted, step:', step);
    
    // Try to advance after 2 seconds
    const timer = setTimeout(() => {
      setStep(1);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#ebf8ff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          marginBottom: '20px', 
          color: '#2d3748',
          fontWeight: 'bold' 
        }}>
          🇨🇦 VisaQuest
        </h1>
        
        {step === 0 ? (
          <>
            <p style={{ color: '#4a5568', marginBottom: '30px' }}>
              ¡Bienvenida! La app está funcionando correctamente.
            </p>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              Verificando componentes...
            </p>
          </>
        ) : (
          <>
            <p style={{ color: '#48bb78', marginBottom: '20px' }}>
              ✅ React funciona correctamente
            </p>
            <button
              onClick={() => {
                console.log('Button clicked!');
                alert('¡Todo funciona! El problema está en las importaciones.');
              }}
              style={{
                backgroundColor: '#4299e1',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              Probar interacción
            </button>
            <p style={{ 
              color: '#e53e3e', 
              marginTop: '20px',
              fontSize: '14px',
              padding: '10px',
              backgroundColor: '#fff5f5',
              borderRadius: '8px'
            }}>
              El problema está en uno de los módulos importados (Router, Firebase, o componentes).
            </p>
          </>
        )}
      </div>
      
      <div style={{
        marginTop: '20px',
        padding: '20px',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: '10px',
        fontSize: '12px',
        color: '#4a5568',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '10px' }}>
          Información de debug:
        </h3>
        <p>Paso actual: {step}</p>
        <p>Timestamp: {new Date().toLocaleTimeString()}</p>
        <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
      </div>
    </div>
  );
}

export default App;
