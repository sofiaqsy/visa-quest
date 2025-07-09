import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MoodCheck from './components/MoodCheck/MoodCheck';
import Dashboard from './components/Dashboard/Dashboard';
import './index.css';

// Simple Auth Context
const AuthContext = React.createContext({});

const useAuth = () => {
  const context = React.useContext(AuthContext);
  return context || {};
};

// Simple Loading Screen
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f8',
    padding: '20px'
  }}>
    <div style={{
      textAlign: 'center',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>✨</span>
      <h2 style={{ color: '#2d3748', marginBottom: '10px' }}>Cargando VisaQuest...</h2>
      <p style={{ color: '#718096' }}>Preparando tu experiencia personalizada</p>
    </div>
  </div>
);

// Welcome Screen
const WelcomeScreen = ({ onContinue }) => {
  return (
    <div className="welcome-container" style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '32px', color: '#2d3748', margin: '0 0 10px 0', fontWeight: '700' }}>
          🇨🇦 VisaQuest
        </h1>
        <p style={{ color: '#718096', fontSize: '16px', marginBottom: '30px' }}>
          Tu guía gamificada para obtener tu visa canadiense
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: '#f7fafc',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#4a5568'
          }}>
            <span style={{ fontSize: '20px' }}>🎮</span>
            <span>Sistema gamificado</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: '#f7fafc',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#4a5568'
          }}>
            <span style={{ fontSize: '20px' }}>📱</span>
            <span>Funciona offline</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 20px',
            background: '#f7fafc',
            borderRadius: '10px',
            fontSize: '14px',
            color: '#4a5568'
          }}>
            <span style={{ fontSize: '20px' }}>🏆</span>
            <span>Logros y recompensas</span>
          </div>
        </div>
        
        <button 
          onClick={onContinue}
          style={{
            width: '100%',
            padding: '16px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Comenzar mi viaje
        </button>
        
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#a0aec0' }}>
          💡 Tu progreso se guarda automáticamente
        </p>
      </div>
    </div>
  );
};

// Name Setup
const NameSetup = ({ onComplete }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem('visa-quest-user-name', name.trim());
      onComplete(name.trim());
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ fontSize: '28px', color: '#2d3748', margin: '0 0 10px 0' }}>
          ¡Hola! 👋
        </h1>
        <p style={{ color: '#718096', fontSize: '16px', marginBottom: '30px' }}>
          Antes de comenzar, ¿cómo te llamas?
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            style={{
              padding: '14px 20px',
              border: '2px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '16px'
            }}
            autoFocus
          />
          
          <button 
            type="submit"
            style={{
              padding: '14px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: name.trim() ? 1 : 0.5
            }}
            disabled={!name.trim()}
          >
            Continuar
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#a0aec0' }}>
          Usaré tu nombre para personalizar tu experiencia
        </p>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('loading');
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    console.log('App starting...');
    
    // Simulate auth and check user status
    const initApp = () => {
      try {
        // Check if user exists
        const savedUserId = localStorage.getItem('visa-quest-user-id');
        const savedName = localStorage.getItem('visa-quest-user-name');
        const hasSeenWelcome = localStorage.getItem('visa-quest-has-seen-welcome') === 'true';
        
        // Check if user has mood for today
        const moodData = localStorage.getItem('visa-quest-daily-mood');
        let hasTodaysMood = false;
        
        if (moodData) {
          try {
            const parsed = JSON.parse(moodData);
            const today = new Date().toDateString();
            hasTodaysMood = parsed.date === today;
          } catch (e) {
            console.error('Error parsing mood:', e);
          }
        }

        // Create or get user
        if (!savedUserId) {
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('visa-quest-user-id', newUserId);
          setCurrentUser({ uid: newUserId, isAnonymous: true });
        } else {
          setCurrentUser({ uid: savedUserId, isAnonymous: true });
        }

        // Determine which screen to show
        if (!hasSeenWelcome) {
          setCurrentScreen('welcome');
        } else if (!savedName) {
          setCurrentScreen('name');
        } else if (!hasTodaysMood) {
          setUserName(savedName);
          setCurrentScreen('mood');
        } else {
          setUserName(savedName);
          setCurrentScreen('dashboard');
        }

        console.log('App initialized, showing:', currentScreen);
      } catch (error) {
        console.error('Init error:', error);
        setCurrentScreen('welcome');
      } finally {
        setIsLoading(false);
      }
    };

    // Small delay to ensure everything loads
    setTimeout(initApp, 500);
  }, []);

  const handleWelcomeContinue = () => {
    localStorage.setItem('visa-quest-has-seen-welcome', 'true');
    setCurrentScreen('name');
  };

  const handleNameComplete = (name) => {
    setUserName(name);
    setCurrentScreen('mood');
  };

  const handleMoodComplete = () => {
    setCurrentScreen('dashboard');
  };

  // Auth Provider value
  const authValue = {
    currentUser,
    loading: false
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <Routes>
          <Route path="*" element={
            <>
              {currentScreen === 'welcome' && (
                <WelcomeScreen onContinue={handleWelcomeContinue} />
              )}
              {currentScreen === 'name' && (
                <NameSetup onComplete={handleNameComplete} />
              )}
              {currentScreen === 'mood' && (
                <MoodCheck userName={userName} onMoodComplete={handleMoodComplete} />
              )}
              {currentScreen === 'dashboard' && (
                <Dashboard />
              )}
            </>
          } />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

// Export the context and hook
export { AuthContext, useAuth };
