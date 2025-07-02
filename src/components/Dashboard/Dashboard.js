import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Heart, CheckCircle, X, Share2, Sparkles, RefreshCw, Clock, Trophy, User } from 'lucide-react';
import './Dashboard.css';

// Daily tasks data
const dailyTasks = [
  { 
    id: 1,
    icon: '📋',
    title: "Revisar requisitos de visa",
    description: "Lee la lista completa de documentos necesarios para tu visa de turista",
    time: "15 min",
    emoji: '🔍',
    color: 'from-blue-400 to-blue-600',
    tips: ['Guarda la lista en tu teléfono', 'Marca los documentos que ya tienes']
  },
  { 
    id: 2,
    icon: '🛂',
    title: "Verificar pasaporte",
    description: "Asegúrate que esté vigente por al menos 6 meses desde tu fecha de viaje",
    time: "5 min",
    emoji: '✅',
    color: 'from-purple-400 to-purple-600',
    tips: ['Revisa la fecha de vencimiento', 'Toma una foto clara de la página principal']
  },
  { 
    id: 3,
    icon: '📸',
    title: "Fotografías para visa",
    description: "Toma fotos con fondo blanco según las especificaciones canadienses",
    time: "20 min",
    emoji: '🤳',
    color: 'from-pink-400 to-pink-600',
    tips: ['Fondo blanco sin sombras', 'Sin lentes ni accesorios', 'Expresión neutral']
  },
  {
    id: 4,
    icon: '💰',
    title: "Estado de cuenta bancario",
    description: "Solicita los últimos 6 meses en tu banco",
    time: "30 min",
    emoji: '🏦',
    color: 'from-yellow-400 to-yellow-600',
    tips: ['Puede ser digital o físico', 'Debe mostrar tu nombre completo', 'Saldo promedio importante']
  },
  {
    id: 5,
    icon: '💼',
    title: "Carta de empleo",
    description: "Pide a RRHH una carta con tu salario, cargo y antigüedad",
    time: "15 min",
    emoji: '📄',
    color: 'from-indigo-400 to-indigo-600',
    tips: ['En papel membretado', 'Firmada y sellada', 'Mencione tu permiso de vacaciones']
  },
  {
    id: 6,
    icon: '✈️',
    title: "Itinerario de vuelo",
    description: "Reserva o cotiza tus vuelos de ida y vuelta",
    time: "45 min",
    emoji: '🎫',
    color: 'from-cyan-400 to-cyan-600',
    tips: ['No pagues hasta tener la visa', 'Guarda las cotizaciones en PDF', 'Fechas flexibles son mejores']
  }
];

// Motivational quotes that rotate
const motivationalQuotes = [
  "¡Cada paso te acerca más a Canadá! 🇨🇦",
  "Tu visa está más cerca de lo que piensas ✨",
  "¡Sigue así, lo estás haciendo genial! 💪",
  "Paso a paso se logran grandes cosas 🌟",
  "¡Tu esfuerzo de hoy es tu visa de mañana! 🎯",
  "Confía en el proceso, todo saldrá bien 🌈",
  "¡Eres más fuerte de lo que crees! 💫",
  "El éxito es la suma de pequeños esfuerzos 📈",
  "¡No te rindas, ya casi lo logras! 🎊",
  "Tu dedicación dará frutos muy pronto 🌱"
];

// Main Dashboard Component
const Dashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [userName, setUserName] = useState('');
  const [dailyMood, setDailyMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // tabs: tasks, progress, profile
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // Touch handling
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragDistance, setDragDistance] = useState(0);

  useEffect(() => {
    // Get user name
    const savedName = localStorage.getItem('visa-quest-user-name') || 'Amiga';
    setUserName(savedName);
    
    // Get completed tasks
    const savedCompleted = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
    setCompletedTasks(savedCompleted);
    
    // Check if mood was already selected today
    const savedMood = localStorage.getItem('visa-quest-daily-mood');
    const moodDate = localStorage.getItem('visa-quest-mood-date');
    const today = new Date().toDateString();
    
    if (!savedMood || moodDate !== today) {
      setShowMoodSelector(true);
    } else {
      setDailyMood(savedMood);
    }
    
    // Set initial motivational quote
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuoteIndex(randomIndex);
    setMotivationalQuote(motivationalQuotes[randomIndex]);
  }, []);

  // Rotate motivational quotes every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % motivationalQuotes.length;
        setMotivationalQuote(motivationalQuotes[newIndex]);
        return newIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (activeTab === 'tasks' && !showMoodSelector) {
        if (e.key === 'ArrowUp') navigateTask('prev');
        if (e.key === 'ArrowDown') navigateTask('next');
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, activeTab, showMoodSelector]);

  // Touch handlers
  const handleTouchStart = (e) => {
    if (activeTab === 'tasks') {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (activeTab === 'tasks') {
      currentY.current = e.touches[0].clientY;
      const distance = startY.current - currentY.current;
      setDragDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (activeTab === 'tasks') {
      const threshold = 50;
      if (Math.abs(dragDistance) > threshold) {
        if (dragDistance > 0) {
          navigateTask('next');
        } else {
          navigateTask('prev');
        }
      }
      setDragDistance(0);
    }
  };

  // Navigation
  const navigateTask = (direction) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setShowTips(false);
    setTimeout(() => setIsAnimating(false), 300);

    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % dailyTasks.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + dailyTasks.length) % dailyTasks.length);
    }
  };

  // Task actions
  const handleComplete = () => {
    const currentTask = dailyTasks[currentIndex];
    if (!completedTasks.includes(currentTask.id)) {
      const newCompleted = [...completedTasks, currentTask.id];
      setCompletedTasks(newCompleted);
      localStorage.setItem('visa-quest-completed-tasks', JSON.stringify(newCompleted));
      
      // Auto navigate to next task
      setTimeout(() => navigateTask('next'), 500);
    }
  };

  const handleSkip = () => {
    navigateTask('next');
  };

  const handleMoodSelect = (mood) => {
    setDailyMood(mood);
    setShowMoodSelector(false);
    localStorage.setItem('visa-quest-daily-mood', mood);
    localStorage.setItem('visa-quest-mood-date', new Date().toDateString());
  };

  const handleReset = () => {
    if (window.confirm('¿Estás segura que quieres reiniciar tu progreso?')) {
      setCompletedTasks([]);
      localStorage.removeItem('visa-quest-completed-tasks');
      setCurrentIndex(0);
    }
  };

  const currentTask = dailyTasks[currentIndex];
  const isCompleted = completedTasks.includes(currentTask.id);
  const progress = Math.round((completedTasks.length / dailyTasks.length) * 100);

  return (
    <div className="dashboard-container">
      {/* Header with rotating quotes */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-greeting">
            <h1>Hola {userName} 👋</h1>
            <p className="progress-text">{completedTasks.length} de {dailyTasks.length} tareas • {progress}% completado</p>
          </div>
          <div className="motivation-quote">
            <Sparkles size={16} />
            <p className="quote-text">{motivationalQuote}</p>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      {/* Mood Selector - Only show if needed and on tasks tab */}
      {showMoodSelector && activeTab === 'tasks' && (
        <div className="mood-selector">
          <h3>¿Cómo te sientes hoy?</h3>
          <div className="mood-options">
            <button onClick={() => handleMoodSelect('energetic')} className="mood-btn">
              <span className="mood-emoji">💪</span>
              <span>Con energía</span>
            </button>
            <button onClick={() => handleMoodSelect('calm')} className="mood-btn">
              <span className="mood-emoji">😌</span>
              <span>Tranquila</span>
            </button>
            <button onClick={() => handleMoodSelect('focused')} className="mood-btn">
              <span className="mood-emoji">🎯</span>
              <span>Enfocada</span>
            </button>
            <button onClick={() => handleMoodSelect('excited')} className="mood-btn">
              <span className="mood-emoji">🤩</span>
              <span>Emocionada</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="main-content">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && !showMoodSelector && (
          <div 
            className="task-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Task Card */}
            <div 
              className="task-card active"
              style={{
                transform: `translateY(${-dragDistance * 0.3}px) scale(${1 - Math.abs(dragDistance) * 0.0005})`,
                opacity: 1 - Math.abs(dragDistance) * 0.003
              }}
            >
              <div className={`task-gradient ${currentTask.color}`}>
                <span className="task-emoji">{currentTask.icon}</span>
              </div>
              
              <div className="task-content">
                <h2 className="task-title">{currentTask.title}</h2>
                <p className="task-description">{currentTask.description}</p>
                
                <div className="task-meta">
                  <span className="task-time">
                    <Clock size={16} />
                    {currentTask.time}
                  </span>
                </div>
                
                {/* Tips Section */}
                {currentTask.tips && (
                  <div className="tips-section">
                    <button 
                      className="tips-toggle"
                      onClick={() => setShowTips(!showTips)}
                    >
                      💡 {showTips ? 'Ocultar' : 'Ver'} consejos
                    </button>
                    
                    {showTips && (
                      <div className="tips-list">
                        {currentTask.tips.map((tip, index) => (
                          <div key={index} className="tip-item">
                            <span className="tip-bullet">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="action-btn secondary" onClick={handleSkip}>
                <X size={24} />
              </button>
              
              <button 
                className={`action-btn primary ${isCompleted ? 'completed' : ''}`}
                onClick={handleComplete}
                disabled={isCompleted}
              >
                {isCompleted ? <CheckCircle size={32} /> : <Heart size={32} />}
              </button>
              
              <button className="action-btn secondary">
                <Share2 size={24} />
              </button>
            </div>
            
            {/* Navigation Dots */}
            <div className="navigation-dots">
              {dailyTasks.map((_, index) => (
                <div 
                  key={index}
                  className={`dot ${index === currentIndex ? 'active' : ''} ${completedTasks.includes(dailyTasks[index].id) ? 'completed' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="progress-container">
            <div className="progress-content">
              <h2>Tu Avance 🎯</h2>
              <div className="progress-circle">
                <div className="circle-content">
                  <span className="progress-number">{progress}%</span>
                  <span className="progress-label">Completado</span>
                </div>
              </div>
              
              <div className="stats-container">
                <div className="stat-box">
                  <span className="stat-number">{completedTasks.length}</span>
                  <span className="stat-label">Tareas completadas</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number">{dailyTasks.length - completedTasks.length}</span>
                  <span className="stat-label">Tareas pendientes</span>
                </div>
              </div>

              <div className="completed-tasks-list">
                <h3>Tareas Completadas ✅</h3>
                {dailyTasks.filter(task => completedTasks.includes(task.id)).map(task => (
                  <div key={task.id} className="completed-task-item">
                    <span className="task-icon">{task.icon}</span>
                    <span className="task-name">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-container">
            <div className="profile-content">
              <div className="profile-avatar">
                <User size={64} />
              </div>
              <h2>{userName}</h2>
              <p className="profile-subtitle">Viajera en proceso 🌎</p>
              
              <div className="profile-stats">
                <div className="profile-stat">
                  <span className="stat-emoji">📅</span>
                  <span className="stat-value">Día 1</span>
                  <span className="stat-label">de tu viaje</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-emoji">🎯</span>
                  <span className="stat-value">{completedTasks.length}</span>
                  <span className="stat-label">tareas completadas</span>
                </div>
                <div className="profile-stat">
                  <span className="stat-emoji">🔥</span>
                  <span className="stat-value">1</span>
                  <span className="stat-label">días consecutivos</span>
                </div>
              </div>

              <button className="profile-button">
                Configuración
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Tab Bar */}
      <div className="tab-bar">
        <button 
          className={`tab-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="tab-icon">📝</span>
          <span>Tareas</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <Trophy size={20} />
          <span>Avance</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={20} />
          <span>Perfil</span>
        </button>
      </div>
      
      {/* Reset Button - Only show on tasks tab */}
      {activeTab === 'tasks' && (
        <button className="reset-button" onClick={handleReset}>
          <RefreshCw size={16} />
          Reiniciar progreso
        </button>
      )}
      
      {/* Completion Celebration */}
      {completedTasks.length === dailyTasks.length && (
        <div className="completion-celebration">
          <div className="celebration-content">
            <span className="celebration-emoji">🎉</span>
            <h2>¡Felicitaciones {userName}!</h2>
            <p>Has completado todas las tareas de hoy</p>
            <p className="celebration-message">Estás un paso más cerca de tu visa 🇨🇦</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;