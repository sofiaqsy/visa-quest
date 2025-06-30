import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { progressService, analyticsService } from '../../firebase/services';
import { CheckCircle, Circle, Sparkles, BookOpen, RefreshCw, User, Home, Trophy, Calendar, Target, Award, TrendingUp } from 'lucide-react';
import './Dashboard.css';

// Card types for different activities
const CARD_TYPES = {
  TASK: 'task',
  TIP: 'tip'
};

// Get all tasks for progress calculation
const getAllTasks = () => {
  const allTasks = [];
  for (let day = 1; day <= 21; day++) {
    const dayTasks = getTasksByDay(day);
    allTasks.push(...dayTasks);
  }
  return allTasks;
};

// Daily tasks data organized by day
const getTasksByDay = (dayNumber) => {
  const tasksByDay = {
    1: [
      { 
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
    3: [
      {
        id: 'task_3_1',
        icon: '✈️',
        title: "Itinerario de vuelo",
        description: "Reserva o cotiza tus vuelos de ida y vuelta",
        time: "45 min",
        emoji: '🎫',
        color: 'from-cyan-400 to-cyan-600',
        tips: ['No pagues hasta tener la visa', 'Guarda las cotizaciones en PDF', 'Fechas flexibles son mejores']
      },
      {
        id: 'task_3_2',
        icon: '🏨',
        title: "Reserva de hotel",
        description: "Busca alojamiento con cancelación gratuita",
        time: "30 min",
        emoji: '🛏️',
        color: 'from-orange-400 to-orange-600',
        tips: ['Booking.com tiene cancelación gratis', 'Imprime las confirmaciones', 'Cerca de transporte público']
      },
      {
        id: 'task_3_3',
        icon: '🗺️',
        title: "Plan de viaje",
        description: "Crea un itinerario día por día de tu visita",
        time: "25 min",
        emoji: '📍',
        color: 'from-red-400 to-red-600',
        tips: ['Incluye lugares turísticos', 'Agrega direcciones', 'Demuestra que volverás']
      }
    ]
  };
  
  // Extend pattern for remaining days
  if (dayNumber > 3) {
    const cycledDay = ((dayNumber - 1) % 3) + 1;
    return tasksByDay[cycledDay] || tasksByDay[1];
  }
  
  return tasksByDay[dayNumber] || tasksByDay[1];
};

// Daily tips
const getDailyTips = (dayNumber) => {
  const tips = [
    {
      id: `tip_${dayNumber}_1`,
      title: "💡 Consejo del día",
      content: "Guarda todos tus documentos en PDF y mantenlos organizados en carpetas. Así podrás acceder rápidamente cuando los necesites.",
      color: 'from-cyan-400 to-cyan-600'
    },
    {
      id: `tip_${dayNumber}_2`,
      title: "🌟 Tip profesional",
      content: "Toma fotos de todos tus documentos originales. Si algo se pierde, tendrás respaldo digital inmediato.",
      color: 'from-purple-400 to-pink-600'
    },
    {
      id: `tip_${dayNumber}_3`,
      title: "⚡ Dato rápido",
      content: "Las embajadas valoran mucho la organización. Un expediente bien ordenado causa mejor impresión.",
      color: 'from-yellow-400 to-orange-600'
    }
  ];
  
  return tips[dayNumber % tips.length];
};

// Motivational quotes based on mood
const getMotivationalQuotes = (mood) => {
  const quotesByMood = {
    good: [
      "¡Tu energía positiva te llevará lejos! 🌟",
      "Con esa actitud, Canadá está más cerca que nunca 🇨🇦",
      "Tu entusiasmo hace todo más fácil ✨"
    ],
    okay: [
      "Paso a paso llegarás a tu meta 🚶‍♀️",
      "Cada pequeño avance cuenta 💪",
      "Tu constancia te llevará a Canadá 🍁"
    ],
    overwhelmed: [
      "Respira, vamos juntas en esto 💙",
      "Un documento a la vez, sin prisa 🌸",
      "Tu bienestar es lo más importante 🤗"
    ],
    confused: [
      "Todo se aclarará paso a paso 🔍",
      "Estoy aquí para guiarte en cada duda 💡",
      "Juntas organizaremos todo perfectamente 📋"
    ],
    anxious: [
      "Respira profundo, todo saldrá bien 🧘‍♀️",
      "Tu paz mental es prioridad 🕊️",
      "Vamos con calma, sin presiones 💜"
    ],
    default: [
      "Cada documento es un paso más cerca de tu sueño canadiense 🇨🇦",
      "El viaje de mil millas comienza con un solo paso ✨",
      "Tu futuro en Canadá está más cerca de lo que piensas 🌟"
    ]
  };
  
  return quotesByMood[mood] || quotesByMood.default;
};

// Get all cards for a day
const getDailyCards = (dayNumber, completedTasks) => {
  const cards = [];
  const tasks = getTasksByDay(dayNumber);
  
  // Add tasks with their completion status
  tasks.forEach((task, index) => {
    cards.push({
      type: CARD_TYPES.TASK,
      ...task,
      completed: completedTasks.includes(task.id)
    });
    
    // Add a tip after every 2 tasks
    if ((index + 1) % 2 === 0) {
      cards.push({
        type: CARD_TYPES.TIP,
        ...getDailyTips(dayNumber + index)
      });
    }
  });
  
  // Add final tip if not already added
  if (tasks.length % 2 !== 0) {
    cards.push({
      type: CARD_TYPES.TIP,
      ...getDailyTips(dayNumber)
    });
  }
  
  return cards;
};

// Header Component - Minimal with just motivation
const DashboardHeader = ({ motivationalQuote }) => (
  <div className="dashboard-header-minimal">
    <div className="motivation-banner-minimal">
      <Sparkles size={14} className="sparkle-icon" />
      <p className="motivation-text-minimal">{motivationalQuote}</p>
      <Sparkles size={14} className="sparkle-icon" />
    </div>
  </div>
);

// Task Card Component
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

// Tip Card Component
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

// Progress View Component
const ProgressView = ({ completedTasks, dayNumber, userName }) => {
  const allTasks = getAllTasks();
  const totalTasks = allTasks.length;
  const completedCount = completedTasks.length;
  const progressPercentage = Math.round((completedCount / totalTasks) * 100);
  
  // Calculate streaks
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < dayNumber; i++) {
      const dayTasks = getTasksByDay(dayNumber - i);
      const dayTaskIds = dayTasks.map(t => t.id);
      const completedToday = dayTaskIds.some(id => completedTasks.includes(id));
      
      if (completedToday) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  // Milestones
  const milestones = [
    { name: "Iniciaste tu viaje", icon: "🚀", completed: true },
    { name: "Primera semana", icon: "📅", completed: dayNumber >= 7 },
    { name: "Mitad del camino", icon: "🌟", completed: dayNumber >= 11 },
    { name: "Última semana", icon: "🏁", completed: dayNumber >= 15 },
    { name: "¡Meta alcanzada!", icon: "🏆", completed: dayNumber >= 21 }
  ];
  
  // Week progress
  const currentWeek = Math.ceil(dayNumber / 7);
  const weekProgress = [
    { week: 1, name: "Organización", completed: completedTasks.filter(id => id.startsWith('task_1_')).length, total: 9 },
    { week: 2, name: "Planificación", completed: completedTasks.filter(id => id.startsWith('task_2_')).length, total: 9 },
    { week: 3, name: "Aplicación", completed: completedTasks.filter(id => id.startsWith('task_3_')).length, total: 9 }
  ];
  
  return (
    <div className="progress-view">
      {/* Header */}
      <div className="progress-header">
        <h1 className="progress-title">Tu Progreso</h1>
        <p className="progress-subtitle">¡Hola {userName}! Este es tu camino hacia Canadá 🇨🇦</p>
      </div>
      
      {/* Main Progress Circle */}
      <div className="progress-circle-container">
        <div className="progress-circle">
          <svg className="progress-ring" width="200" height="200">
            <circle
              className="progress-ring-background"
              stroke="#e5e7eb"
              strokeWidth="12"
              fill="transparent"
              r="88"
              cx="100"
              cy="100"
            />
            <circle
              className="progress-ring-fill"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="transparent"
              r="88"
              cx="100"
              cy="100"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progressPercentage / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <div className="progress-circle-content">
            <span className="progress-percentage">{progressPercentage}%</span>
            <span className="progress-label">Completado</span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">Día {dayNumber}</span>
            <span className="stat-label">de 21</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{completedCount}</span>
            <span className="stat-label">Tareas completadas</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{currentStreak}</span>
            <span className="stat-label">Días de racha</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">Semana {currentWeek}</span>
            <span className="stat-label">Actual</span>
          </div>
        </div>
      </div>
      
      {/* Weekly Progress */}
      <div className="weekly-progress">
        <h3 className="section-title">Progreso por Semana</h3>
        {weekProgress.map((week) => (
          <div key={week.week} className="week-progress-item">
            <div className="week-info">
              <span className="week-number">Semana {week.week}</span>
              <span className="week-name">{week.name}</span>
            </div>
            <div className="week-progress-bar">
              <div 
                className="week-progress-fill"
                style={{ width: `${(week.completed / week.total) * 100}%` }}
              />
            </div>
            <span className="week-stats">{week.completed}/{week.total}</span>
          </div>
        ))}
      </div>
      
      {/* Milestones */}
      <div className="milestones-section">
        <h3 className="section-title">Logros Desbloqueados</h3>
        <div className="milestones-grid">
          {milestones.map((milestone, index) => (
            <div 
              key={index} 
              className={`milestone-item ${milestone.completed ? 'completed' : 'locked'}`}
            >
              <span className="milestone-icon">{milestone.icon}</span>
              <span className="milestone-name">{milestone.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Motivational Message */}
      <div className="motivation-card">
        <Sparkles size={24} />
        <p className="motivation-message">
          {progressPercentage < 25 && "¡Excelente inicio! Cada paso cuenta en tu camino a Canadá 🌟"}
          {progressPercentage >= 25 && progressPercentage < 50 && "¡Vas por buen camino! Tu dedicación está dando frutos 💪"}
          {progressPercentage >= 50 && progressPercentage < 75 && "¡Ya vas por la mitad! Tu visa está más cerca que nunca 🎯"}
          {progressPercentage >= 75 && progressPercentage < 100 && "¡Casi lo logras! La meta está a la vista 🏁"}
          {progressPercentage === 100 && "¡Felicidades! Has completado tu preparación para la visa 🎉"}
        </p>
      </div>
    </div>
  );
};

// Navigation Tab Bar
const TabBar = ({ activeTab, onTabChange }) => (
  <div className="tab-bar">
    <button 
      className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
      onClick={() => onTabChange('home')}
    >
      <Home size={20} />
      <span>Tareas</span>
    </button>
    <button 
      className={`tab-item ${activeTab === 'progress' ? 'active' : ''}`}
      onClick={() => onTabChange('progress')}
    >
      <Trophy size={20} />
      <span>Progreso</span>
    </button>
    <button 
      className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
      onClick={() => onTabChange('profile')}
    >
      <User size={20} />
      <span>Perfil</span>
    </button>
  </div>
);

// Main Dashboard Component with Enhanced TikTok-like transitions
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [todayMood, setTodayMood] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName] = useState('');
  
  // Enhanced touch handling with velocity tracking
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const containerRef = useRef(null);
  const velocityRef = useRef(0);
  const lastTouchRef = useRef(0);

  const initializeDashboard = useCallback(async () => {
    // Get user name
    const savedName = localStorage.getItem('visa-quest-user-name') || currentUser?.displayName || 'Amiga';
    setUserName(savedName);
    
    // Get today's mood
    const savedMood = localStorage.getItem('visa-quest-daily-mood');
    let moodValue = 'default';
    if (savedMood) {
      try {
        const parsed = JSON.parse(savedMood);
        setTodayMood(parsed);
        moodValue = parsed.mood || 'default';
      } catch (e) {
        console.error('Error parsing mood:', e);
      }
    }

    // Calculate day number
    const startDate = localStorage.getItem('visa-quest-start-date');
    let calculatedDay = 1;
    if (startDate) {
      const start = new Date(startDate);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      calculatedDay = Math.min(diffDays, 21);
    } else {
      localStorage.setItem('visa-quest-start-date', new Date().toISOString());
    }
    setDayNumber(calculatedDay);

    // Get completed tasks
    const completed = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
    setCompletedTasks(completed);

    // Set motivational quote based on mood
    const quotes = getMotivationalQuotes(moodValue);
    setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    // Track dashboard view
    analyticsService.trackAction(currentUser?.uid, 'dashboard_view', { dayNumber: calculatedDay });
  }, [currentUser]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  useEffect(() => {
    // Generate cards when data is ready
    const baseCards = getDailyCards(dayNumber, completedTasks);
    setCards(baseCards);
  }, [dayNumber, completedTasks]);

  // Rotate motivational quote every 10 seconds based on mood
  useEffect(() => {
    const interval = setInterval(() => {
      const moodValue = todayMood?.mood || 'default';
      const quotes = getMotivationalQuotes(moodValue);
      setMotivationalQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 10000);

    return () => clearInterval(interval);
  }, [todayMood]);

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

    // Calculate progress for tracking
    const totalTasks = getAllTasks().length;
    const progress = Math.round((newCompleted.length / totalTasks) * 100);

    // Track action
    analyticsService.trackAction(currentUser?.uid, 'task_completed', { taskId, dayNumber, progress });
  };

  // Enhanced card navigation with smooth animations
  const navigateToCard = useCallback((newIndex, velocity = 0) => {
    if (isTransitioning || cards.length === 0) return;
    
    // Handle infinite scroll without jumps
    let targetIndex = newIndex;
    
    // If going past the end, wrap to beginning
    if (targetIndex >= cards.length) {
      targetIndex = 0;
    } 
    // If going before the beginning, wrap to end
    else if (targetIndex < 0) {
      targetIndex = cards.length - 1;
    }
    
    setIsTransitioning(true);
    setCurrentCardIndex(targetIndex);
    setDragOffset(0);
    
    // Calculate transition duration based on velocity
    const baseTransitionTime = 400;
    const velocityFactor = Math.max(0.2, 1 - Math.abs(velocity) / 1000);
    const transitionDuration = baseTransitionTime * velocityFactor;
    
    // Update CSS transition duration dynamically
    if (containerRef.current) {
      const cardElements = containerRef.current.querySelectorAll('.card-container');
      cardElements.forEach(card => {
        card.style.transition = `transform ${transitionDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity ${transitionDuration}ms ease`;
      });
    }
    
    setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [cards.length, isTransitioning]);

  // Enhanced touch handlers with velocity tracking
  const handleTouchStart = (e) => {
    if (activeTab !== 'home') return;
    
    setTouchStart(e.touches[0].clientY);
    setIsDragging(true);
    lastTouchRef.current = e.touches[0].clientY;
    velocityRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || activeTab !== 'home') return;
    
    const currentTouch = e.touches[0].clientY;
    setTouchEnd(currentTouch);
    
    // Calculate drag offset for visual feedback
    const offset = currentTouch - touchStart;
    setDragOffset(offset);
    
    // Calculate velocity
    const deltaY = currentTouch - lastTouchRef.current;
    const deltaTime = 16; // Approximate frame time
    velocityRef.current = deltaY / deltaTime * 1000; // pixels per second
    lastTouchRef.current = currentTouch;
    
    // Prevent default scrolling
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!touchStart || !isDragging || activeTab !== 'home') return;
    
    setIsDragging(false);
    
    const distance = touchStart - touchEnd;
    const velocity = velocityRef.current;
    
    // Determine swipe threshold based on distance and velocity
    const minSwipeDistance = 30;
    const minSwipeVelocity = 200;
    
    const isSwipeUp = distance > minSwipeDistance || velocity < -minSwipeVelocity;
    const isSwipeDown = distance < -minSwipeDistance || velocity > minSwipeVelocity;
    
    if (isSwipeUp && cards.length > 0) {
      navigateToCard(currentCardIndex + 1, velocity);
    } else if (isSwipeDown && cards.length > 0) {
      navigateToCard(currentCardIndex - 1, velocity);
    } else {
      // Snap back to current card
      setDragOffset(0);
    }
    
    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
    velocityRef.current = 0;
  };

  // Mouse wheel handler with momentum
  const handleWheel = (e) => {
    if (cards.length === 0 || isTransitioning || activeTab !== 'home') return;
    
    e.preventDefault();
    
    const velocity = e.deltaY * 10;
    
    if (e.deltaY > 0) {
      navigateToCard(currentCardIndex + 1, velocity);
    } else if (e.deltaY < 0) {
      navigateToCard(currentCardIndex - 1, velocity);
    }
  };

  // Reset journey handler
  const handleResetJourney = () => {
    if (window.confirm('¿Estás segura que quieres reiniciar tu viaje? Esto borrará todo tu progreso local.')) {
      // Clear all localStorage data
      localStorage.removeItem('visa-quest-user-name');
      localStorage.removeItem('visa-quest-has-seen-welcome');
      localStorage.removeItem('visa-quest-daily-mood');
      localStorage.removeItem('visa-quest-completed-tasks');
      localStorage.removeItem('visa-quest-start-date');
      
      // Reload the page to start fresh
      window.location.href = '/';
    }
  };

  // Render card based on type
  const renderCard = (card) => {
    switch (card.type) {
      case CARD_TYPES.TASK:
        return <TaskCard card={card} onComplete={handleTaskComplete} />;
      case CARD_TYPES.TIP:
        return <TipCard card={card} />;
      default:
        return null;
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Track tab change
    analyticsService.trackAction(currentUser?.uid, 'tab_changed', { tab });
  };

  // Calculate card transform with drag offset
  const getCardTransform = (index) => {
    const baseTransform = (index - currentCardIndex) * 100;
    const dragTransform = isDragging ? (dragOffset / window.innerHeight) * 100 : 0;
    const rubberBandFactor = 0.3;
    
    // Apply rubber band effect at boundaries
    if (currentCardIndex === 0 && dragTransform > 0) {
      return baseTransform + (dragTransform * rubberBandFactor);
    } else if (currentCardIndex === cards.length - 1 && dragTransform < 0) {
      return baseTransform + (dragTransform * rubberBandFactor);
    }
    
    return baseTransform + dragTransform;
  };

  return (
    <div className="dashboard-tiktok-container">
      {/* Fixed Header with Motivation */}
      <DashboardHeader motivationalQuote={motivationalQuote} />
      
      {/* Main Content Area */}
      <div 
        className={`dashboard-content ${activeTab !== 'home' ? 'tab-active' : ''}`}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Reset Button - Only show on home tab */}
        {activeTab === 'home' && (
          <button 
            className="reset-button-minimal"
            onClick={handleResetJourney}
            title="Reiniciar viaje"
          >
            <RefreshCw size={16} />
          </button>
        )}
        
        {/* Content based on active tab */}
        {activeTab === 'home' ? (
          /* Card Stack */
          <div className="cards-wrapper">
            {cards.length > 0 ? (
              cards.map((card, index) => {
                const isActive = index === currentCardIndex;
                const isPassed = index < currentCardIndex;
                const isNext = index === currentCardIndex + 1;
                const isPrev = index === currentCardIndex - 1;
                const isVisible = Math.abs(index - currentCardIndex) <= 2;
                
                // Special handling for wrapping
                const isLastCard = currentCardIndex === cards.length - 1;
                const isFirstCard = currentCardIndex === 0;
                
                // Show first card as next when on last card
                if (isLastCard && index === 0) {
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className="card-container next"
                      style={{
                        transform: `translateY(100%)`,
                        opacity: 0.8,
                        pointerEvents: 'none',
                        transition: isDragging ? 'none' : undefined
                      }}
                    >
                      <div className={`card-gradient bg-gradient-to-br ${card.color || 'from-blue-400 to-purple-600'}`}>
                        {renderCard(card)}
                      </div>
                    </div>
                  );
                }
                
                // Show last card as prev when on first card
                if (isFirstCard && index === cards.length - 1) {
                  return (
                    <div
                      key={`${card.id}-${index}`}
                      className="card-container prev"
                      style={{
                        transform: `translateY(-100%)`,
                        opacity: 0.8,
                        pointerEvents: 'none',
                        transition: isDragging ? 'none' : undefined
                      }}
                    >
                      <div className={`card-gradient bg-gradient-to-br ${card.color || 'from-blue-400 to-purple-600'}`}>
                        {renderCard(card)}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div
                    key={`${card.id}-${index}`}
                    className={`card-container ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''} ${isNext ? 'next' : ''} ${isPrev ? 'prev' : ''}`}
                    style={{
                      transform: `translateY(${getCardTransform(index)}%)`,
                      opacity: isVisible ? 1 : 0,
                      pointerEvents: isActive ? 'auto' : 'none',
                      transition: isDragging ? 'none' : undefined
                    }}
                  >
                    <div className={`card-gradient bg-gradient-to-br ${card.color || 'from-blue-400 to-purple-600'}`}>
                      {renderCard(card)}
                    </div>
                  </div>
                );
              })
            ) : (
              // Loading state
              <div className="loading-state">
                <Sparkles size={48} className="loading-icon" />
                <p>Preparando tus tareas...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'progress' ? (
          <ProgressView 
            completedTasks={completedTasks} 
            dayNumber={dayNumber}
            userName={userName}
          />
        ) : (
          /* Profile tab placeholder */
          <div className="profile-placeholder">
            <User size={48} />
            <p>Perfil próximamente</p>
          </div>
        )}
      </div>
      
      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Dashboard;
