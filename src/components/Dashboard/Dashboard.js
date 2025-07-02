import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Heart, CheckCircle, X, MessageCircle, Share2, Sparkles, RefreshCw, Clock } from 'lucide-react';
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

// Motivational quotes
const motivationalQuotes = [
  "¡Cada paso te acerca más a Canadá! 🇨🇦",
  "Tu visa está más cerca de lo que piensas ✨",
  "¡Sigue así, lo estás haciendo genial! 💪",
  "Paso a paso se logran grandes cosas 🌟",
  "¡Tu esfuerzo de hoy es tu visa de mañana! 🎯"
];

// Header Component
const DashboardHeader = ({ completedCount, totalTasks, userName, motivationalQuote }) => {
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  return (
    <div className="dashboard-header">
      <div className="header-content">
        <div className="user-greeting">
          <h1>Hola {userName} 👋</h1>
          <p className="progress-text">{completedCount} de {totalTasks} tareas • {progress}% completado</p>
        </div>
        <div className="motivation-quote">
          <Sparkles size={16} />
          <p>{motivationalQuote}</p>
        </div>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onComplete, onSkip, isActive, style }) => {
  const [showTips, setShowTips] = useState(false);
  
  return (
    <div 
      className={`task-card ${isActive ? 'active' : ''}`}
      style={style}
    >
      <div className={`task-gradient ${task.color}`}>
        <span className="task-emoji">{task.icon}</span>
      </div>
      
      <div className="task-content">
        <h2 className="task-title">{task.title}</h2>
        <p className="task-description">{task.description}</p>
        
        <div className="task-meta">
          <span className="task-time">
            <Clock size={16} />
            {task.time}
          </span>
        </div>
        
        {task.tips && (
          <div className="tips-section">
            <button 
              className="tips-toggle"
              onClick={() => setShowTips(!showTips)}
            >
              💡 {showTips ? 'Ocultar' : 'Ver'} consejos
            </button>
            
            {showTips && (
              <div className="tips-list">
                {task.tips.map((tip, index) => (
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
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [userName, setUserName] = useState('');
  const [dailyMood, setDailyMood] = useState(null);
  const [showMoodSelector, setShowMoodSelector] = useState(true);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
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
    
    if (savedMood && moodDate === today) {
      setDailyMood(savedMood);
      setShowMoodSelector(false);
    }
    
    // Set random motivational quote
    setMotivationalQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') navigateTask('prev');
      if (e.key === 'ArrowDown') navigateTask('next');
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex]);

  // Touch handlers
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const distance = startY.current - currentY.current;
    setDragDistance(distance);
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        navigateTask('next');
      } else {
        navigateTask('prev');
      }
    }
    setDragDistance(0);
  };

  // Navigation
  const navigateTask = (direction) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
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

  return (
    <div className="dashboard-container">
      <DashboardHeader 
        completedCount={completedTasks.length}
        totalTasks={dailyTasks.length}
        userName={userName}
        motivationalQuote={motivationalQuote}
      />
      
      {showMoodSelector && (
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
      
      <div 
        className="task-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <TaskCard 
          task={currentTask}
          onComplete={handleComplete}
          onSkip={handleSkip}
          isActive={true}
          style={{
            transform: `translateY(${-dragDistance * 0.3}px) scale(${1 - Math.abs(dragDistance) * 0.0005})`,
            opacity: 1 - Math.abs(dragDistance) * 0.003
          }}
        />
        
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
      
      {/* Reset Button */}
      <button className="reset-button" onClick={handleReset}>
        <RefreshCw size={16} />
        Reiniciar progreso
      </button>
      
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