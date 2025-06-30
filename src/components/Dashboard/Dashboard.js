import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { moodService, progressService, analyticsService } from '../../firebase/services';
import { CheckCircle, Circle, Calendar, Target, Heart, TrendingUp, Clock, Award, ChevronUp, ChevronDown, Sparkles, BookOpen, Camera, FileText, MapPin, CreditCard, Globe, Users, Star } from 'lucide-react';
import './Dashboard.css';

// Card types for different activities
const CARD_TYPES = {
  WELCOME: 'welcome',
  PROGRESS: 'progress',
  TASK: 'task',
  TIP: 'tip',
  MOTIVATION: 'motivation',
  COMMUNITY: 'community',
  COMPLETE: 'complete'
};

// Daily tasks data organized by day and as cards
const getCardsByDay = (dayNumber, completedTasks = []) => {
  const tasksByDay = {
    1: [
      { 
        type: CARD_TYPES.TASK, 
        id: 'task_1_1', 
        icon: '📋',
        title: "Revisar requisitos de visa",
        description: "Lee la lista completa de documentos necesarios para tu visa de turista",
        time: "15 min",
        emoji: '🔍',
        color: 'from-blue-400 to-blue-600',
        tips: ['Guarda la lista en tu teléfono', 'Marca los documentos que ya tienes']
      },
      { 
        type: CARD_TYPES.TASK, 
        id: 'task_1_2', 
        icon: '🛂',
        title: "Verificar pasaporte",
        description: "Asegúrate que esté vigente por al menos 6 meses desde tu fecha de viaje",
        time: "5 min",
        emoji: '✅',
        color: 'from-purple-400 to-purple-600',
        tips: ['Revisa la fecha de vencimiento', 'Toma una foto clara de la página principal']
      },
      { 
        type: CARD_TYPES.TASK, 
        id: 'task_1_3', 
        icon: '📁',
        title: "Crear carpeta digital",
        description: "Organiza tus documentos en Google Drive o Dropbox",
        time: "10 min",
        emoji: '☁️',
        color: 'from-green-400 to-green-600',
        tips: ['Crea subcarpetas por tipo de documento', 'Comparte el acceso con alguien de confianza']
      }
    ],
    2: [
      { 
        type: CARD_TYPES.TASK, 
        id: 'task_2_1', 
        icon: '📸',
        title: "Fotografías para visa",
        description: "Toma fotos con fondo blanco según las especificaciones canadienses",
        time: "20 min",
        emoji: '🤳',
        color: 'from-pink-400 to-pink-600',
        tips: ['Fondo blanco sin sombras', 'Sin lentes ni accesorios', 'Expresión neutral']
      },
      { 
        type: CARD_TYPES.TASK, 
        id: 'task_2_2', 
        icon: '💰',
        title: "Estado de cuenta bancario",
        description: "Solicita los últimos 6 meses en tu banco",
        time: "30 min",
        emoji: '🏦',
        color: 'from-yellow-400 to-yellow-600',
        tips: ['Puede ser digital o físico', 'Debe mostrar tu nombre completo', 'Saldo promedio importante']
      },
      { 
        type: CARD_TYPES.TASK, 
        id: 'task_2_3', 
        icon: '💼',
        title: "Carta de empleo",
        description: "Pide a RRHH una carta con tu salario, cargo y antigüedad",
        time: "15 min",
        emoji: '📄',
        color: 'from-indigo-400 to-indigo-600',
        tips: ['En papel membretado', 'Firmada y sellada', 'Mencione tu permiso de vacaciones']
      }
    ],
    // Add more days...
  };
  
  const dayTasks = tasksByDay[dayNumber] || tasksByDay[1];
  
  // Mark completed tasks
  return dayTasks.map(task => ({
    ...task,
    completed: completedTasks.includes(task.id)
  }));
};

// Get all cards for a day including non-task cards
const getDailyCards = (dayNumber, userName, todayMood, progress, moodStreak, completedTasks) => {
  const cards = [];
  
  // Welcome card
  cards.push({
    type: CARD_TYPES.WELCOME,
    id: 'welcome',
    greeting: getTimeOfDayGreeting(),
    userName,
    dayNumber,
    mood: todayMood,
    color: 'from-gradient-start to-gradient-end'
  });
  
  // Progress card
  cards.push({
    type: CARD_TYPES.PROGRESS,
    id: 'progress',
    progress,
    dayNumber,
    moodStreak,
    totalDays: 21,
    color: 'from-green-400 to-blue-500'
  });
  
  // Task cards
  const taskCards = getCardsByDay(dayNumber, completedTasks);
  cards.push(...taskCards);
  
  // Tip card after every 2 tasks
  cards.splice(4, 0, {
    type: CARD_TYPES.TIP,
    id: 'tip_1',
    title: "💡 Consejo del día",
    content: "Guarda todos tus documentos en PDF y mantenlos organizados en carpetas",
    color: 'from-cyan-400 to-cyan-600'
  });
  
  // Motivation card
  const quotes = [
    { text: "Cada documento es un paso más cerca de tu sueño canadiense 🇨🇦", author: "VisaQuest" },
    { text: "El viaje de mil millas comienza con un solo paso ✨", author: "Lao Tzu" },
    { text: "Tu futuro en Canadá está más cerca de lo que piensas 🌟", author: "VisaQuest" }
  ];
  
  cards.push({
    type: CARD_TYPES.MOTIVATION,
    id: 'motivation',
    quote: quotes[dayNumber % quotes.length],
    color: 'from-purple-400 to-pink-600'
  });
  
  // Community card
  cards.push({
    type: CARD_TYPES.COMMUNITY,
    id: 'community',
    activeUsers: 1234,
    approvedVisas: 89,
    color: 'from-orange-400 to-red-500'
  });
  
  // Completion card
  cards.push({
    type: CARD_TYPES.COMPLETE,
    id: 'complete',
    completedToday: taskCards.filter(t => t.completed).length,
    totalToday: taskCards.length,
    color: 'from-green-500 to-green-600'
  });
  
  return cards;
};

// Helper function for time greeting
const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

// Card Components
const WelcomeCard = ({ card }) => (
  <div className="card-content welcome-card">
    <div className="welcome-header">
      <h1 className="welcome-greeting">{card.greeting}, {card.userName}! 👋</h1>
      <p className="welcome-subtitle">Día {card.dayNumber} de tu viaje hacia Canadá</p>
    </div>
    
    {card.mood && (
      <div className="mood-display">
        <span className="mood-emoji-large">{card.mood.emoji}</span>
        <p className="mood-message">{card.mood.message}</p>
      </div>
    )}
    
    <div className="swipe-hint">
      <ChevronDown className="swipe-icon animate-bounce" />
      <p>Desliza hacia abajo para ver tus tareas de hoy</p>
    </div>
  </div>
);

const ProgressCard = ({ card }) => (
  <div className="card-content progress-card">
    <div className="progress-header">
      <h2><TrendingUp size={24} /> Tu Progreso</h2>
      <span className="progress-percentage">{card.progress}%</span>
    </div>
    
    <div className="progress-visual">
      <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${card.progress}%` }}></div>
      </div>
    </div>
    
    <div className="progress-stats">
      <div className="stat-item">
        <Calendar size={20} />
        <span>Día {card.dayNumber}/{card.totalDays}</span>
      </div>
      {card.moodStreak > 0 && (
        <div className="stat-item">
          <Award size={20} />
          <span>{card.moodStreak} días de racha</span>
        </div>
      )}
    </div>
    
    <div className="progress-message">
      <Sparkles size={16} />
      <p>¡Vas excelente! Sigue así 🚀</p>
    </div>
  </div>
);

const TaskCard = ({ card, onComplete }) => (
  <div className={`card-content task-card ${card.completed ? 'completed' : ''}`}>
    <div className="task-header">
      <span className="task-icon">{card.icon}</span>
      <span className="task-time">⏱️ {card.time}</span>
    </div>
    
    <h2 className="task-title">{card.title}</h2>
    <p className="task-description">{card.description}</p>
    
    {card.tips && (
      <div className="task-tips">
        <h4>💡 Tips rápidos:</h4>
        <ul>
          {card.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </div>
    )}
    
    <button 
      className={`task-button ${card.completed ? 'completed' : ''}`}
      onClick={() => onComplete(card.id)}
      disabled={card.completed}
    >
      {card.completed ? (
        <>
          <CheckCircle size={20} />
          <span>¡Completado!</span>
        </>
      ) : (
        <>
          <Circle size={20} />
          <span>Marcar como completado</span>
        </>
      )}
    </button>
  </div>
);

const TipCard = ({ card }) => (
  <div className="card-content tip-card">
    <div className="tip-header">
      <Sparkles size={24} />
      <h2>{card.title}</h2>
    </div>
    <p className="tip-content">{card.content}</p>
    <div className="tip-decoration">
      <BookOpen size={48} className="tip-icon" />
    </div>
  </div>
);

const MotivationCard = ({ card }) => (
  <div className="card-content motivation-card">
    <div className="motivation-header">
      <Star size={24} />
      <h2>Tu motivación del día</h2>
    </div>
    <blockquote className="motivation-quote">
      <p>"{card.quote.text}"</p>
      <cite>- {card.quote.author}</cite>
    </blockquote>
    <div className="motivation-decoration">
      <Heart size={48} className="motivation-icon" />
    </div>
  </div>
);

const CommunityCard = ({ card }) => (
  <div className="card-content community-card">
    <div className="community-header">
      <Users size={24} />
      <h2>Comunidad VisaQuest</h2>
    </div>
    <p className="community-message">¡No estás sola en este viaje!</p>
    
    <div className="community-stats">
      <div className="community-stat">
        <span className="stat-number">{card.activeUsers}</span>
        <span className="stat-label">Viajeras activas</span>
      </div>
      <div className="community-stat">
        <span className="stat-number">{card.approvedVisas}</span>
        <span className="stat-label">Visas aprobadas este mes</span>
      </div>
    </div>
    
    <div className="community-decoration">
      <Globe size={48} className="community-icon" />
    </div>
  </div>
);

const CompleteCard = ({ card }) => (
  <div className="card-content complete-card">
    <div className="complete-header">
      <Award size={32} />
      <h2>¡Día completado!</h2>
    </div>
    
    <div className="complete-stats">
      <p className="complete-message">
        Has completado <strong>{card.completedToday}/{card.totalToday}</strong> tareas hoy
      </p>
    </div>
    
    {card.completedToday === card.totalToday && (
      <div className="complete-celebration">
        <p className="celebration-text">🎉 ¡Excelente trabajo! 🎉</p>
        <p className="celebration-subtext">Descansa y nos vemos mañana</p>
      </div>
    )}
    
    <div className="complete-decoration">
      <CheckCircle size={48} className="complete-icon" />
    </div>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const { currentUser, isGuest } = useAuth();
  const [userName] = useState(localStorage.getItem('visa-quest-user-name') || 'Viajera');
  const [todayMood, setTodayMood] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [moodStreak, setMoodStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState([]);
  
  // Touch handling
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef(null);

  const initializeDashboard = useCallback(async () => {
    // Get today's mood
    const savedMood = localStorage.getItem('visa-quest-daily-mood');
    if (savedMood) {
      const parsed = JSON.parse(savedMood);
      setTodayMood(parsed);
    }

    // Calculate day number
    const startDate = localStorage.getItem('visa-quest-start-date');
    if (startDate) {
      const start = new Date(startDate);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDayNumber(Math.min(diffDays, 21));
    } else {
      localStorage.setItem('visa-quest-start-date', new Date().toISOString());
    }

    // Get completed tasks
    const completed = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
    setCompletedTasks(completed);

    // Calculate progress
    const totalTasks = 21 * 3; // 21 days * 3 tasks per day
    const completedCount = completed.length;
    setProgress(Math.round((completedCount / totalTasks) * 100));

    // Get mood streak from Firebase
    if (!isGuest) {
      try {
        const stats = await moodService.getMoodStats(currentUser?.uid);
        if (stats) {
          setMoodStreak(stats.currentStreak);
        }
      } catch (error) {
        console.warn('Error getting mood stats:', error);
      }
    }

    // Track dashboard view
    analyticsService.trackAction(currentUser?.uid, 'dashboard_view', { dayNumber });
  }, [currentUser, isGuest, dayNumber]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  useEffect(() => {
    // Generate cards when data is ready
    const dailyCards = getDailyCards(dayNumber, userName, todayMood, progress, moodStreak, completedTasks);
    setCards(dailyCards);
  }, [dayNumber, userName, todayMood, progress, moodStreak, completedTasks]);

  const handleTaskComplete = async (taskId) => {
    if (completedTasks.includes(taskId)) return;

    // Update completed tasks
    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);
    localStorage.setItem('visa-quest-completed-tasks', JSON.stringify(newCompleted));

    // Save to Firebase
    const task = cards.find(c => c.id === taskId);
    if (task) {
      await progressService.completeTask(currentUser?.uid, {
        taskId,
        taskTitle: task.title,
        dayNumber,
        completedAt: new Date().toISOString()
      });
    }

    // Update progress
    const totalTasks = 21 * 3;
    setProgress(Math.round((newCompleted.length / totalTasks) * 100));

    // Track action
    analyticsService.trackAction(currentUser?.uid, 'task_completed', { taskId, dayNumber });
  };

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > 50;
    const isSwipeDown = distance < -50;
    
    if (isSwipeUp && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
    
    if (isSwipeDown && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Mouse wheel handler
  const handleWheel = (e) => {
    if (e.deltaY > 0 && currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else if (e.deltaY < 0 && currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // Render card based on type
  const renderCard = (card) => {
    switch (card.type) {
      case CARD_TYPES.WELCOME:
        return <WelcomeCard card={card} />;
      case CARD_TYPES.PROGRESS:
        return <ProgressCard card={card} />;
      case CARD_TYPES.TASK:
        return <TaskCard card={card} onComplete={handleTaskComplete} />;
      case CARD_TYPES.TIP:
        return <TipCard card={card} />;
      case CARD_TYPES.MOTIVATION:
        return <MotivationCard card={card} />;
      case CARD_TYPES.COMMUNITY:
        return <CommunityCard card={card} />;
      case CARD_TYPES.COMPLETE:
        return <CompleteCard card={card} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="dashboard-tiktok-container"
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Card Stack */}
      <div className="cards-wrapper">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className={`card-container ${index === currentCardIndex ? 'active' : ''} ${
              index < currentCardIndex ? 'passed' : ''
            }`}
            style={{
              transform: `translateY(${(index - currentCardIndex) * 100}%)`,
              opacity: Math.abs(index - currentCardIndex) > 1 ? 0 : 1,
              pointerEvents: index === currentCardIndex ? 'auto' : 'none'
            }}
          >
            <div className={`card-gradient bg-gradient-to-br ${card.color || 'from-blue-400 to-purple-600'}`}>
              {renderCard(card)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation Dots */}
      <div className="navigation-dots">
        {cards.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentCardIndex ? 'active' : ''}`}
            onClick={() => setCurrentCardIndex(index)}
            aria-label={`Go to card ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Navigation Hints */}
      {currentCardIndex > 0 && (
        <button 
          className="nav-hint nav-hint-up"
          onClick={() => setCurrentCardIndex(currentCardIndex - 1)}
          aria-label="Previous card"
        >
          <ChevronUp size={24} />
        </button>
      )}
      
      {currentCardIndex < cards.length - 1 && (
        <button 
          className="nav-hint nav-hint-down"
          onClick={() => setCurrentCardIndex(currentCardIndex + 1)}
          aria-label="Next card"
        >
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  );
};

export default Dashboard;
