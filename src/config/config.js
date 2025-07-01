// Configuration file for VisaQuest
// This file contains all the configurable settings for the application

// Goal categories with their display properties
export const GOAL_CATEGORIES = {
  VISA: {
    id: 'visa',
    name: 'Visa',
    icon: '🛂',
    color: 'from-purple-500 to-purple-700',
    description: 'Tareas relacionadas con el proceso de visa'
  },
  WORK: {
    id: 'work',
    name: 'Trabajo',
    icon: '💼',
    color: 'from-blue-500 to-blue-700',
    description: 'Actividades laborales y profesionales'
  },
  PERSONAL: {
    id: 'personal',
    name: 'Personal',
    icon: '🌟',
    color: 'from-indigo-500 to-purple-600',
    description: 'Desarrollo personal y bienestar'
  },
  HEALTH: {
    id: 'health',
    name: 'Salud',
    icon: '💪',
    color: 'from-green-500 to-green-700',
    description: 'Ejercicio, meditación y bienestar físico'
  },
  LEARNING: {
    id: 'learning',
    name: 'Aprendizaje',
    icon: '📚',
    color: 'from-yellow-500 to-yellow-700',
    description: 'Cursos, lecturas y desarrollo de habilidades'
  },
  FINANCE: {
    id: 'finance',
    name: 'Finanzas',
    icon: '💰',
    color: 'from-emerald-500 to-emerald-700',
    description: 'Gestión financiera y ahorro'
  }
};

// Time contexts for smart task distribution
export const TIME_CONTEXTS = {
  EARLY_MORNING: { 
    start: 5, 
    end: 8, 
    name: 'Madrugada productiva',
    greeting: [
      "🌅 Madrugador/a! Aprovechemos esta energía",
      "⭐ Las mejores ideas llegan temprano",
      "🌟 Tu dedicación es admirable"
    ]
  },
  MORNING: { 
    start: 8, 
    end: 12, 
    name: 'Mañana',
    greeting: [
      "☀️ Buenos días! Empecemos con todo",
      "💪 Mañana poderosa en camino",
      "🚀 A conquistar el día"
    ]
  },
  LUNCH: { 
    start: 12, 
    end: 14, 
    name: 'Mediodía',
    greeting: [
      "🍽️ Hora de recargar energías",
      "☕ Pausa activa para seguir brillando",
      "🌞 Mitad del día, ¡vas genial!"
    ]
  },
  AFTERNOON: { 
    start: 14, 
    end: 18, 
    name: 'Tarde',
    greeting: [
      "⚡ Tarde productiva en marcha",
      "💼 Sprint final del día laboral",
      "🎯 Enfoque total en la tarde"
    ]
  },
  EVENING: { 
    start: 18, 
    end: 21, 
    name: 'Noche',
    greeting: [
      "🌆 Tiempo para ti y tus proyectos",
      "✨ Hora de los sueños personales",
      "🎨 Momento creativo del día"
    ]
  },
  NIGHT: { 
    start: 21, 
    end: 24, 
    name: 'Antes de dormir',
    greeting: [
      "🌙 Cerremos el día con broche de oro",
      "🛁 Tiempo de relajación productiva",
      "📚 Noche perfecta para planear mañana"
    ]
  },
  LATE_NIGHT: { 
    start: 0, 
    end: 5, 
    name: 'Madrugada',
    greeting: [
      "🌌 Noctámbulo/a productivo/a",
      "🦉 Las mejores ideas no duermen",
      "💫 Inspiración nocturna"
    ]
  }
};

// Task priority levels
export const PRIORITY_LEVELS = {
  URGENT: {
    id: 'urgent',
    name: 'Urgente',
    color: 'text-red-600',
    order: 0
  },
  HIGH: {
    id: 'high',
    name: 'Alta',
    color: 'text-orange-600',
    order: 1
  },
  MEDIUM: {
    id: 'medium',
    name: 'Media',
    color: 'text-yellow-600',
    order: 2
  },
  LOW: {
    id: 'low',
    name: 'Baja',
    color: 'text-green-600',
    order: 3
  }
};

// Work hours configuration
export const WORK_HOURS = {
  start: 9,
  end: 18,
  workDays: [1, 2, 3, 4, 5], // Monday to Friday
  flexFriday: true
};

// Category schedule preferences
// Define when each category of tasks should preferably appear
export const CATEGORY_SCHEDULES = {
  [GOAL_CATEGORIES.WORK.id]: {
    preferredTimes: ['MORNING', 'AFTERNOON'],
    restrictToWorkHours: true,
    dailyLimit: 8
  },
  [GOAL_CATEGORIES.HEALTH.id]: {
    preferredTimes: ['EARLY_MORNING', 'MORNING', 'EVENING'],
    restrictToWorkHours: false,
    dailyLimit: 4
  },
  [GOAL_CATEGORIES.LEARNING.id]: {
    preferredTimes: ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'],
    restrictToWorkHours: false,
    dailyLimit: 3
  },
  [GOAL_CATEGORIES.PERSONAL.id]: {
    preferredTimes: ['EVENING', 'NIGHT'],
    restrictToWorkHours: false,
    dailyLimit: 5
  },
  [GOAL_CATEGORIES.FINANCE.id]: {
    preferredTimes: ['EVENING', 'NIGHT'],
    restrictToWorkHours: false,
    dailyLimit: 2
  },
  [GOAL_CATEGORIES.VISA.id]: {
    preferredTimes: ['AFTERNOON', 'EVENING'],
    restrictToWorkHours: false,
    dailyLimit: 3
  }
};

// Contextual tips configuration
export const CONTEXTUAL_TIPS = {
  [GOAL_CATEGORIES.WORK.id]: {
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
      content: "No olvides completar tu BBVA Time Report antes de cerrar el día. Solo toma 10 minutos."
    }
  },
  [GOAL_CATEGORIES.PERSONAL.id]: {
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
  [GOAL_CATEGORIES.HEALTH.id]: {
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
  },
  [GOAL_CATEGORIES.LEARNING.id]: {
    MORNING: {
      title: "🧠 Mente fresca",
      content: "La mañana es ideal para aprender conceptos nuevos. Tu cerebro absorbe mejor la información."
    },
    AFTERNOON: {
      title: "📝 Práctica creativa",
      content: "Después del almuerzo es buen momento para ejercicios creativos y experimentación."
    },
    EVENING: {
      title: "🌟 Reflexión narrativa",
      content: "La noche invita a la introspección. Perfecto para escribir desde las emociones."
    }
  },
  [GOAL_CATEGORIES.FINANCE.id]: {
    EVENING: {
      title: "💸 Revisión financiera",
      content: "La noche es ideal para revisar gastos y planificar tu presupuesto con calma."
    }
  },
  [GOAL_CATEGORIES.VISA.id]: {
    AFTERNOON: {
      title: "📋 Progreso de visa",
      content: "Dedica tiempo sin interrupciones para avanzar en tu documentación."
    }
  }
};

// Special task configurations
export const SPECIAL_TASKS = {
  timeReport: {
    url: 'https://bbva-timereport.appspot.com/',
    reminderTime: 'EVENING',
    priority: 'URGENT'
  },
  weeklyReview: {
    dayOfWeek: 5, // Friday
    preferredTime: 'AFTERNOON'
  }
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
    [GOAL_CATEGORIES.WORK.id]: {
      enabled: true,
      maxDailyTasks: 8
    },
    [GOAL_CATEGORIES.PERSONAL.id]: {
      enabled: true,
      maxDailyTasks: 5
    },
    [GOAL_CATEGORIES.HEALTH.id]: {
      enabled: true,
      maxDailyTasks: 4
    },
    [GOAL_CATEGORIES.LEARNING.id]: {
      enabled: true,
      maxDailyTasks: 2
    },
    [GOAL_CATEGORIES.FINANCE.id]: {
      enabled: true,
      maxDailyTasks: 2
    },
    [GOAL_CATEGORIES.VISA.id]: {
      enabled: true,
      maxDailyTasks: 3
    }
  },
  notifications: {
    enabled: true,
    timeReport: true,
    taskReminders: true,
    achievements: true
  }
};

// Gamification settings
export const GAMIFICATION = {
  levels: {
    1: { name: 'Principiante', minXP: 0, icon: '🌱' },
    2: { name: 'Aprendiz', minXP: 100, icon: '🌿' },
    3: { name: 'Practicante', minXP: 250, icon: '🌳' },
    4: { name: 'Competente', minXP: 500, icon: '⭐' },
    5: { name: 'Experto', minXP: 1000, icon: '🌟' },
    6: { name: 'Maestro', minXP: 2000, icon: '✨' },
    7: { name: 'Gran Maestro', minXP: 5000, icon: '🏆' },
    8: { name: 'Leyenda', minXP: 10000, icon: '👑' }
  },
  xpRewards: {
    taskComplete: 10,
    dailyStreak: 20,
    weeklyGoal: 50,
    achievementUnlock: 100
  },
  streakBonuses: {
    3: 1.1,   // 10% bonus
    7: 1.2,   // 20% bonus
    14: 1.3,  // 30% bonus
    30: 1.5,  // 50% bonus
    100: 2.0  // 100% bonus
  }
};

// Achievement definitions
export const ACHIEVEMENTS = {
  earlyBird: {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completa 5 tareas antes de las 8 AM',
    icon: '🌅',
    xp: 100
  },
  nightOwl: {
    id: 'night_owl',
    name: 'Noctámbulo Productivo',
    description: 'Completa 10 tareas después de las 9 PM',
    icon: '🦉',
    xp: 100
  },
  consistent: {
    id: 'consistent',
    name: 'Constancia es Clave',
    description: 'Mantén una racha de 7 días',
    icon: '🔥',
    xp: 200
  },
  timeReportChampion: {
    id: 'time_report_champion',
    name: 'Campeón del Time Report',
    description: 'No olvides tu time report por 30 días seguidos',
    icon: '📊',
    xp: 500
  }
};

// Export utility functions
export const getCategoryById = (id) => {
  return Object.values(GOAL_CATEGORIES).find(cat => cat.id === id);
};

export const getPriorityById = (id) => {
  return Object.values(PRIORITY_LEVELS).find(priority => priority.id === id);
};

export const getTimeContextByHour = (hour) => {
  for (const [key, context] of Object.entries(TIME_CONTEXTS)) {
    if (context.start <= context.end) {
      if (hour >= context.start && hour < context.end) {
        return { key, ...context };
      }
    } else {
      // Handle cases that span midnight
      if (hour >= context.start || hour < context.end) {
        return { key, ...context };
      }
    }
  }
  return { key: 'MORNING', ...TIME_CONTEXTS.MORNING };
};
