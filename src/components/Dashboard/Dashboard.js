import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { moodService, progressService, analyticsService } from '../../firebase/services';
import { CheckCircle, Circle, ChevronUp, ChevronDown, Sparkles, BookOpen, RefreshCw, User, Home, Trophy } from 'lucide-react';
import './Dashboard.css';

// Card types for different activities
const CARD_TYPES = {
  TASK: 'task',
  TIP: 'tip'
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

// Motivational quotes that rotate
const motivationalQuotes = [
  "Cada documento es un paso más cerca de tu sueño canadiense 🇨🇦",
  "El viaje de mil millas comienza con un solo paso ✨",
  "Tu futuro en Canadá está más cerca de lo que piensas 🌟",
  "Hoy es el día perfecto para avanzar hacia tus metas 🚀",
  "Confía en el proceso, todo saldrá bien 💝"
];

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

// Helper function for time greeting
const getTimeOfDayGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

// Header Component with Motivation
const DashboardHeader = ({ userName, dayNumber, todayMood, motivationalQuote, onNavigate, activeTab }) => (
  <div className="dashboard-header-fixed">
    <div className="header-top">
      <div className="greeting-section">
        <h1 className="greeting-text">{getTimeOfDayGreeting()}, {userName}!</h1>
        <p className="day-indicator">Día {dayNumber} de 21</p>
      </div>
      {todayMood && (
        <div className="mood-indicator-small">
          <span className="mood-emoji-small">{todayMood.emoji}</span>
        </div>
      )}
    </div>
    
    <div className="motivation-banner">
      <Sparkles size={16} className="sparkle-icon" />
      <p className="motivation-text">{motivationalQuote}</p>
      <Sparkles size={16} className="sparkle-icon" />
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
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  
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

    // Set motivational quote
    setMotivationalQuote(motivationalQuotes[dayNumber % motivationalQuotes.length]);

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
    const dailyCards = getDailyCards(dayNumber, completedTasks);
    setCards(dailyCards);
  }, [dayNumber, completedTasks]);

  // Rotate motivational quote every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setMotivationalQuote(randomQuote);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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

    // Show celebration if all tasks for today are done
    const todaysTasks = cards.filter(c => c.type === CARD_TYPES.TASK);
    const completedToday = todaysTasks.filter(t => newCompleted.includes(t.id)).length;
    if (completedToday === todaysTasks.length) {
      // TODO: Show celebration animation
    }
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
    // TODO: Implement profile and progress views
  };

  return (
    <div className="dashboard-container-new">
      {/* Fixed Header with Motivation */}
      <DashboardHeader 
        userName={userName}
        dayNumber={dayNumber}
        todayMood={todayMood}
        motivationalQuote={motivationalQuote}
        onNavigate={handleTabChange}
        activeTab={activeTab}
      />
      
      {/* Main Content Area */}
      <div 
        className="dashboard-content"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Reset Button */}
        <button 
          className="reset-button-new"
          onClick={handleResetJourney}
          title="Reiniciar viaje"
        >
          <RefreshCw size={16} />
        </button>
        
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
        
        {/* Card Counter */}
        <div className="card-counter">
          {currentCardIndex + 1} / {cards.length}
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
        
        {/* Progress Dots */}
        <div className="progress-dots">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`progress-dot ${
                index === currentCardIndex ? 'active' : ''
              } ${
                card.type === CARD_TYPES.TASK && card.completed ? 'completed' : ''
              }`}
              onClick={() => setCurrentCardIndex(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Dashboard;
