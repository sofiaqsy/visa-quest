import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { progressService, analyticsService, scheduleService, goalsService } from '../../firebase/services';
import { Sparkles, RefreshCw, User, Home, Trophy, Settings } from 'lucide-react';
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
import TaskScheduler from './TaskScheduler';
import ScheduleSettings from '../Settings/ScheduleSettings';
import NotificationManager from '../Notifications/NotificationManager';
import soundManager from '../../utils/soundManager';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import './Dashboard.css';

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

// Header Component - Now shows contextual greeting
const DashboardHeader = ({ motivationalQuote }) => (
  <div className="dashboard-header-minimal">
    <div className="motivation-banner-minimal">
      <Sparkles size={14} className="sparkle-icon" />
      <p className="motivation-text-minimal">{motivationalQuote}</p>
      <Sparkles size={14} className="sparkle-icon" />
    </div>
  </div>
);

// Navigation Tab Bar - Updated with settings
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
      className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
      onClick={() => onTabChange('settings')}
    >
      <Settings size={20} />
      <span>Ajustes</span>
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
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [userName, setUserName] = useState('');
  const [activeGoals, setActiveGoals] = useState([]);
  const [userPreferences, setUserPreferences] = useState(DEFAULT_USER_PREFERENCES);
  const [currentTasks, setCurrentTasks] = useState([]);
  
  // Import task scheduling features
  const { 
    soundSettings, 
    playAmbientSound
  } = useTaskScheduling();

  const initializeDashboard = useCallback(async () => {
    console.log('Initializing dashboard...');
    
    // Initialize sound manager
    await soundManager.init();
    
    // Get user name
    const savedName = localStorage.getItem('visa-quest-user-name') || currentUser?.displayName || 'Amiga';
    setUserName(savedName);
    
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
    
    // Play ambient sound based on time
    const timeContext = getCurrentTimeContext();
    playAmbientSound(timeContext);

    // Initialize Firebase collections
    try {
      // Initialize schedule in Firebase
      await scheduleService.initializeUserSchedule(currentUser?.uid);
      
      // Initialize goals in Firebase
      await goalsService.initializeUserGoals(currentUser?.uid);
      
      // Sync local goals to Firebase
      if (savedGoals.length > 0) {
        await goalsService.updateUserGoals(currentUser?.uid, {
          activeGoals: savedGoals,
          preferences: savedPreferences
        });
      }
      
      console.log('Firebase collections initialized');
    } catch (error) {
      console.error('Error initializing Firebase collections:', error);
    }

    // Track dashboard view
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'dashboard_view', { 
        dayNumber: calculatedDay,
        activeGoals: savedGoals.length || 3
      });
    }
  }, [currentUser, playAmbientSound]);

  useEffect(() => {
    initializeDashboard();
  }, [initializeDashboard]);

  useEffect(() => {
    // Generate tasks using smart distribution
    if (activeGoals.length > 0) {
      const distributedTasks = getSmartTaskDistribution(
        activeGoals,
        completedTasks,
        userPreferences
      );
      
      setCurrentTasks(distributedTasks);
    }
  }, [activeGoals, completedTasks, userPreferences]);

  // Update greeting based on time
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationalQuote(getContextualGreeting());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleTaskComplete = async (taskId) => {
    if (completedTasks.includes(taskId)) return;

    // Play completion sound
    if (soundSettings.enabled) {
      await soundManager.playTaskComplete();
    }

    // Update completed tasks
    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);
    localStorage.setItem('visa-quest-completed-tasks', JSON.stringify(newCompleted));

    // Save to Firebase
    const task = currentTasks.find(t => t.id === taskId);
    if (task && progressService && progressService.completeTask) {
      await progressService.completeTask(currentUser?.uid, {
        taskId,
        taskTitle: task.title,
        category: task.category,
        dayNumber,
        completedAt: new Date().toISOString()
      });
    }

    // Update goal progress in Firebase
    if (task) {
      const goalId = activeGoals.find(g => g.category === task.category)?.id;
      if (goalId) {
        const categoryTasks = newCompleted.filter(id => {
          const t = currentTasks.find(ct => ct.id === id);
          return t && t.category === task.category;
        });
        await goalsService.updateGoalProgress(currentUser?.uid, goalId, categoryTasks.length);
      }
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
  const handleGoalsUpdate = async (updatedGoals) => {
    console.log('Updating goals:', updatedGoals);
    setActiveGoals(updatedGoals);
    localStorage.setItem('visa-quest-active-goals', JSON.stringify(updatedGoals));
    
    // Update in Firebase
    try {
      await goalsService.updateUserGoals(currentUser?.uid, {
        activeGoals: updatedGoals
      });
    } catch (error) {
      console.error('Error updating goals in Firebase:', error);
    }
    
    // Track goal changes
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'goals_updated', { 
        totalGoals: updatedGoals.length,
        activeGoals: updatedGoals.filter(g => g.active).length
      });
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
      localStorage.removeItem('visa-quest-active-goals');
      localStorage.removeItem('visa-quest-preferences');
      localStorage.removeItem('visa-quest-sound-settings');
      
      // Reload the page to start fresh
      window.location.href = '/';
    }
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    console.log('Changing tab to:', tab);
    setActiveTab(tab);
    
    // Track tab change
    if (analyticsService && analyticsService.trackAction) {
      analyticsService.trackAction(currentUser?.uid, 'tab_changed', { tab });
    }
  };

  return (
    <div className="dashboard-tiktok-container">
      {/* Fixed Header with Motivation */}
      <DashboardHeader motivationalQuote={motivationalQuote} />
      
      {/* Show notification manager on home tab */}
      {activeTab === 'home' && (
        <div className="px-4 mt-2">
          <NotificationManager />
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="dashboard-content">
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
          /* Task Scheduler with Sound Integration */
          <TaskScheduler 
            tasks={currentTasks} 
            onTaskComplete={handleTaskComplete}
          />
        ) : activeTab === 'progress' ? (
          <SimpleProgressView 
            completedTasks={completedTasks}
            activeGoals={activeGoals}
            userName={userName}
            onGoalsUpdate={handleGoalsUpdate}
          />
        ) : activeTab === 'settings' ? (
          <ScheduleSettings />
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
