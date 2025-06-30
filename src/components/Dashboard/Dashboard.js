import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { progressService, analyticsService } from '../../firebase/services';
import { CheckCircle, Circle, Sparkles, BookOpen, RefreshCw, User, Home, Trophy, Target, Award, TrendingUp, Plus, X, Settings } from 'lucide-react';
import { 
  getSmartTaskDistribution, 
  getContextualGreeting,
  getCurrentTimeContext,
  GOAL_CATEGORIES,
  WORK_TASKS,
  PERSONAL_TASKS,
  DEFAULT_USER_PREFERENCES
} from '../../data/goals';
import './Dashboard.css';

// Card types for different activities
const CARD_TYPES = {
  TASK: 'task',
  TIP: 'tip'
};

// Category icons and colors
const CATEGORY_CONFIG = {
  [GOAL_CATEGORIES.VISA]: { icon: '🇨🇦', gradient: 'from-blue-400 to-blue-600' },
  [GOAL_CATEGORIES.WORK]: { icon: '💼', gradient: 'from-purple-400 to-purple-600' },
  [GOAL_CATEGORIES.PERSONAL]: { icon: '✨', gradient: 'from-pink-400 to-pink-600' },
  [GOAL_CATEGORIES.HEALTH]: { icon: '💪', gradient: 'from-green-400 to-green-600' },
  [GOAL_CATEGORIES.LEARNING]: { icon: '📚', gradient: 'from-yellow-400 to-yellow-600' },
  [GOAL_CATEGORIES.FINANCE]: { icon: '💰', gradient: 'from-indigo-400 to-indigo-600' }
};

// Predefined goal templates
const GOAL_TEMPLATES = {
  [GOAL_CATEGORIES.VISA]: [
    { id: 'visa-canada', name: 'Visa Canadá', description: 'Proceso completo para visa de turista' },
    { id: 'visa-usa', name: 'Visa Estados Unidos', description: 'Documentación para visa americana' },
    { id: 'visa-europe', name: 'Visa Schengen', description: 'Preparación para visa europea' }
  ],
  [GOAL_CATEGORIES.WORK]: [
    { id: 'work-productivity', name: 'Productividad Laboral', description: 'Mejora tu eficiencia diaria' },
    { id: 'work-project', name: 'Proyecto Q1', description: 'Completar proyecto del trimestre' },
    { id: 'work-skills', name: 'Desarrollo Profesional', description: 'Nuevas habilidades técnicas' }
  ],
  [GOAL_CATEGORIES.HEALTH]: [
    { id: 'health-exercise', name: 'Rutina de Ejercicio', description: '30 días de actividad física' },
    { id: 'health-nutrition', name: 'Alimentación Saludable', description: 'Mejora tus hábitos alimenticios' },
    { id: 'health-mindfulness', name: 'Bienestar Mental', description: 'Meditación y mindfulness diario' }
  ],
  [GOAL_CATEGORIES.PERSONAL]: [
    { id: 'personal-hobby', name: 'Nuevo Hobby', description: 'Aprende algo nuevo este mes' },
    { id: 'personal-organize', name: 'Organización Personal', description: 'Ordena tu vida y espacios' },
    { id: 'personal-social', name: 'Vida Social', description: 'Fortalece tus relaciones' }
  ],
  [GOAL_CATEGORIES.LEARNING]: [
    { id: 'learning-language', name: 'Nuevo Idioma', description: 'Practica 15 minutos al día' },
    { id: 'learning-course', name: 'Curso Online', description: 'Completa un curso este mes' },
    { id: 'learning-reading', name: 'Hábito de Lectura', description: 'Lee 20 páginas diarias' }
  ],
  [GOAL_CATEGORIES.FINANCE]: [
    { id: 'finance-savings', name: 'Meta de Ahorro', description: 'Ahorra para tu objetivo' },
    { id: 'finance-budget', name: 'Presupuesto Mensual', description: 'Controla tus gastos' },
    { id: 'finance-investment', name: 'Inversión Inteligente', description: 'Aprende a invertir' }
  ]
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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
        category: GOAL_CATEGORIES.VISA,
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

// Get tasks for a goal template
const getTasksForGoal = (goalId, category) => {
  switch (category) {
    case GOAL_CATEGORIES.VISA:
      if (goalId === 'visa-canada') {
        return getTasksByDay(1); // Return first day tasks as example
      }
      // Add other visa types here
      return [];
    
    case GOAL_CATEGORIES.WORK:
      return WORK_TASKS;
    
    case GOAL_CATEGORIES.HEALTH:
      return PERSONAL_TASKS.filter(t => t.category === GOAL_CATEGORIES.HEALTH);
    
    case GOAL_CATEGORIES.PERSONAL:
      return PERSONAL_TASKS.filter(t => t.category === GOAL_CATEGORIES.PERSONAL);
    
    case GOAL_CATEGORIES.LEARNING:
      return PERSONAL_TASKS.filter(t => t.category === GOAL_CATEGORIES.LEARNING);
    
    default:
      return [];
  }
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

// Task Card Component - Enhanced with category tag
const TaskCard = ({ card, onComplete }) => {
  const categoryConfig = CATEGORY_CONFIG[card.category] || CATEGORY_CONFIG[GOAL_CATEGORIES.PERSONAL];
  
  return (
    <div className={`card-content task-card ${card.completed ? 'completed' : ''}`}>
      {/* Category tag */}
      {card.category && (
        <div className={`task-category-tag ${card.category}`}>
          <span>{categoryConfig.icon}</span>
          <span>{card.category}</span>
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

// Goal Manager Component
const GoalManager = ({ activeGoals, onGoalsUpdate, completedTasks }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  const handleAddGoal = () => {
    if (selectedTemplate && selectedCategory) {
      const newGoal = {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        category: selectedCategory,
        description: selectedTemplate.description,
        active: true,
        tasks: getTasksForGoal(selectedTemplate.id, selectedCategory),
        createdAt: new Date().toISOString()
      };
      
      const updatedGoals = [...activeGoals, newGoal];
      onGoalsUpdate(updatedGoals);
      
      // Reset form
      setShowAddGoal(false);
      setSelectedCategory('');
      setSelectedTemplate(null);
    }
  };
  
  const handleToggleGoal = (goalId) => {
    const updatedGoals = activeGoals.map(goal => 
      goal.id === goalId ? { ...goal, active: !goal.active } : goal
    );
    onGoalsUpdate(updatedGoals);
  };
  
  const handleDeleteGoal = (goalId) => {
    if (window.confirm('¿Estás seguro de eliminar este objetivo?')) {
      const updatedGoals = activeGoals.filter(goal => goal.id !== goalId);
      onGoalsUpdate(updatedGoals);
    }
  };
  
  return (
    <div className="goal-manager">
      {/* Active Goals List */}
      <div className="active-goals-section">
        <div className="section-header">
          <h3 className="section-title">Mis Objetivos Activos</h3>
          <button 
            className="add-goal-button"
            onClick={() => setShowAddGoal(true)}
          >
            <Plus size={20} />
            <span>Agregar Objetivo</span>
          </button>
        </div>
        
        <div className="goals-grid">
          {activeGoals.map(goal => {
            const config = CATEGORY_CONFIG[goal.category];
            const goalTasks = goal.tasks || [];
            const completedGoalTasks = goalTasks.filter(task => 
              completedTasks.includes(task.id)
            );
            const progress = goalTasks.length > 0 
              ? Math.round((completedGoalTasks.length / goalTasks.length) * 100)
              : 0;
            
            return (
              <div key={goal.id} className={`goal-card ${!goal.active ? 'inactive' : ''}`}>
                <div className="goal-card-header">
                  <span className="goal-icon">{config.icon}</span>
                  <div className="goal-actions">
                    <button 
                      className="goal-toggle"
                      onClick={() => handleToggleGoal(goal.id)}
                      title={goal.active ? 'Desactivar' : 'Activar'}
                    >
                      <Settings size={16} />
                    </button>
                    <button 
                      className="goal-delete"
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Eliminar objetivo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                
                <h4 className="goal-name">{goal.name}</h4>
                <p className="goal-description">{goal.description}</p>
                
                <div className="goal-progress">
                  <div className="goal-progress-bar">
                    <div 
                      className="goal-progress-fill"
                      style={{ 
                        width: `${progress}%`,
                        background: `linear-gradient(to right, ${config.gradient.split(' ')[0].replace('from-', '#')}, ${config.gradient.split(' ')[2].replace('to-', '#')})`
                      }}
                    />
                  </div>
                  <span className="goal-progress-text">{progress}% completado</span>
                </div>
                
                <div className="goal-stats">
                  <span>{completedGoalTasks.length}/{goalTasks.length} tareas</span>
                  <span className={`goal-status ${goal.active ? 'active' : 'inactive'}`}>
                    {goal.active ? 'Activo' : 'Pausado'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="modal-overlay" onClick={() => setShowAddGoal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Agregar Nuevo Objetivo</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddGoal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Category Selection */}
              <div className="form-group">
                <label>Selecciona una categoría:</label>
                <div className="category-grid">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <button
                      key={key}
                      className={`category-option ${selectedCategory === key ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategory(key);
                        setSelectedTemplate(null);
                      }}
                    >
                      <span className="category-option-icon">{config.icon}</span>
                      <span className="category-option-name">{key}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Template Selection */}
              {selectedCategory && (
                <div className="form-group">
                  <label>Elige un objetivo:</label>
                  <div className="template-list">
                    {GOAL_TEMPLATES[selectedCategory]?.map(template => (
                      <button
                        key={template.id}
                        className={`template-option ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTemplate(template)}
                        disabled={activeGoals.some(g => g.id === template.id)}
                      >
                        <div className="template-info">
                          <h4>{template.name}</h4>
                          <p>{template.description}</p>
                        </div>
                        {activeGoals.some(g => g.id === template.id) && (
                          <span className="template-status">Ya agregado</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="modal-button cancel"
                onClick={() => setShowAddGoal(false)}
              >
                Cancelar
              </button>
              <button 
                className="modal-button confirm"
                onClick={handleAddGoal}
                disabled={!selectedTemplate || !selectedCategory}
              >
                Agregar Objetivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Progress View Component - Enhanced for multiple goals
const ProgressView = ({ completedTasks, activeGoals, userName, onGoalsUpdate }) => {
  const allTasks = getAllTasks(activeGoals);
  const totalTasks = allTasks.length;
  const completedCount = completedTasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  // Calculate progress by category
  const progressByCategory = {};
  Object.values(GOAL_CATEGORIES).forEach(category => {
    const categoryTasks = allTasks.filter(task => task.category === category);
    const categoryCompleted = completedTasks.filter(taskId => 
      categoryTasks.some(task => task.id === taskId)
    );
    
    if (categoryTasks.length > 0) {
      progressByCategory[category] = {
        total: categoryTasks.length,
        completed: categoryCompleted.length,
        percentage: Math.round((categoryCompleted.length / categoryTasks.length) * 100)
      };
    }
  });
  
  return (
    <div className="progress-view" style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a1a1a, #000)' }}>
      {/* Header */}
      <div className="progress-header">
        <h1 className="progress-title">Tu Progreso Global</h1>
        <p className="progress-subtitle">¡Hola {userName}! Mira todo lo que has avanzado 🌟</p>
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
            <span className="progress-label">Total</span>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Target size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{activeGoals.filter(g => g.active).length}</span>
            <span className="stat-label">Objetivos activos</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
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
            <span className="stat-value">{totalTasks - completedCount}</span>
            <span className="stat-label">Tareas pendientes</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Award size={24} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{Object.keys(progressByCategory).length}</span>
            <span className="stat-label">Categorías activas</span>
          </div>
        </div>
      </div>
      
      {/* Goal Manager */}
      <GoalManager 
        activeGoals={activeGoals}
        onGoalsUpdate={onGoalsUpdate}
        completedTasks={completedTasks}
      />
      
      {/* Progress by Category */}
      {Object.keys(progressByCategory).length > 0 && (
        <div className="category-progress">
          <h3 className="section-title">Progreso por Categoría</h3>
          {Object.entries(progressByCategory).map(([category, data]) => {
            const config = CATEGORY_CONFIG[category];
            return (
              <div key={category} className="category-progress-item">
                <div className="category-info">
                  <span className="category-icon">{config.icon}</span>
                  <span className="category-name">{category}</span>
                </div>
                <div className="category-progress-bar">
                  <div 
                    className="category-progress-fill"
                    style={{ 
                      width: `${data.percentage}%`,
                      background: `linear-gradient(to right, ${config.gradient.split(' ')[0].replace('from-', '#')}, ${config.gradient.split(' ')[2].replace('to-', '#')})`
                    }}
                  />
                </div>
                <span className="category-stats">{data.completed}/{data.total}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Motivational Message */}
      <div className="motivation-card">
        <Sparkles size={24} />
        <p className="motivation-message">
          {progressPercentage < 25 && "¡Excelente inicio! Cada tarea completada es un paso hacia tus metas 🌟"}
          {progressPercentage >= 25 && progressPercentage < 50 && "¡Vas por buen camino! Tu constancia está dando frutos 💪"}
          {progressPercentage >= 50 && progressPercentage < 75 && "¡Impresionante! Ya completaste más de la mitad 🎯"}
          {progressPercentage >= 75 && progressPercentage < 100 && "¡Casi lo logras! El último empujón hacia el éxito 🏁"}
          {progressPercentage === 100 && "¡Felicidades! Has completado todos tus objetivos 🎉"}
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
    
    // Default goals if none saved
    if (savedGoals.length === 0) {
      const defaultGoals = [
        {
          id: 'visa-canada',
          name: 'Visa Canadá',
          category: GOAL_CATEGORIES.VISA,
          active: true,
          tasks: getTasksByDay(calculatedDay)
        },
        {
          id: 'work-productivity',
          name: 'Productividad Laboral',
          category: GOAL_CATEGORIES.WORK,
          active: true,
          tasks: WORK_TASKS
        },
        {
          id: 'daily-wellness',
          name: 'Bienestar Diario',
          category: GOAL_CATEGORIES.HEALTH,
          active: true,
          tasks: PERSONAL_TASKS.filter(t => t.category === GOAL_CATEGORIES.HEALTH)
        }
      ];
      
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
    analyticsService.trackAction(currentUser?.uid, 'dashboard_view', { 
      dayNumber: calculatedDay,
      activeGoals: savedGoals.length || 3
    });
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
      
      // Convert to card format
      const formattedCards = distributedTasks.map(item => {
        if (item.type === 'tip') {
          return {
            type: CARD_TYPES.TIP,
            ...item
          };
        }
        
        const categoryConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG[GOAL_CATEGORIES.PERSONAL];
        
        return {
          type: CARD_TYPES.TASK,
          ...item,
          color: item.color || categoryConfig.gradient,
          completed: completedTasks.includes(item.id)
        };
      });
      
      setCards(formattedCards);
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
        category: task.category,
        dayNumber,
        completedAt: new Date().toISOString()
      });
    }

    // Calculate progress for tracking
    const allTasks = getAllTasks(activeGoals);
    const progress = Math.round((newCompleted.length / allTasks.length) * 100);

    // Track action
    analyticsService.trackAction(currentUser?.uid, 'task_completed', { 
      taskId, 
      category: task?.category,
      timeContext: getCurrentTimeContext(),
      progress 
    });
  };

  // Handle goals update
  const handleGoalsUpdate = (updatedGoals) => {
    setActiveGoals(updatedGoals);
    localStorage.setItem('visa-quest-active-goals', JSON.stringify(updatedGoals));
    
    // Track goal changes
    analyticsService.trackAction(currentUser?.uid, 'goals_updated', { 
      totalGoals: updatedGoals.length,
      activeGoals: updatedGoals.filter(g => g.active).length
    });
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
                <p>Preparando tus tareas contextuales...</p>
              </div>
            )}
          </div>
        ) : activeTab === 'progress' ? (
          <ProgressView 
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