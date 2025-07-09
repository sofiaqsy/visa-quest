import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import MoodCheck from './components/MoodCheck/MoodCheck';
import PWAInstallButton, { OfflineIndicator, InstallPrompt } from './components/PWAInstallButton';

// Welcome Screen Component
const WelcomeScreen = ({ onGetStarted }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    localStorage.setItem('visa-quest-has-seen-welcome', 'true');
    setTimeout(() => {
      onGetStarted();
    }, 500);
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">🇨🇦 VisaQuest</h1>
        <p className="welcome-subtitle">Tu guía gamificada para obtener tu visa canadiense</p>
        
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-icon">🎮</span>
            <span>Sistema gamificado</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Funciona offline</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🏆</span>
            <span>Logros y recompensas</span>
          </div>
        </div>
        
        <button 
          className="welcome-button"
          onClick={handleGetStarted}
          disabled={isLoading}
        >
          {isLoading ? 'Cargando...' : 'Comenzar mi viaje'}
        </button>
        
        <p className="welcome-note">
          💡 Tu progreso se guarda automáticamente
        </p>
      </div>
    </div>
  );
};

// Loading Screen Component
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

// Name Setup Component
const NameSetup = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);
      localStorage.setItem('visa-quest-user-name', name.trim());
      setTimeout(() => {
        onComplete(name.trim());
      }, 300);
    }
  };

  return (
    <div className="name-setup-container">
      <div className="name-setup-content">
        <h1 className="name-setup-title">¡Hola! 👋</h1>
        <p className="name-setup-subtitle">Antes de comenzar, ¿cómo te llamas?</p>
        
        <form onSubmit={handleSubmit} className="name-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="name-input"
            autoFocus
            disabled={isSubmitting}
            maxLength={30}
          />
          
          <button 
            type="submit" 
            className="name-submit-button"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </button>
        </form>
        
        <p className="name-setup-note">
          Usaré tu nombre para personalizar tu experiencia
        </p>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  const [userName, setUserName] = useState(null);
  const [hasCheckedMood, setHasCheckedMood] = useState(false);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);

  useEffect(() => {
    // Check setup status
    const checkSetup = () => {
      const seenWelcome = localStorage.getItem('visa-quest-has-seen-welcome') === 'true';
      const savedName = localStorage.getItem('visa-quest-user-name');
      
      // Check if user has mood for today
      const moodData = localStorage.getItem('visa-quest-daily-mood');
      let hasTodaysMood = false;
      
      if (moodData) {
        try {
          const parsed = JSON.parse(moodData);
          const today = new Date().toDateString();
          hasTodaysMood = parsed.date === today;
        } catch (e) {
          console.error('Error parsing mood data:', e);
        }
      }
      
      setHasSeenWelcome(seenWelcome);
      setUserName(savedName);
      setHasCheckedMood(hasTodaysMood);
      setIsCheckingSetup(false);
    };

    if (!loading) {
      checkSetup();
    }
  }, [loading]);

  if (loading || isCheckingSetup) {
    return <LoadingScreen />;
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Show welcome screen if not seen
  if (!hasSeenWelcome) {
    return <WelcomeScreen onGetStarted={() => setHasSeenWelcome(true)} />;
  }

  // Show name setup if no name
  if (!userName) {
    return <NameSetup onComplete={(name) => setUserName(name)} />;
  }

  // Show mood check if not checked today
  if (!hasCheckedMood) {
    return <MoodCheck userName={userName} />;
  }

  // All setup complete, show the requested content
  return children;
};

// Main App Component
function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize app
    const initApp = async () => {
      try {
        // Simple initialization without service worker for now
        console.log('App initializing...');
        
        // Add a small delay to ensure everything loads
        setTimeout(() => {
          setIsReady(true);
        }, 1000);
      } catch (error) {
        console.error('App initialization error:', error);
        setIsReady(true); // Continue anyway
      }
    };

    initApp();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* PWA Components */}
          <OfflineIndicator />
          <InstallPrompt />
          
          {/* Routes */}
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

// Add styles for welcome and name setup screens
const styles = `
  .welcome-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .welcome-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .welcome-title {
    font-size: 32px;
    color: #2d3748;
    margin: 0 0 10px 0;
    font-weight: 700;
  }

  .welcome-subtitle {
    color: #718096;
    font-size: 16px;
    margin-bottom: 30px;
  }

  .welcome-features {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 30px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: #f7fafc;
    border-radius: 10px;
    font-size: 14px;
    color: #4a5568;
  }

  .feature-icon {
    font-size: 20px;
  }

  .welcome-button {
    width: 100%;
    padding: 16px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .welcome-button:hover {
    background: #5a67d8;
    transform: translateY(-2px);
  }

  .welcome-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .welcome-note {
    margin-top: 20px;
    font-size: 14px;
    color: #a0aec0;
  }

  .name-setup-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .name-setup-content {
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 400px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }

  .name-setup-title {
    font-size: 28px;
    color: #2d3748;
    margin: 0 0 10px 0;
  }

  .name-setup-subtitle {
    color: #718096;
    font-size: 16px;
    margin-bottom: 30px;
  }

  .name-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .name-input {
    padding: 14px 20px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .name-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .name-submit-button {
    padding: 14px;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .name-submit-button:hover:not(:disabled) {
    background: #5a67d8;
    transform: translateY(-2px);
  }

  .name-submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .name-setup-note {
    margin-top: 20px;
    font-size: 14px;
    color: #a0aec0;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 1;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
