import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Dashboard from './components/Dashboard/Dashboard';
import { registerSW, requestNotificationPermission } from './hooks/usePWA';
import PWAInstallButton, { OfflineIndicator, InstallPrompt } from './components/PWAInstallButton';
import { moodService, userService, analyticsService } from './firebase/services';

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
    const initializeWelcome = async () => {
      setIsLoaded(true);
      
      try {
        // Track visit
        await analyticsService.trackAction(currentUser?.uid, 'welcome_screen_view');
        
        // First, try to get data from Firebase
        let firebaseUserName = null;
        let firebaseTodayMood = null;
        let hasSeenWelcome = localStorage.getItem('visa-quest-has-seen-welcome');
        
        if (currentUser?.uid) {
          // Authenticated user - check Firebase first
          try {
            // Get user profile from Firebase
            const userProfile = await userService.getUserProfile(currentUser.uid);
            if (userProfile?.displayName || userProfile?.userName) {
              firebaseUserName = userProfile.displayName || userProfile.userName;
              setUserName(firebaseUserName);
              // Also save to localStorage as backup
              localStorage.setItem('visa-quest-user-name', firebaseUserName);
            }
            
            // Check if today's mood exists in Firebase
            firebaseTodayMood = await moodService.getTodayMood(currentUser.uid);
          } catch (error) {
            console.warn('Error fetching Firebase data:', error);
          }
        } else {
          // Guest user - check device profile
          try {
            const deviceId = localStorage.getItem('visa-quest-device-id');
            if (deviceId) {
              // Try to get today's mood from Firebase using device ID
              firebaseTodayMood = await moodService.getTodayMood(null);
            }
          } catch (error) {
            console.warn('Error fetching device data:', error);
          }
        }
        
        // If we have Firebase data, use it
        if (firebaseTodayMood) {
          const moodData = {
            mood: firebaseTodayMood.mood,
            date: firebaseTodayMood.date,
            message: firebaseTodayMood.message || '',
            emoji: firebaseTodayMood.emoji || '',
            label: firebaseTodayMood.label || ''
          };
          setSelectedMood(moodData);
          // Save to localStorage as backup
          localStorage.setItem('visa-quest-daily-mood', JSON.stringify(moodData));
          
          if (hasSeenWelcome && firebaseUserName) {
            // User has seen welcome before and we have all data - go to dashboard
            await handleStart();
            return;
          } else if (firebaseUserName) {
            // Have name and mood but haven't seen welcome
            setCurrentStep('ready');
            return;
          }
        }
        
        // Fallback to localStorage if no Firebase data
        const savedName = firebaseUserName || localStorage.getItem('visa-quest-user-name');
        
        if (savedName) {
          setUserName(savedName);
          
          // Check localStorage for mood if we didn't get it from Firebase
          if (!firebaseTodayMood) {
            const savedMood = localStorage.getItem('visa-quest-daily-mood');
            if (savedMood) {
              try {
                const parsed = JSON.parse(savedMood);
                const today = new Date().toDateString();
                
                if (parsed.date === today) {
                  setSelectedMood(parsed);
                  
                  if (hasSeenWelcome) {
                    await handleStart();
                    return;
                  } else {
                    setCurrentStep('ready');
                    return;
                  }
                }
              } catch (e) {
                console.error('Error parsing saved mood:', e);
              }
            }
          }
          
          // Have name but need today's mood
          setCurrentStep('mood');
        } else if (currentUser?.displayName) {
          // Use display name from auth if available
          setUserName(currentUser.displayName);
          localStorage.setItem('visa-quest-user-name', currentUser.displayName);
          // Save to Firebase
          await userService.saveUserProfile(currentUser.uid, {
            displayName: currentUser.displayName,
            userName: currentUser.displayName
          });
          setCurrentStep('mood');
        } else {
          // First time user
          setCurrentStep('greeting');
        }
        
        // Update device activity
        await userService.updateDeviceActivity();
      } catch (error) {
        console.error('Error initializing welcome:', error);
        // On error, show greeting
        setCurrentStep('greeting');
      }
    };

    // Initialize with a timeout to prevent getting stuck
    const initTimeout = setTimeout(() => {
      if (currentStep === 'checking') {
        console.warn('Welcome initialization timeout - proceeding to greeting');
        setIsLoaded(true);
        setCurrentStep('greeting');
      }
    }, 3000); // 3 second timeout

    // Small delay to ensure everything is loaded
    const timer = setTimeout(() => {
      initializeWelcome();
    }, 100);

    // Request notification permission gently
    setTimeout(() => {
      requestNotificationPermission();
    }, 2000);

    // Show install prompt after user interaction
    setTimeout(() => {
      setShowInstallPrompt(true);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(initTimeout);
    };
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps

  const moods = [
    { emoji: '😊', label: 'Bien', value: 'good', message: '¡Qué bueno! Aprovechemos esa energía positiva' },
    { emoji: '😐', label: 'Normal', value: 'okay', message: 'Perfecto, vamos paso a paso sin presión' },
    { emoji: '😟', label: 'Agobiada', value: 'overwhelmed', message: 'Te entiendo, hagamos esto juntas sin estrés' },
    { emoji: '🤔', label: 'Confundida', value: 'confused', message: 'No te preocupes, te voy a guiar en todo' },
    { emoji: '😰', label: 'Ansiosa', value: 'anxious', message: 'Respira hondo, vamos a organizarlo todo juntas' }
  ];

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    if (userName.trim()) {
      // Save to localStorage first (immediate feedback)
      localStorage.setItem('visa-quest-user-name', userName.trim());
      
      // Save to Firebase
      try {
        if (currentUser?.uid) {
          // Authenticated user
          await userService.saveUserProfile(currentUser.uid, {
            displayName: userName.trim(),
            userName: userName.trim()
          });
        } else {
          // Guest user - create device profile
          await userService.createDeviceProfile({
            userName: userName.trim(),
            firstSeen: new Date().toISOString()
          });
        }
        
        // Track action
        analyticsService.trackAction(currentUser?.uid, 'name_submitted', { userName: userName.trim() });
      } catch (error) {
        console.warn('Error saving to Firebase (non-critical):', error);
      }
      
      setCurrentStep('mood');
    }
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    
    // Save locally first (immediate feedback)
    const moodData = {
      mood: mood.value,
      date: new Date().toDateString(),
      message: mood.message,
      emoji: mood.emoji,
      label: mood.label
    };
    
    localStorage.setItem('visa-quest-daily-mood', JSON.stringify(moodData));
    
    // Save to Firebase
    try {
      await moodService.saveDailyMood(currentUser?.uid, {
        mood: mood.value,
        emoji: mood.emoji,
        label: mood.label,
        message: mood.message
      });
      
      // Track action
      analyticsService.trackAction(currentUser?.uid, 'mood_selected', { mood: mood.value });
    } catch (error) {
      console.warn('Error saving mood to Firebase (non-critical):', error);
    }
    
    setTimeout(() => {
      setCurrentStep('ready');
    }, 1500);
  };

  const handleStart = async () => {
    // Mark that user has seen welcome
    localStorage.setItem('visa-quest-has-seen-welcome', 'true');
    
    // Save to Firebase if authenticated
    if (currentUser?.uid) {
      try {
        await userService.saveUserProfile(currentUser.uid, {
          hasSeenWelcome: true,
          lastLogin: new Date().toISOString()
        });
      } catch (error) {
        console.warn('Error updating user profile (non-critical):', error);
      }
    }
    
    // If no user is logged in, continue as guest
    if (!currentUser) {
      try {
        await continueAsGuest();
      } catch (error) {
        console.warn('Error continuing as guest (non-critical):', error);
      }
    }
    
    // Track action
    try {
      analyticsService.trackAction(currentUser?.uid, 'journey_started');
    } catch (error) {
      console.warn('Error tracking journey start (non-critical):', error);
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

  const AppContent = () => {
    const [needsMoodCheck, setNeedsMoodCheck] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
      // Check if we need mood check
      const checkMood = async () => {
        // First check Firebase if user is authenticated
        if (currentUser?.uid) {
          try {
            const todayMood = await moodService.getTodayMood(currentUser.uid);
            if (!todayMood && localStorage.getItem('visa-quest-has-seen-welcome')) {
              setNeedsMoodCheck(true);
              return;
            }
          } catch (error) {
            console.warn('Error checking Firebase mood:', error);
          }
        }
        
        // Fallback to localStorage check
        const savedMood = localStorage.getItem('visa-quest-daily-mood');
        if (savedMood) {
          try {
            const parsed = JSON.parse(savedMood);
            const today = new Date().toDateString();
            
            if (parsed.date !== today && localStorage.getItem('visa-quest-has-seen-welcome')) {
              setNeedsMoodCheck(true);
            }
          } catch (e) {
            console.error('Error parsing mood:', e);
          }
        }
      };
      
      checkMood();
    }, [currentUser]);

    // If needs mood check, redirect to welcome
    if (needsMoodCheck) {
      return <Navigate to="/" />;
    }

    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
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
