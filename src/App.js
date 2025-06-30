import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import { registerSW, requestNotificationPermission } from './hooks/usePWA';
import PWAInstallButton, { OfflineIndicator, InstallPrompt } from './components/PWAInstallButton';

// Protected Route component - Modified to allow guest access
const ProtectedRoute = ({ children }) => {
  // Allow both authenticated users and guest users
  return children;
};

// Gentle welcome screen component
const WelcomeScreen = ({ onStart }) => {
  const [currentStep, setCurrentStep] = useState('checking'); // checking, greeting, mood, ready
  const [selectedMood, setSelectedMood] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const { currentUser, continueAsGuest } = useAuth();

  useEffect(() => {
    setIsLoaded(true);
    
    // Check if user already has a name saved
    const savedName = localStorage.getItem('visa-quest-user-name');
    const hasSeenWelcome = localStorage.getItem('visa-quest-has-seen-welcome');
    
    if (savedName) {
      setUserName(savedName);
      
      // Check if we already have today's mood
      const savedMood = localStorage.getItem('visa-quest-daily-mood');
      if (savedMood) {
        const parsed = JSON.parse(savedMood);
        const today = new Date().toDateString();
        
        if (parsed.date === today) {
          // Already have today's mood, skip to ready or dashboard
          if (hasSeenWelcome) {
            // Go directly to dashboard
            handleStart();
          } else {
            // Show ready screen once
            setSelectedMood(parsed);
            setCurrentStep('ready');
          }
          return;
        }
      }
      
      // Have name but need today's mood
      setCurrentStep('mood');
    } else if (currentUser?.displayName) {
      // Use display name from auth
      setUserName(currentUser.displayName);
      localStorage.setItem('visa-quest-user-name', currentUser.displayName);
      setCurrentStep('mood');
    } else {
      // First time user
      setCurrentStep('greeting');
    }
    
    // Request notification permission gently
    setTimeout(() => {
      requestNotificationPermission();
    }, 2000);

    // Show install prompt after user interaction
    setTimeout(() => {
      setShowInstallPrompt(true);
    }, 10000);
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const moods = [
    { emoji: '😊', label: 'Bien', value: 'good', message: '¡Qué bueno! Aprovechemos esa energía positiva' },
    { emoji: '😐', label: 'Normal', value: 'okay', message: 'Perfecto, vamos paso a paso sin presión' },
    { emoji: '😟', label: 'Agobiada', value: 'overwhelmed', message: 'Te entiendo, hagamos esto juntas sin estrés' },
    { emoji: '🤔', label: 'Confundida', value: 'confused', message: 'No te preocupes, te voy a guiar en todo' },
    { emoji: '😰', label: 'Ansiosa', value: 'anxious', message: 'Respira hondo, vamos a organizarlo todo juntas' }
  ];

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (userName.trim()) {
      localStorage.setItem('visa-quest-user-name', userName.trim());
      setCurrentStep('mood');
    }
  };

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
    localStorage.setItem('visa-quest-daily-mood', JSON.stringify({
      mood: mood.value,
      date: new Date().toDateString(),
      message: mood.message,
      emoji: mood.emoji,
      label: mood.label
    }));
    setTimeout(() => {
      setCurrentStep('ready');
    }, 1500);
  };

  const handleStart = async () => {
    // Mark that user has seen welcome
    localStorage.setItem('visa-quest-has-seen-welcome', 'true');
    
    // If no user is logged in, continue as guest
    if (!currentUser) {
      await continueAsGuest();
    }
    onStart();
  };

  // Loading/Checking state
  if (currentStep === 'checking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-600">Preparando tu experiencia...</p>
        </div>
      </div>
    );
  }

  // Greeting Step - Only shown first time
  if (currentStep === 'greeting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <OfflineIndicator />
        
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          <div className="max-w-md mx-auto text-center">
            
            {/* Warm welcome */}
            <div className={`mb-8 ${isLoaded ? 'slide-up' : 'opacity-0'}`}>
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4 leading-tight">
                ¡Hola! Soy tu compañera en esta aventura
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Juntas vamos a conseguir tu visa a Canadá de manera organizada y sin estrés
              </p>
            </div>

            {/* Name input */}
            <div className={`bg-white rounded-2xl p-6 shadow-lg mb-6 ${isLoaded ? 'slide-up' : 'opacity-0'}`} 
                 style={{ animationDelay: '0.3s' }}>
              <div className="text-2xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Para empezar, ¿cómo te gusta que te llamen?
              </h3>
              
              <form onSubmit={handleNameSubmit} className="space-y-4">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Escribe tu nombre..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-lg text-center"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!userName.trim()}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Continuar ✨
                </button>
              </form>
            </div>

            {/* Gentle info about the journey */}
            <div className={`text-sm text-gray-500 ${isLoaded ? 'slide-up' : 'opacity-0'}`} 
                 style={{ animationDelay: '0.6s' }}>
              <p>🗓️ Te acompañaré durante 21 días</p>
              <p>📱 Funciona sin internet</p>
              <p>🤗 Siempre a tu ritmo</p>
              <p className="mt-4 text-xs">
                💡 Puedes crear una cuenta más tarde para guardar tu progreso
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mood Check Step - Shown once per day
  if (currentStep === 'mood') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <OfflineIndicator />
        
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          <div className="max-w-md mx-auto">
            
            {/* Personal greeting */}
            <div className="text-center mb-8 slide-up">
              <div className="text-5xl mb-4">💝</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ¡Hola {userName}!
              </h2>
              <p className="text-lg text-gray-600">
                Antes de empezar el día, me gustaría saber...
              </p>
            </div>

            {/* Mood selection */}
            <div className="bg-white rounded-2xl p-6 shadow-lg slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                ¿Cómo te sientes hoy con el tema de tu visa?
              </h3>
              
              <div className="space-y-3">
                {moods.map((mood, index) => (
                  <button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood)}
                    className={`w-full p-4 rounded-xl border-2 text-left hover:border-blue-300 hover:bg-blue-50 transition-all ${
                      selectedMood?.value === mood.value ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                    }`}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-3xl">{mood.emoji}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{mood.label}</div>
                        <div className="text-sm text-gray-600">{mood.message}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>💡 Esta información me ayuda a personalizar tu experiencia de hoy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready to start step - Only shown once after mood selection
  if (currentStep === 'ready') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
        <OfflineIndicator />
        
        <div className="flex-1 flex flex-col justify-center px-6 py-12">
          <div className="max-w-md mx-auto">
            
            {/* Personalized encouragement */}
            <div className="text-center mb-8 slide-up">
              <div className="text-6xl mb-4">🇨🇦</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Perfecto, {userName}!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {selectedMood?.message}
              </p>
            </div>

            {/* Journey overview - Only show first time */}
            {!localStorage.getItem('visa-quest-has-seen-welcome') && (
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 slide-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Tu plan personalizado de 21 días
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-xl">
                    <span className="text-2xl">📋</span>
                    <div>
                      <div className="font-semibold text-green-800">Semana 1: Organización</div>
                      <div className="text-sm text-green-600">Documentos y preparación básica</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-xl">
                    <span className="text-2xl">✈️</span>
                    <div>
                      <div className="font-semibold text-blue-800">Semana 2: Planificación</div>
                      <div className="text-sm text-blue-600">Itinerario y reservas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-3 bg-purple-50 rounded-xl">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <div className="font-semibold text-purple-800">Semana 3: Aplicación</div>
                      <div className="text-sm text-purple-600">Envío y seguimiento</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to action */}
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 pulse-glow slide-up"
              style={{ animationDelay: '0.6s' }}
            >
              ¡Empecemos el día! 🌟
            </button>

            {/* Account options */}
            <div className="mt-6 text-center slide-up" style={{ animationDelay: '0.9s' }}>
              <p className="text-sm text-gray-600 mb-2">
                ¿Quieres guardar tu progreso?
              </p>
              <a 
                href="/login" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Crear cuenta o iniciar sesión
              </a>
            </div>

            {/* PWA Install Button */}
            <div className="mt-4 flex justify-center">
              <PWAInstallButton className="text-sm" />
            </div>
          </div>
        </div>

        {/* Install prompt */}
        {showInstallPrompt && (
          <InstallPrompt onDismiss={() => setShowInstallPrompt(false)} />
        )}
      </div>
    );
  }
};

// Enhanced dashboard with daily mood check
const Dashboard = ({ onBack }) => {
  const { currentUser, logout, isGuest } = useAuth();
  const [userName] = useState(localStorage.getItem('visa-quest-user-name') || currentUser?.displayName || 'Viajera');
  const [todayMood, setTodayMood] = useState(null);
  const [needsMoodCheck, setNeedsMoodCheck] = useState(false);

  useEffect(() => {
    // Check if we have today's mood
    const saved = localStorage.getItem('visa-quest-daily-mood');
    if (saved) {
      const parsed = JSON.parse(saved);
      const today = new Date().toDateString();
      
      if (parsed.date === today) {
        setTodayMood(parsed);
      } else {
        // Need to ask for today's mood
        setNeedsMoodCheck(true);
      }
    } else {
      // First time, need mood
      setNeedsMoodCheck(true);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // If needs mood check, redirect to welcome screen
  if (needsMoodCheck) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      
      <div className="p-6">
        <div className="max-w-md mx-auto">
          
          {/* User profile header */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={userName} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">
                  {isGuest ? 'Modo invitado' : 'Hola,'}
                </p>
                <p className="font-semibold text-gray-800">{userName}</p>
              </div>
            </div>
            <div className="text-right">
              {isGuest ? (
                <a 
                  href="/login" 
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Crear cuenta
                </a>
              ) : (
                <button 
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cerrar sesión
                </button>
              )}
            </div>
          </div>
          
          {/* Guest mode notice */}
          {isGuest && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Modo invitado:</strong> Tu progreso se guardará localmente. 
                <a href="/login" className="text-yellow-900 underline ml-1">
                  Crea una cuenta
                </a> para sincronizar tu progreso en todos tus dispositivos.
              </p>
            </div>
          )}
          
          {/* Warm daily greeting */}
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center mb-6">
            <div className="text-4xl mb-4">🌅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Buenos días, {userName}!
            </h2>
            
            {todayMood && (
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <span className="text-2xl">{todayMood.emoji}</span>
                  <span className="font-semibold text-blue-800">{todayMood.label}</span>
                </div>
                <p className="text-sm text-blue-700">
                  {todayMood.message}
                </p>
              </div>
            )}
            
            <p className="text-gray-600 mb-6">
              Aquí comenzará tu dashboard personalizado con tu progreso, tareas del día y apoyo continuo.
            </p>
            
            <button 
              onClick={onBack}
              className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App component
function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

  // Initialize PWA features
  useEffect(() => {
    registerSW();
  }, []);

  const handleStart = () => {
    setCurrentScreen('dashboard');
  };

  const handleBack = () => {
    setCurrentScreen('welcome');
  };

  const AppContent = () => {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard onBack={handleBack} />
            </ProtectedRoute>
          } />
          
          <Route path="/" element={
            currentScreen === 'welcome' ? (
              <WelcomeScreen onStart={handleStart} />
            ) : (
              <Navigate to="/dashboard" />
            )
          } />
        </Routes>
      </Router>
    );
  };

  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
