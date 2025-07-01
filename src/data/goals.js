// Goal categories
export const GOAL_CATEGORIES = {
  VISA: 'visa',
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  LEARNING: 'learning',
  FINANCE: 'finance'
};

// Time contexts for smart task distribution
export const TIME_CONTEXTS = {
  EARLY_MORNING: { start: 5, end: 8, name: 'Madrugada productiva' },
  MORNING: { start: 8, end: 12, name: 'Mañana' },
  LUNCH: { start: 12, end: 14, name: 'Mediodía' },
  AFTERNOON: { start: 14, end: 18, name: 'Tarde' },
  EVENING: { start: 18, end: 21, name: 'Noche' },
  NIGHT: { start: 21, end: 24, name: 'Antes de dormir' },
  LATE_NIGHT: { start: 0, end: 5, name: 'Madrugada' }
};

// Task priority levels
export const PRIORITY_LEVELS = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Get current time context
export const getCurrentTimeContext = () => {
  const hour = new Date().getHours();
  
  for (const [key, context] of Object.entries(TIME_CONTEXTS)) {
    if (context.start <= context.end) {
      if (hour >= context.start && hour < context.end) {
        return key;
      }
    } else {
      // Handle cases that span midnight
      if (hour >= context.start || hour < context.end) {
        return key;
      }
    }
  }
  
  return 'MORNING'; // Default
};

// Check if it's weekend
export const isWeekend = () => {
  const day = new Date().getDay();
  return day === 0 || day === 6;
};

// Check if it's work hours
export const isWorkHours = () => {
  const hour = new Date().getHours();
  
  // Monday to Friday, 9 AM to 6 PM
  return !isWeekend() && hour >= 9 && hour < 18;
};

// Get contextual greeting based on time
export const getContextualGreeting = () => {
  const timeContext = getCurrentTimeContext();
  
  const greetings = {
    EARLY_MORNING: [
      "🌅 Madrugador/a! Aprovechemos esta energía",
      "⭐ Las mejores ideas llegan temprano",
      "🌟 Tu dedicación es admirable"
    ],
    MORNING: [
      "☀️ Buenos días! Empecemos con todo",
      "💪 Mañana poderosa en camino",
      "🚀 A conquistar el día"
    ],
    LUNCH: [
      "🍽️ Hora de recargar energías",
      "☕ Pausa activa para seguir brillando",
      "🌞 Mitad del día, ¡vas genial!"
    ],
    AFTERNOON: [
      "⚡ Tarde productiva en marcha",
      "💼 Sprint final del día laboral",
      "🎯 Enfoque total en la tarde"
    ],
    EVENING: [
      "🌆 Tiempo para ti y tus proyectos",
      "✨ Hora de los sueños personales",
      "🎨 Momento creativo del día"
    ],
    NIGHT: [
      "🌙 Cerremos el día con broche de oro",
      "🛁 Tiempo de relajación productiva",
      "📚 Noche perfecta para planear mañana"
    ],
    LATE_NIGHT: [
      "🌌 Noctámbulo/a productivo/a",
      "🦉 Las mejores ideas no duermen",
      "💫 Inspiración nocturna"
    ]
  };
  
  const contextGreetings = greetings[timeContext] || greetings.MORNING;
  return contextGreetings[Math.floor(Math.random() * contextGreetings.length)];
};

// Sample work tasks
export const WORK_TASKS = [
  {
    id: 'work_daily_standup',
    category: GOAL_CATEGORIES.WORK,
    icon: '👥',
    title: "Daily standup",
    description: "Sincronizar con el equipo sobre avances y bloqueos",
    time: "15 min",
    color: 'from-blue-500 to-blue-700',
    preferredTime: ['MORNING'],
    priority: PRIORITY_LEVELS.HIGH,
    recurring: true,
    tips: ['Prepara tus updates antes', 'Menciona bloqueos primero', 'Sé conciso']
  },
  {
    id: 'work_email_zero',
    category: GOAL_CATEGORIES.WORK,
    icon: '📧',
    title: "Inbox Zero",
    description: "Procesar y organizar todos los correos pendientes",
    time: "30 min",
    color: 'from-purple-500 to-purple-700',
    preferredTime: ['MORNING', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: ['Usa la regla 2 minutos', 'Archiva lo procesado', 'Delega cuando puedas']
  },
  {
    id: 'work_deep_focus',
    category: GOAL_CATEGORIES.WORK,
    icon: '🎯',
    title: "Bloque de enfoque profundo",
    description: "Trabajar sin interrupciones en la tarea más importante",
    time: "90 min",
    color: 'from-green-500 to-green-700',
    preferredTime: ['MORNING', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.URGENT,
    tips: ['Modo avión activado', 'Cierra todas las pestañas', 'Técnica Pomodoro']
  },
  {
    id: 'work_code_review',
    category: GOAL_CATEGORIES.WORK,
    icon: '👀',
    title: "Code review pendiente",
    description: "Revisar PR del equipo con feedback constructivo",
    time: "45 min",
    color: 'from-indigo-500 to-indigo-700',
    preferredTime: ['AFTERNOON'],
    priority: PRIORITY_LEVELS.HIGH,
    tips: ['Busca edge cases', 'Sugiere mejoras', 'Sé amable en comentarios']
  },
  {
    id: 'work_documentation',
    category: GOAL_CATEGORIES.WORK,
    icon: '📝',
    title: "Actualizar documentación",
    description: "Documentar cambios recientes del proyecto",
    time: "30 min",
    color: 'from-yellow-500 to-yellow-700',
    preferredTime: ['AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.LOW,
    tips: ['Usa ejemplos claros', 'Incluye diagramas', 'Piensa en el próximo dev']
  }
];

// Sample personal/health tasks
export const PERSONAL_TASKS = [
  {
    id: 'personal_meditation',
    category: GOAL_CATEGORIES.HEALTH,
    icon: '🧘‍♀️',
    title: "Meditación matutina",
    description: "5 minutos de mindfulness para empezar el día",
    time: "5 min",
    color: 'from-cyan-500 to-cyan-700',
    preferredTime: ['EARLY_MORNING', 'MORNING'],
    priority: PRIORITY_LEVELS.MEDIUM,
    recurring: true,
    tips: ['Encuentra un lugar tranquilo', 'Concéntrate en respirar', 'No juzgues pensamientos']
  },
  {
    id: 'personal_water',
    category: GOAL_CATEGORIES.HEALTH,
    icon: '💧',
    title: "Hidratación",
    description: "Tomar un vaso de agua - meta 8 al día",
    time: "1 min",
    color: 'from-blue-400 to-blue-600',
    preferredTime: ['MORNING', 'LUNCH', 'AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.LOW,
    recurring: true,
    microTask: true,
    tips: ['Agua a temperatura ambiente', 'Añade limón si quieres', 'Alejado de comidas']
  },
  {
    id: 'personal_exercise',
    category: GOAL_CATEGORIES.HEALTH,
    icon: '🏃‍♀️',
    title: "Sesión de ejercicio",
    description: "30 minutos de actividad física",
    time: "30 min",
    color: 'from-red-500 to-red-700',
    preferredTime: ['MORNING', 'EVENING'],
    priority: PRIORITY_LEVELS.HIGH,
    tips: ['Calienta primero', 'Escucha tu cuerpo', 'Hidrátate bien']
  },
  {
    id: 'personal_reading',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '📚',
    title: "Lectura diaria",
    description: "Avanzar en tu libro actual",
    time: "20 min",
    color: 'from-purple-500 to-pink-600',
    preferredTime: ['LUNCH', 'EVENING', 'NIGHT'],
    priority: PRIORITY_LEVELS.LOW,
    tips: ['Sin distracciones', 'Toma notas si quieres', 'Disfruta el momento']
  },
  {
    id: 'personal_planning',
    category: GOAL_CATEGORIES.PERSONAL,
    icon: '📅',
    title: "Planificar mañana",
    description: "Revisar y organizar tareas del día siguiente",
    time: "10 min",
    color: 'from-indigo-500 to-purple-600',
    preferredTime: ['EVENING', 'NIGHT'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: ['Prioriza 3 importantes', 'Sé realista', 'Incluye descansos']
  }
];

// Micro tasks for breaks
export const MICRO_TASKS = [
  {
    id: 'micro_stretch',
    category: GOAL_CATEGORIES.HEALTH,
    icon: '🤸‍♀️',
    title: "Estiramiento rápido",
    description: "Estira cuello, hombros y espalda",
    time: "2 min",
    color: 'from-green-400 to-green-600',
    microTask: true,
    tips: ['Levántate del escritorio', 'Respira profundo', 'Mueve el cuello suave']
  },
  {
    id: 'micro_eyes',
    category: GOAL_CATEGORIES.HEALTH,
    icon: '👀',
    title: "Descanso visual 20-20-20",
    description: "Mira algo a 20 pies por 20 segundos",
    time: "20 seg",
    color: 'from-blue-400 to-blue-600',
    microTask: true,
    tips: ['Mira por la ventana', 'Parpadea varias veces', 'Relaja la vista']
  },
  {
    id: 'micro_breathe',
    category: GOAL_CATEGORIES.HEALTH,
    icon: '🌬️',
    title: "Respiración profunda",
    description: "3 respiraciones profundas para resetear",
    time: "1 min",
    color: 'from-cyan-400 to-cyan-600',
    microTask: true,
    tips: ['Inhala por 4 segundos', 'Mantén por 4', 'Exhala por 6']
  },
  {
    id: 'micro_gratitude',
    category: GOAL_CATEGORIES.PERSONAL,
    icon: '🙏',
    title: "Momento de gratitud",
    description: "Piensa en 3 cosas por las que agradecer",
    time: "2 min",
    color: 'from-pink-400 to-pink-600',
    microTask: true,
    tips: ['Sé específico', 'Incluye algo pequeño', 'Siente la gratitud']
  }
];

// Function to get contextual tips based on category and time
export const getContextualTips = (category, timeContext) => {
  const tips = {
    [GOAL_CATEGORIES.WORK]: {
      MORNING: {
        title: "💼 Tip de productividad matutina",
        content: "Empieza con la tarea más importante mientras tu energía está al máximo. El resto del día será más fácil."
      },
      AFTERNOON: {
        title: "⚡ Combate la fatiga de la tarde",
        content: "Si sientes el bajón post-almuerzo, prueba una caminata de 5 minutos o un vaso de agua fría."
      },
      EVENING: {
        title: "📝 Cierre del día laboral",
        content: "Dedica 10 minutos a escribir los pendientes de mañana. Tu mente descansará mejor."
      }
    },
    [GOAL_CATEGORIES.PERSONAL]: {
      MORNING: {
        title: "🌅 Ritual matutino",
        content: "Establece una rutina matutina consistente. Tu cerebro agradecerá la predictibilidad."
      },
      EVENING: {
        title: "🌙 Tiempo de calidad",
        content: "Las noches son perfectas para proyectos personales. Sin interrupciones laborales."
      },
      NIGHT: {
        title: "😴 Preparación para dormir",
        content: "Evita pantallas 30 minutos antes de dormir. Tu sueño será más reparador."
      }
    },
    [GOAL_CATEGORIES.HEALTH]: {
      MORNING: {
        title: "💪 Energía matutina",
        content: "Ejercitarte en la mañana acelera tu metabolismo para todo el día."
      },
      AFTERNOON: {
        title: "🥗 Snack saludable",
        content: "Si tienes hambre, opta por frutos secos o fruta. Evita el azúcar procesada."
      },
      EVENING: {
        title: "🧘‍♀️ Relájate activamente",
        content: "El yoga suave o estiramientos nocturnos mejoran la calidad del sueño."
      }
    }
  };

  const categoryTips = tips[category] || tips[GOAL_CATEGORIES.PERSONAL];
  const contextTip = categoryTips[timeContext] || categoryTips.MORNING || {
    title: "💡 Tip del momento",
    content: "Cada pequeño paso cuenta. Sigue adelante con determinación."
  };
  
  return {
    id: `tip_${category}_${timeContext}_${Date.now()}`,
    ...contextTip,
    color: 'from-gradient-to-gradient'
  };
};

// Smart task distribution algorithm - SIMPLIFIED VERSION
export const getSmartTaskDistribution = (allGoals, completedTasks, userPreferences = {}) => {
  const timeContext = getCurrentTimeContext();
  const isWorkTime = isWorkHours();
  
  let eligibleTasks = [];
  
  // Collect all tasks from all active goals
  allGoals.forEach(goal => {
    if (goal.active && goal.tasks && goal.tasks.length > 0) {
      eligibleTasks.push(...goal.tasks);
    }
  });
  
  // If no tasks from goals, use default tasks
  if (eligibleTasks.length === 0) {
    console.log('No tasks from goals, using defaults');
    // Add some default tasks based on time
    if (isWorkTime) {
      eligibleTasks.push(...WORK_TASKS.slice(0, 3));
    }
    eligibleTasks.push(...PERSONAL_TASKS.slice(0, 3));
    eligibleTasks.push(...MICRO_TASKS.slice(0, 2));
  }
  
  // Filter out completed tasks
  eligibleTasks = eligibleTasks.filter(task => !completedTasks.includes(task.id));
  
  // If all tasks are completed, show congratulations
  if (eligibleTasks.length === 0) {
    return [{
      type: 'tip',
      id: 'all_done_tip',
      title: "🎉 ¡Felicidades!",
      content: "Has completado todas tus tareas por hoy. Descansa y disfruta tu tiempo libre.",
      color: 'from-green-400 to-green-600'
    }];
  }
  
  // Apply time context filtering (but keep at least some tasks)
  let timeFilteredTasks = eligibleTasks.filter(task => {
    // If task has preferred times, check if current time matches
    if (task.preferredTime && task.preferredTime.length > 0) {
      return task.preferredTime.includes(timeContext);
    }
    
    // Otherwise, apply smart defaults
    if (isWorkTime && task.category === GOAL_CATEGORIES.WORK) {
      return true;
    }
    
    if (!isWorkTime && task.category !== GOAL_CATEGORIES.WORK) {
      return true;
    }
    
    // Allow personal micro-tasks anytime
    if (task.microTask) {
      return true;
    }
    
    return false;
  });
  
  // If filtering removed all tasks, use unfiltered list
  if (timeFilteredTasks.length === 0) {
    timeFilteredTasks = eligibleTasks;
  }
  
  // Sort by priority
  timeFilteredTasks.sort((a, b) => {
    const priorityOrder = {
      [PRIORITY_LEVELS.URGENT]: 0,
      [PRIORITY_LEVELS.HIGH]: 1,
      [PRIORITY_LEVELS.MEDIUM]: 2,
      [PRIORITY_LEVELS.LOW]: 3,
      undefined: 4
    };
    
    return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
  });
  
  // Take a reasonable number of tasks
  const finalTasks = timeFilteredTasks.slice(0, 8);
  
  // Add some tips
  const result = [];
  const categories = [...new Set(finalTasks.map(t => t.category))];
  const tips = categories.map(cat => ({
    type: 'tip',
    ...getContextualTips(cat, timeContext)
  }));
  
  // Interleave tasks and tips
  finalTasks.forEach((task, index) => {
    result.push(task);
    // Add a tip every 3 tasks
    if ((index + 1) % 3 === 0 && tips.length > 0) {
      result.push(tips.shift());
    }
  });
  
  // Add remaining tips at the end
  result.push(...tips);
  
  console.log('Generated task distribution:', result);
  return result;
};

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  workHours: {
    start: 9,
    end: 18,
    flexFriday: true
  },
  breakTimes: [
    { start: 12, end: 13 }, // Lunch
    { start: 15.5, end: 15.75 } // Afternoon break
  ],
  focusBlocks: [
    { start: 9, end: 11 },
    { start: 14, end: 16 }
  ],
  categories: {
    [GOAL_CATEGORIES.WORK]: {
      enabled: true,
      maxDailyTasks: 8
    },
    [GOAL_CATEGORIES.PERSONAL]: {
      enabled: true,
      maxDailyTasks: 5
    },
    [GOAL_CATEGORIES.HEALTH]: {
      enabled: true,
      maxDailyTasks: 4
    },
    [GOAL_CATEGORIES.LEARNING]: {
      enabled: true,
      maxDailyTasks: 2
    }
  }
};
