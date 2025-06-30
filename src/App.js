import React, { useState, useEffect } from 'react';
import { registerSW, requestNotificationPermission } from './hooks/usePWA';
import PWAInstallButton, { OfflineIndicator, InstallPrompt } from './components/PWAInstallButton';

// Gentle welcome screen component
const WelcomeScreen = ({ onStart }) => {
  const [currentStep, setCurrentStep] = useState('greeting'); // greeting, mood, ready
  const [selectedMood, setSelectedMood] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Check if user has a name saved
    const savedName = localStorage.getItem('visa-quest-user-name');
    if (savedName) {
      setUserName(savedName);
    }
    
    // Request notification permission gently
    setTimeout(() => {
      requestNotificationPermission();
    }, 2000);

    // Show install prompt after user interaction
    setTimeout(() => {
      setShowInstallPrompt(true);
    }, 10000);
  }, []);

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
      message: mood.message
    }));
    setTimeout(() => {
      setCurrentStep('ready');
    }, 1500);
  };

  const handleStart = () => {
    onStart();
  };

  // Greeting Step
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mood Check Step
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
                Antes de empezar, me gustaría saber...
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
              <p>💡 Esta información me ayuda a personalizar tu experiencia</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Ready to start step
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

            {/* Journey overview */}
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

            {/* Supportive features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 slide-up" style={{ animationDelay: '0.6s' }}>
              <h4 className="font-semibold text-gray-800 mb-3 text-center">Estarás acompañada con:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl mb-1">💝</div>
                  <div className="font-medium">Check-ins diarios</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl mb-1">👥</div>
                  <div className="font-medium">Comunidad de apoyo</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl mb-1">🎯</div>
                  <div className="font-medium">Metas pequeñas</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl mb-1">🔔</div>
                  <div className="font-medium">Recordatorios suaves</div>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 px-6 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 pulse-glow slide-up"
              style={{ animationDelay: '0.9s' }}
            >
              ¡Empecemos juntas! 🌟
            </button>

            {/* PWA Install Button */}
            <div className="mt-4 flex justify-center">
              <PWAInstallButton className="text-sm" />
            </div>

            <div className="text-center text-xs text-gray-500 mt-4">
              <p>💚 Recuerda: vas a tu ritmo, sin presión</p>
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
  const [userName] = useState(localStorage.getItem('visa-quest-user-name') || 'Viajera');
  const [todayMood] = useState(() => {
    const saved = localStorage.getItem('visa-quest-daily-mood');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toDateString()) {
        return parsed;
      }
    }
    return null;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <OfflineIndicator />
      
      <div className="p-6">
        <div className="max-w-md mx-auto">
          
          {/* Warm daily greeting */}
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center mb-6">
            <div className="text-4xl mb-4">🌅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              ¡Buenos días, {userName}!
            </h2>
            
            {todayMood && (
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700">
                  Hoy te sientes <strong>{todayMood.mood}</strong> y recuerda: {todayMood.message}
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

  return (
    <div className="App">
      {currentScreen === 'welcome' && (
        <WelcomeScreen onStart={handleStart} />
      )}
      {currentScreen === 'dashboard' && (
        <Dashboard onBack={handleBack} />
      )}
    </div>
  );
}

export default App;