import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Test 2: Add Firebase - start with just the config
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase config (testing with minimal setup)
const firebaseConfig = {
  apiKey: "test-key",
  authDomain: "test.firebaseapp.com",
  databaseURL: "https://test.firebaseio.com",
  projectId: "test-project",
  storageBucket: "test.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Keep other imports commented for now
// import { AuthProvider, useAuth } from './contexts/AuthContext';
// import LoginForm from './components/Auth/LoginForm';
// import Dashboard from './components/Dashboard/Dashboard';
// import { registerSW, requestNotificationPermission } from './hooks/usePWA';
// import PWAInstallButton, { OfflineIndicator, InstallPrompt } from './components/PWAInstallButton';
// import { moodService, userService, analyticsService } from './firebase/services';

const TestComponent = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#e6f7ff', borderRadius: '10px', margin: '20px 0' }}>
      <h2>✅ React Router funciona!</h2>
      <p>Esta es una ruta de prueba.</p>
    </div>
  );
};

function App() {
  const [step, setStep] = useState(0);
  const [routerWorks, setRouterWorks] = useState(false);
  const [firebaseWorks, setFirebaseWorks] = useState('testing');
  
  useEffect(() => {
    console.log('App mounted');
    
    // Test Firebase initialization
    try {
      console.log('Initializing Firebase...');
      const app = initializeApp(firebaseConfig);
      const database = getDatabase(app);
      console.log('Firebase initialized:', !!app, !!database);
      setFirebaseWorks('success');
    } catch (error) {
      console.error('Firebase error:', error);
      setFirebaseWorks('error: ' + error.message);
    }
    
    const timer = setTimeout(() => {
      setStep(1);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Router>
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
                Probando Firebase...
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
                onClick={() => setRouterWorks(true)}
                style={{
                  backgroundColor: '#9f7aea',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                Probar React Router
              </button>
              
              {routerWorks && (
                <Routes>
                  <Route path="*" element={<TestComponent />} />
                </Routes>
              )}
              
              <button
                onClick={() => {
                  alert(`Firebase status: ${firebaseWorks}`);
                }}
                style={{
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '100%',
                  marginBottom: '10px'
                }}
              >
                Ver estado de Firebase
              </button>
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
            Estado actual:
          </h3>
          <p>✅ React: Funcionando</p>
          <p>✅ React Router: Funcionando</p>
          <p>🔄 Firebase: {firebaseWorks}</p>
          <p>⏳ Componentes: No probado</p>
        </div>
      </div>
    </Router>
  );
}

export default App;
