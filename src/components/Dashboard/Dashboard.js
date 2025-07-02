import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { progressService, analyticsService } from '../../firebase/services';
import { CheckCircle, Circle, Sparkles, BookOpen, RefreshCw, User, Home, Trophy } from 'lucide-react';
import { 
  getSmartTaskDistribution, 
  getContextualGreeting,
  getCurrentTimeContext,
  GOAL_CATEGORIES,
  WORK_TASKS,
  PERSONAL_TASKS,
  DEFAULT_USER_PREFERENCES
} from '../../data/goals';
import SimpleProgressView from './SimpleProgressView';
import DailyPhrases from '../DailyPhrases'; // Import the new component
import './Dashboard.css';

// Card types for different activities
const CARD_TYPES = {
  TASK: 'task',
  TIP: 'tip'
};

// Category icons and colors
const CATEGORY_CONFIG = {
  [GOAL_CATEGORIES.VISA.id]: { icon: '🇨🇦', gradient: 'from-blue-400 to-blue-600' },
  [GOAL_CATEGORIES.WORK.id]: { icon: '💼', gradient: 'from-purple-400 to-purple-600' },
  [GOAL_CATEGORIES.PERSONAL.id]: { icon: '✨', gradient: 'from-pink-400 to-pink-600' },
  [GOAL_CATEGORIES.HEALTH.id]: { icon: '💪', gradient: 'from-green-400 to-green-600' },
  [GOAL_CATEGORIES.LEARNING.id]: { icon: '📚', gradient: 'from-yellow-400 to-yellow-600' },
  [GOAL_CATEGORIES.FINANCE.id]: { icon: '💰', gradient: 'from-indigo-400 to-indigo-600' }
};

// Get all tasks for progress calculation  
const getAllTasks = (activeGoals) => {
  const allTasks = [];
  
  activeGoals.forEach(goal => {
    if (goal.tasks) {
      allTasks.push(...goal.tasks);
    }
  });
  
  return allTasks;
};

// Daily tasks data organized by day (for visa goal)
const getTasksByDay = (dayNumber) => {
  const tasksByDay = {
    1: [
      { 
        id: 'visa_1_1',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '📋',
        title: "Revisar requisitos de visa",
        description: "Lee la lista completa de documentos necesarios para tu visa de turista",
        time: "15 min",
        emoji: '🔍',
        color: 'from-blue-400 to-blue-600',
        tips: ['Guarda la lista en tu teléfono', 'Marca los documentos que ya tienes'],
        preferredTime: ['EVENING', 'NIGHT']
      },
      { 
        id: 'visa_1_2',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '🛂',
        title: "Verificar pasaporte",
        description: "Asegúrate que esté vigente por al menos 6 meses desde tu fecha de viaje",
        time: "5 min",
        emoji: '✅',
        color: 'from-purple-400 to-purple-600',
        tips: ['Revisa la fecha de vencimiento', 'Toma una foto clara de la página principal'],
        preferredTime: ['LUNCH', 'EVENING']
      },
      { 
        id: 'visa_1_3',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '📁',
        title: "Crear carpeta digital",
        description: "Organiza tus documentos en Google Drive o Dropbox",
        time: "10 min",
        emoji: '☁️',
        color: 'from-green-400 to-green-600',
        tips: ['Crea subcarpetas por tipo de documento', 'Comparte el acceso con alguien de confianza'],
        preferredTime: ['EVENING', 'NIGHT']
      }
    ],
    2: [
      { 
        id: 'visa_2_1',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '📸',
        title: "Fotografías para visa",
        description: "Toma fotos con fondo blanco según las especificaciones canadienses",
        time: "20 min",
        emoji: '🤳',
        color: 'from-pink-400 to-pink-600',
        tips: ['Fondo blanco sin sombras', 'Sin lentes ni accesorios', 'Expresión neutral'],
        preferredTime: ['LUNCH', 'EVENING']
      },
      { 
        id: 'visa_2_2',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '💰',
        title: "Estado de cuenta bancario",
        description: "Solicita los últimos 6 meses en tu banco",
        time: "30 min",
        emoji: '🏦',
        color: 'from-yellow-400 to-yellow-600',
        tips: ['Puede ser digital o físico', 'Debe mostrar tu nombre completo', 'Saldo promedio importante'],
        preferredTime: ['LUNCH']
      },
      { 
        id: 'visa_2_3',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '💼',
        title: "Carta de empleo",
        description: "Pide a RRHH una carta con tu salario, cargo y antigüedad",
        time: "15 min",
        emoji: '📄',
        color: 'from-indigo-400 to-indigo-600',
        tips: ['En papel membretado', 'Firmada y sellada', 'Mencione tu permiso de vacaciones'],
        preferredTime: ['MORNING', 'AFTERNOON']
      }
    ],
    3: [
      {
        id: 'visa_3_1',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '✈️',
        title: "Itinerario de vuelo",
        description: "Reserva o cotiza tus vuelos de ida y vuelta",
        time: "45 min",
        emoji: '🎫',
        color: 'from-cyan-400 to-cyan-600',
        tips: ['No pagues hasta tener la visa', 'Guarda las cotizaciones en PDF', 'Fechas flexibles son mejores'],
        preferredTime: ['EVENING', 'NIGHT']
      },
      {
        id: 'visa_3_2',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '🏨',
        title: "Reserva de hotel",
        description: "Busca alojamiento con cancelación gratuita",
        time: "30 min",
        emoji: '🛏️',
        color: 'from-orange-400 to-orange-600',
        tips: ['Booking.com tiene cancelación gratis', 'Imprime las confirmaciones', 'Cerca de transporte público'],
        preferredTime: ['EVENING', 'NIGHT']
      },
      {
        id: 'visa_3_3',
        category: GOAL_CATEGORIES.VISA.id,
        icon: '🗺️',
        title: "Plan de viaje",
        description: "Crea un itinerario día por día de tu visita",
        time: "25 min",
        emoji: '📍',
        color: 'from-red-400 to-red-600',
        tips: ['Incluye lugares turísticos', 'Agrega direcciones', 'Demuestra que volverás'],
        preferredTime: ['EVENING', 'NIGHT']
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

// Header Component - Now shows contextual greeting and daily phrases
const DashboardHeader = ({ motivationalQuote, userMood }) => (
  <div className="dashboard-header-minimal">
    <div className="motivation-banner-minimal">
      <Sparkles size={14} className="sparkle-icon" />
      <p className="motivation-text-minimal">{motivationalQuote}</p>
      <Sparkles size={14} className="sparkle-icon" />
    </div>
  </div>
);

// Task Card Component - Enhanced with category tag
const TaskCard = ({ card, onComplete }) => {
  const categoryConfig = CATEGORY_CONFIG[card.category] || CATEGORY_CONFIG[GOAL_CATEGORIES.PERSONAL.id];
  const categoryInfo = Object.values(GOAL_CATEGORIES).find(cat => cat.id === card.category);
  
  return (
    <div className={`card-content task-card ${card.completed ? 'completed' : ''}`}>
      {/* Category tag */}
      {card.category && categoryInfo && (
        <div className={`task-category-tag ${card.category}`}>
          <span>{categoryConfig.icon}</span>
          <span>{categoryInfo.name}</span>
        </div>
      )}
      
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
};

// Tip Card Component - Enhanced to show daily phrases
const TipCard = ({ card, userMood }) => (
  <div className="card-content tip-card">
    <div className="tip-header">
      <Sparkles size={24} />
      <h2>{card.title}</h2>
    </div>
    <p className="tip-content">{card.content}</p>
    
    {/* Show daily phrases in tip cards */}
    {card.showDailyPhrases && userMood && (
      <div className="tip-daily-phrases">
        <DailyPhrases userMood={userMood} />
      </div>
    )}
    
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

// Main Dashboard Component with Multiple Goals Support
const Dashboard = () => {
  const { currentUser } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName] = useState('');
  const [activeGoals, setActiveGoals] = useState([]);
  const [userPreferences, setUserPreferences] = useState(DEFAULT_USER_PREFERENCES);
  const [isChangingTab, setIsChangingTab] = useState(false);
  const [savedCardIndex, setSavedCardIndex] = useState(0); // Store card position when leaving home tab
  const [wheelListenerActive, setWheelListenerActive] = useState(false);
  const [userMood, setUserMood] = useState(null); // New state for user mood
  
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
    console.log('Initializing dashboard...');
    
    // Get user name
    const savedName = localStorage.getItem('visa-quest-user-name') || currentUser?.displayName || 'Amiga';
    setUserName(savedName);
    
    // Get user mood from localStorage
    const savedMood = localStorage.getItem('visa-quest-daily-mood');
    if (savedMood) {
      try {
        const parsed = JSON.parse(savedMood);
        const today = new Date().toDateString();
        if (parsed.date === today) {
          setUserMood(parsed.mood);
        }
      } catch (e) {
        console.error('Error parsing mood:', e);
      }
    }
    
    // Calculate day number for visa goal
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

    // Initialize active goals
    const savedGoals = JSON.parse(localStorage.getItem('visa-quest-active-goals') || '[]');
    
    console.log('Saved goals:', savedGoals);
    
    // Default goals if none saved
    if (savedGoals.length === 0) {
      const defaultGoals = [
        {
          id: 'visa-canada',
          name: 'Visa Canadá',
          category: GOAL_CATEGORIES.VISA.id,
          active: true,
          tasks: getTasksByDay(calculatedDay)
        },
        {
          id: 'work-productivity',
          name: 'Productividad Laboral',
          category: GOAL_CATEGORIES.WORK.id,
          active: true,
          tasks: WORK_TASKS
        },
        {
          id: 'daily-wellness',
          name: 'Bienestar Diario',
          category: GOAL_CATEGORIES.HEALTH.id,
          active: true,
          tasks: PERSONAL_TASKS.filter(t => t.category === GOAL_CATEGORIES.HEALTH.id)
        }
      ];
      
      console.log('Setting default goals:', defaultGoals);
      setActiveGoals(defaultGoals);
      localStorage.setItem('visa-quest-active-goals', JSON.stringify(defaultGoals));
    } else {
      // Update visa tasks for current day
      const updatedGoals = savedGoals.map(goal => {
        if (goal.id === 'visa-canada') {
          return { ...goal, tasks: getTasksByDay(calculatedDay) };
        }
        return goal;
      });
      console.log('Updated goals:', updatedGoals);
      setActiveGoals(updatedGoals);
    }

    // Get user preferences
    const savedPreferences = JSON.parse(
      localStorage.getItem('visa-quest-preferences') || 
      JSON.stringify(DEFAULT_USER_PREFERENCES)
    );
    setUserPreferences(savedPreferences);

    // Set contextual greeting
    setMotivationalQuote(getContextualGreeting());

    // Track dashboard view
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'dashboard_view', { 
        dayNumber: calculatedDay,
        activeGoals: savedGoals.length || 3
      });
    }
  }, [currentUser]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  useEffect(() => {
    // Generate cards using smart distribution
    if (activeGoals.length > 0) {
      const distributedTasks = getSmartTaskDistribution(
        activeGoals,
        completedTasks,
        userPreferences
      );
      
      // Convert to card format and add daily phrases card
      const formattedCards = distributedTasks.map(item => {
        if (item.type === 'tip') {
          return {
            type: CARD_TYPES.TIP,
            ...item
          };
        }
        
        const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG[GOAL_CATEGORIES.PERSONAL.id];
        
        return {
          type: CARD_TYPES.TASK,
          ...item,
          color: item.color || categoryConfig.gradient,
          completed: completedTasks.includes(item.id)
        };
      });
      
      // Add a daily phrases card if user has mood
      if (userMood) {
        const phrasesCard = {
          id: 'daily-phrases-card',
          type: CARD_TYPES.TIP,
          title: 'Tu frase motivacional del día',
          content: 'Basada en cómo te sientes hoy',
          color: 'from-purple-400 to-pink-600',
          showDailyPhrases: true
        };
        
        // Insert it as the second card
        formattedCards.splice(1, 0, phrasesCard);
      }
      
      setCards(formattedCards);
    }
  }, [activeGoals, completedTasks, userPreferences, userMood]);

  // Update greeting based on time
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationalQuote(getContextualGreeting());
    }, 60000); // Update every minute

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
    if (task && progressService && progressService.completeTask) {
      await progressService.completeTask(currentUser?.uid, {
        taskId,
        taskTitle: task.title,
        category: task.category,
        dayNumber,
        completedAt: new Date().toISOString()
      });
    }

    // Calculate progress for tracking
    const allTasks = getAllTasks(activeGoals);
    const progress = Math.round((newCompleted.length / allTasks.length) * 100);

    // Track action
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'task_completed', { 
        taskId, 
        category: task?.category,
        timeContext: getCurrentTimeContext(),
        progress 
      });
    }
  };

  // Handle goals update
  const handleGoalsUpdate = (updatedGoals) => {
    console.log('Updating goals:', updatedGoals);
    setActiveGoals(updatedGoals);
    localStorage.setItem('visa-quest-active-goals', JSON.stringify(updatedGoals));
    
    // Track goal changes
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'goals_updated', { 
        totalGoals: updatedGoals.length,
        activeGoals: updatedGoals.filter(g => g.active).length
      });
    }
  };

  // Enhanced card navigation with smooth animations
  const navigateToCard = useCallback((newIndex, velocity = 0) => {
    if (isTransitioning || cards.length === 0 || activeTab !== 'home') return;
    
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
  }, [cards.length, isTransitioning, activeTab]);

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

  // Mouse wheel handler with strict tab checking
  const handleWheel = useCallback((e) => {
    // Absolutely ensure we're in home tab
    if (activeTab !== 'home' || !wheelListenerActive) {
      return;
    }
    
    if (cards.length === 0 || isTransitioning) return;
    
    // Only handle wheel events when we're sure we're in home tab
    e.preventDefault();
    e.stopPropagation();
    
    const velocity = e.deltaY * 10;
    
    if (e.deltaY > 0) {
      navigateToCard(currentCardIndex + 1, velocity);
    } else if (e.deltaY < 0) {
      navigateToCard(currentCardIndex - 1, velocity);
    }
  }, [activeTab, cards.length, isTransitioning, currentCardIndex, navigateToCard, wheelListenerActive]);

  // Reset journey handler
  const handleResetJourney = () => {
    if (window.confirm('¿Estás segura que quieres reiniciar tu viaje? Esto borrará todo tu progreso local.')) {
      // Clear all localStorage data
      localStorage.removeItem('visa-quest-user-name');
      localStorage.removeItem('visa-quest-has-seen-welcome');
      localStorage.removeItem('visa-quest-daily-mood');
      localStorage.removeItem('visa-quest-completed-tasks');
      localStorage.removeItem('visa-quest-start-date');
      localStorage.removeItem('visa-quest-active-goals');
      localStorage.removeItem('visa-quest-preferences');
      
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
        return <TipCard card={card} userMood={userMood} />;
      default:
        return null;
    }
  };

  // Handle tab change - Modified to keep card position and control wheel listener
  const handleTabChange = (tab) => {
    console.log('Changing tab to:', tab);
    
    // Prevent multiple rapid tab changes
    if (isChangingTab) return;
    
    setIsChangingTab(true);
    
    // Save current card index when leaving home tab
    if (activeTab === 'home' && tab !== 'home') {
      setSavedCardIndex(currentCardIndex);
      setWheelListenerActive(false); // Disable wheel listener
    }
    
    setActiveTab(tab);
    
    // Restore card position when returning to home
    if (tab === 'home') {
      setWheelListenerActive(true); // Enable wheel listener
      
      // Reset states immediately
      setDragOffset(0);
      setIsTransitioning(false);
      setIsDragging(false);
      setTouchStart(0);
      setTouchEnd(0);
      
      // Use requestAnimationFrame for smoother reset
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const cardElements = containerRef.current.querySelectorAll('.card-container');
          
          // First, disable transitions
          cardElements.forEach(card => {
            card.style.transition = 'none';
          });
          
          // Then reset positions to saved position
          requestAnimationFrame(() => {
            setCurrentCardIndex(savedCardIndex);
            
            cardElements.forEach((card, index) => {
              const offset = (index - savedCardIndex) * 100;
              
              if (index === savedCardIndex) {
                card.style.transform = 'translateY(0) scale(1)';
                card.style.opacity = '1';
              } else if (index < savedCardIndex) {
                card.style.transform = `translateY(${offset}%) scale(0.95)`;
                card.style.opacity = '0';
              } else {
                card.style.transform = `translateY(${offset}%) scale(0.95)`;
                card.style.opacity = index === savedCardIndex + 1 ? '0.8' : '0';
              }
            });
            
            // Re-enable transitions after a small delay
            requestAnimationFrame(() => {
              cardElements.forEach(card => {
                card.style.transition = '';
              });
              setIsChangingTab(false);
            });
          });
        } else {
          setCurrentCardIndex(savedCardIndex);
          setIsChangingTab(false);
        }
      });
    } else {
      setIsChangingTab(false);
    }
    
    // Track tab change
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'tab_changed', { tab });
    }
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

  // Set initial wheel listener state
  useEffect(() => {
    setWheelListenerActive(activeTab === 'home');
  }, [activeTab]);

  // Add event listener only for the content area with strict checking
  useEffect(() => {
    const contentElement = containerRef.current;
    
    if (contentElement && activeTab === 'home' && wheelListenerActive) {
      const wheelHandler = (e) => {
        if (activeTab === 'home' && wheelListenerActive) {
          handleWheel(e);
        }
      };
      
      // Add passive: false to allow preventDefault
      contentElement.addEventListener('wheel', wheelHandler, { passive: false });
      
      return () => {
        contentElement.removeEventListener('wheel', wheelHandler);
      };
    }
  }, [handleWheel, activeTab, wheelListenerActive]);

  return (
    <div className="dashboard-tiktok-container">
      {/* Fixed Header with Motivation */}
      <DashboardHeader motivationalQuote={motivationalQuote} userMood={userMood} />
      
      {/* Main Content Area */}
      <div 
        className={`dashboard-content ${activeTab !== 'home' ? 'tab-active' : ''}`}
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ 
          overflow: activeTab === 'home' ? 'hidden' : 'auto',
          touchAction: activeTab === 'home' ? 'none' : 'auto'
        }}
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
                      opacity: isVisible ? (isActive ? 1 : (isNext || isPrev ? 0.8 : 0)) : 0,
                      pointerEvents: isActive ? 'auto' : 'none',
                      transition: isDragging || isChangingTab ? 'none' : undefined,
                      zIndex: isActive ? 10 : (isNext ? 5 : 1)
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
                <p>Preparando tus tareas contextuales...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'progress' ? (
          <SimpleProgressView 
            completedTasks={completedTasks}
            activeGoals={activeGoals}
            userName={userName}
            onGoalsUpdate={handleGoalsUpdate}
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