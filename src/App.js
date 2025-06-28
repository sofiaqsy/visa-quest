import React, { useState, useEffect } from 'react';

// Floating elements component
const FloatingElements = () => {
  const icons = ['✈️', '🏔️', '🍁', '📋', '🎯'];
  
  return (
    <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
      {icons.map((icon, index) => (
        <div
          key={index}
          className={`absolute text-2xl animate-bounce float-slow`}
          style={{
            top: `${20 + (index * 15)}%`,
            left: `${10 + (index % 2 ? 70 : 0)}%`,
            animationDelay: `${index * 1.2}s`,
            animationDuration: `${6 + index}s`
          }}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};

// Social proof stats component
const SocialProofStats = () => {
  const stats = [
    { value: '95%', label: 'Aprobación', color: 'text-yellow-300' },
    { value: '156', label: 'Visas exitosas', color: 'text-yellow-300' },
    { value: '21', label: 'Días promedio', color: 'text-yellow-300' }
  ];

  return (
    <div className="glass-effect rounded-2xl p-6 mb-8 slide-up">
      <div className="grid grid-cols-3 gap-4 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-1">
            <div className={`text-3xl font-black ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-sm text-blue-100 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Trust indicators component
const TrustIndicators = () => {
  const indicators = [
    { icon: '🔒', text: '100% Seguro', color: 'text-green-500' },
    { icon: '⭐', text: '4.9/5 rating', color: 'text-blue-500' },
    { icon: '👥', text: '1,200+ usuarios', color: 'text-purple-500' }
  ];

  return (
    <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 mt-6">
      {indicators.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <span className={item.color}>{item.icon}</span>
          <span className="font-medium">{item.text}</span>
        </div>
      ))}
    </div>
  );
};

// Main welcome screen component
const WelcomeScreen = ({ onStart }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <div className="gradient-hero text-white text-center relative h-screen flex flex-col">
        <FloatingElements />
        
        {/* Status bar simulation */}
        <div className="flex justify-between items-center p-4 text-sm font-semibold">
          <span>9:41</span>
          <span>🔋 100%</span>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center px-6 relative z-10">
          {/* Main emoji */}
          <div className={`text-7xl mb-6 ${isLoaded ? 'animate-bounce-slow' : ''}`}>
            🇨🇦
          </div>
          
          {/* Main headline */}
          <h1 className={`text-4xl font-black mb-6 leading-tight ${isLoaded ? 'slide-up' : 'opacity-0'}`}>
            ¡Tu visa a<br/>
            <span className="text-yellow-300">Canadá</span> en<br/>
            <span className="text-yellow-300">21 días</span>!
          </h1>
          
          {/* Subtitle */}
          <p className={`text-xl mb-8 text-blue-100 font-medium ${isLoaded ? 'slide-up' : 'opacity-0'}`} 
             style={{ animationDelay: '0.2s' }}>
            Sin estrés • Sin confusión • Sin rechazos
          </p>
          
          {/* Social proof */}
          <div style={{ animationDelay: '0.4s' }}>
            <SocialProofStats />
          </div>
        </div>
        
        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-12 text-white fill-current">
            <path d="M0,96L80,85.3C160,75,320,53,480,58.7C640,64,800,96,960,96C1120,96,1280,64,1360,48L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-white px-6 pb-8 -mt-12 relative z-20">
        {/* Main CTA Button */}
        <button 
          onClick={onStart}
          className={`w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 py-5 px-6 rounded-2xl font-black text-lg mb-6 pulse-glow transform hover:scale-105 transition-all duration-300 ${isLoaded ? 'slide-up' : 'opacity-0'}`}
          style={{ animationDelay: '0.6s' }}
        >
          🚀 ¡Comenzar Mi Visa GRATIS!
        </button>
        
        {/* Secondary options */}
        <div className={`space-y-3 mb-6 ${isLoaded ? 'slide-up' : 'opacity-0'}`} 
             style={{ animationDelay: '0.8s' }}>
          <button className="w-full bg-gray-50 border-2 border-gray-200 text-gray-600 py-4 px-6 rounded-xl font-semibold text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors duration-300">
            🇺🇸 USA (Próximamente)
          </button>
          <button className="w-full bg-gray-50 border-2 border-gray-200 text-gray-600 py-4 px-6 rounded-xl font-semibold text-sm hover:border-blue-300 hover:bg-blue-50 transition-colors duration-300">
            🇪🇺 Europa (Próximamente)
          </button>
        </div>
        
        {/* Trust indicators */}
        <div style={{ animationDelay: '1s' }}>
          <TrustIndicators />
        </div>
      </div>
    </div>
  );
};

// Temporary dashboard placeholder
const Dashboard = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Bienvenida a VisaQuest!
          </h2>
          <p className="text-gray-600 mb-6">
            Esta será tu pantalla principal donde verás tu progreso, tareas diarias y más.
          </p>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            ← Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App component
function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');

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