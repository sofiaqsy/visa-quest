// Task categories
export const TASK_CATEGORIES = {
  VISA: 'visa',
  WORK: 'work',
  PERSONAL: 'personal',
  HEALTH: 'health',
  LEARNING: 'learning',
  FINANCE: 'finance'
};

// Time preferences for tasks
export const TIME_PREFERENCES = {
  MORNING: 'morning',
  WORK_HOURS: 'work_hours',
  LUNCH_BREAK: 'lunch_break',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
  WEEKEND: 'weekend',
  FLEXIBLE: 'flexible'
};

// Get current time context
export const getCurrentTimeContext = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  
  if (isWeekend) return TIME_PREFERENCES.WEEKEND;
  
  if (hour >= 6 && hour < 9) return TIME_PREFERENCES.MORNING;
  if (hour >= 9 && hour < 12) return TIME_PREFERENCES.WORK_HOURS;
  if (hour >= 12 && hour < 13) return TIME_PREFERENCES.LUNCH_BREAK;
  if (hour >= 13 && hour < 18) return TIME_PREFERENCES.AFTERNOON;
  if (hour >= 18 && hour < 21) return TIME_PREFERENCES.EVENING;
  if (hour >= 21 || hour < 6) return TIME_PREFERENCES.NIGHT;
  
  return TIME_PREFERENCES.FLEXIBLE;
};

// Get contextual greeting
export const getContextualGreeting = () => {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  
  if (isWeekend) {
    return "🌟 Fin de semana productivo";
  }
  
  if (hour < 12) return "☀️ Buenos días! Empecemos con energía";
  if (hour < 14) return "🌤️ Buenas tardes! Aprovecha el impulso";
  if (hour < 18) return "💪 Tarde enfocada, sigue así";
  if (hour < 21) return "🌙 Tiempo para ti, ¿qué tal ese proyecto personal?";
  return "✨ Noche tranquila, descansa bien";
};

// Work tasks pool
const workTasks = [
  {
    id: 'work_daily_1',
    category: TASK_CATEGORIES.WORK,
    icon: '📊',
    title: "Revisar métricas del día",
    description: "Analiza el dashboard y KPIs principales",
    time: "15 min",
    color: 'from-blue-400 to-blue-600',
    timePreference: TIME_PREFERENCES.MORNING,
    priority: 'high',
    tips: ['Enfócate en variaciones significativas', 'Compara con objetivos del mes']
  },
  {
    id: 'work_daily_2',
    category: TASK_CATEGORIES.WORK,
    icon: '📧',
    title: "Inbox Zero",
    description: "Procesa y organiza tu bandeja de entrada",
    time: "20 min",
    color: 'from-indigo-400 to-indigo-600',
    timePreference: TIME_PREFERENCES.WORK_HOURS,
    priority: 'medium',
    tips: ['Usa la regla de 2 minutos', 'Archiva o delega lo que puedas']
  },
  {
    id: 'work_daily_3',
    category: TASK_CATEGORIES.WORK,
    icon: '🎯',
    title: "Definir 3 prioridades del día",
    description: "Identifica las tareas más importantes",
    time: "10 min",
    color: 'from-purple-400 to-purple-600',
    timePreference: TIME_PREFERENCES.MORNING,
    priority: 'high',
    tips: ['Usa el método MIT', 'Alinea con objetivos semanales']
  },
  {
    id: 'work_project_1',
    category: TASK_CATEGORIES.WORK,
    icon: '🚀',
    title: "Avanzar proyecto Q1",
    description: "Dedica tiempo de enfoque profundo a tu proyecto principal",
    time: "45 min",
    color: 'from-cyan-400 to-cyan-600',
    timePreference: TIME_PREFERENCES.WORK_HOURS,
    priority: 'high',
    tips: ['Elimina distracciones', 'Usa técnica Pomodoro']
  },
  {
    id: 'work_meeting_prep',
    category: TASK_CATEGORIES.WORK,
    icon: '📋',
    title: "Preparar reunión de equipo",
    description: "Revisa agenda y prepara puntos clave",
    time: "15 min",
    color: 'from-green-400 to-green-600',
    timePreference: TIME_PREFERENCES.AFTERNOON,
    priority: 'medium',
    tips: ['Define outcomes esperados', 'Prepara preguntas clave']
  }
];

// Personal development tasks
const personalTasks = [
  {
    id: 'personal_journal',
    category: TASK_CATEGORIES.PERSONAL,
    icon: '📔',
    title: "Journaling matutino",
    description: "Escribe 3 páginas de pensamientos libres",
    time: "15 min",
    color: 'from-pink-400 to-pink-600',
    timePreference: TIME_PREFERENCES.MORNING,
    priority: 'medium',
    tips: ['No edites mientras escribes', 'Sé honesta contigo misma']
  },
  {
    id: 'personal_gratitude',
    category: TASK_CATEGORIES.PERSONAL,
    icon: '🙏',
    title: "Lista de gratitud",
    description: "Escribe 3 cosas por las que estás agradecida",
    time: "5 min",
    color: 'from-yellow-400 to-yellow-600',
    timePreference: TIME_PREFERENCES.EVENING,
    priority: 'low',
    tips: ['Sé específica', 'Incluye cosas pequeñas']
  },
  {
    id: 'personal_reading',
    category: TASK_CATEGORIES.PERSONAL,
    icon: '📚',
    title: "Lectura personal",
    description: "Avanza en tu libro actual",
    time: "20 min",
    color: 'from-purple-400 to-pink-600',
    timePreference: TIME_PREFERENCES.EVENING,
    priority: 'medium',
    tips: ['Sin distracciones', 'Toma notas si es útil']
  }
];

// Health & wellness tasks
const healthTasks = [
  {
    id: 'health_water',
    category: TASK_CATEGORIES.HEALTH,
    icon: '💧',
    title: "Hidratación",
    description: "Toma tu próximo vaso de agua",
    time: "1 min",
    color: 'from-blue-300 to-blue-500',
    timePreference: TIME_PREFERENCES.FLEXIBLE,
    priority: 'low',
    recurring: true,
    tips: ['Objetivo: 8 vasos al día', 'Agrega limón para variar']
  },
  {
    id: 'health_stretch',
    category: TASK_CATEGORIES.HEALTH,
    icon: '🧘‍♀️',
    title: "Estiramiento de escritorio",
    description: "Relaja cuello, hombros y espalda",
    time: "5 min",
    color: 'from-green-300 to-green-500',
    timePreference: TIME_PREFERENCES.FLEXIBLE,
    priority: 'medium',
    tips: ['Respira profundamente', 'Mueve suavemente']
  },
  {
    id: 'health_meditation',
    category: TASK_CATEGORIES.HEALTH,
    icon: '🧘',
    title: "Meditación breve",
    description: "Centra tu mente y reduce el estrés",
    time: "10 min",
    color: 'from-purple-300 to-purple-500',
    timePreference: TIME_PREFERENCES.MORNING,
    priority: 'medium',
    tips: ['Encuentra un lugar tranquilo', 'Usa app si ayuda']
  },
  {
    id: 'health_walk',
    category: TASK_CATEGORIES.HEALTH,
    icon: '🚶‍♀️',
    title: "Caminata activa",
    description: "Sal a caminar y despeja tu mente",
    time: "15 min",
    color: 'from-orange-300 to-orange-500',
    timePreference: TIME_PREFERENCES.LUNCH_BREAK,
    priority: 'medium',
    tips: ['Sin teléfono si es posible', 'Observa tu entorno']
  }
];

// Learning tasks
const learningTasks = [
  {
    id: 'learning_course',
    category: TASK_CATEGORIES.LEARNING,
    icon: '🎓',
    title: "Avanzar en curso online",
    description: "Completa una lección o módulo",
    time: "30 min",
    color: 'from-indigo-400 to-purple-600',
    timePreference: TIME_PREFERENCES.EVENING,
    priority: 'medium',
    tips: ['Toma notas activamente', 'Practica lo aprendido']
  },
  {
    id: 'learning_article',
    category: TASK_CATEGORIES.LEARNING,
    icon: '📰',
    title: "Leer artículo profesional",
    description: "Lee un artículo de tu industria",
    time: "15 min",
    color: 'from-teal-400 to-teal-600',
    timePreference: TIME_PREFERENCES.LUNCH_BREAK,
    priority: 'low',
    tips: ['Guarda los mejores', 'Comparte insights']
  }
];

// Visa tasks (original ones, now categorized)
export const visaTasks = {
  1: [
    { 
      id: 'visa_1_1',
      category: TASK_CATEGORIES.VISA,
      icon: '📋',
      title: "Revisar requisitos de visa",
      description: "Lee la lista completa de documentos necesarios para tu visa de turista",
      time: "15 min",
      color: 'from-red-400 to-red-600',
      timePreference: TIME_PREFERENCES.FLEXIBLE,
      priority: 'high',
      tips: ['Guarda la lista en tu teléfono', 'Marca los documentos que ya tienes']
    },
    { 
      id: 'visa_1_2',
      category: TASK_CATEGORIES.VISA,
      icon: '🛂',
      title: "Verificar pasaporte",
      description: "Asegúrate que esté vigente por al menos 6 meses desde tu fecha de viaje",
      time: "5 min",
      color: 'from-red-400 to-pink-600',
      timePreference: TIME_PREFERENCES.FLEXIBLE,
      priority: 'high',
      tips: ['Revisa la fecha de vencimiento', 'Toma una foto clara de la página principal']
    },
    { 
      id: 'visa_1_3',
      category: TASK_CATEGORIES.VISA,
      icon: '📁',
      title: "Crear carpeta digital",
      description: "Organiza tus documentos en Google Drive o Dropbox",
      time: "10 min",
      color: 'from-pink-400 to-purple-600',
      timePreference: TIME_PREFERENCES.EVENING,
      priority: 'medium',
      tips: ['Crea subcarpetas por tipo de documento', 'Comparte el acceso con alguien de confianza']
    }
  ],
  2: [
    { 
      id: 'visa_2_1',
      category: TASK_CATEGORIES.VISA,
      icon: '📸',
      title: "Fotografías para visa",
      description: "Toma fotos con fondo blanco según las especificaciones canadienses",
      time: "20 min",
      color: 'from-red-400 to-orange-600',
      timePreference: TIME_PREFERENCES.WEEKEND,
      priority: 'high',
      tips: ['Fondo blanco sin sombras', 'Sin lentes ni accesorios', 'Expresión neutral']
    },
    { 
      id: 'visa_2_2',
      category: TASK_CATEGORIES.VISA,
      icon: '💰',
      title: "Estado de cuenta bancario",
      description: "Solicita los últimos 6 meses en tu banco",
      time: "30 min",
      color: 'from-yellow-400 to-orange-600',
      timePreference: TIME_PREFERENCES.LUNCH_BREAK,
      priority: 'high',
      tips: ['Puede ser digital o físico', 'Debe mostrar tu nombre completo', 'Saldo promedio importante']
    },
    { 
      id: 'visa_2_3',
      category: TASK_CATEGORIES.VISA,
      icon: '💼',
      title: "Carta de empleo",
      description: "Pide a RRHH una carta con tu salario, cargo y antigüedad",
      time: "15 min",
      color: 'from-orange-400 to-red-600',
      timePreference: TIME_PREFERENCES.WORK_HOURS,
      priority: 'high',
      tips: ['En papel membretado', 'Firmada y sellada', 'Mencione tu permiso de vacaciones']
    }
  ]
};

// Get tasks by time context
export const getTasksByTimeContext = (currentContext, userGoals, completedTasks = []) => {
  const allAvailableTasks = [];
  
  // Add work tasks if it's work time and user has work goals
  if (userGoals.includes(TASK_CATEGORIES.WORK)) {
    if ([TIME_PREFERENCES.WORK_HOURS, TIME_PREFERENCES.MORNING, TIME_PREFERENCES.AFTERNOON].includes(currentContext)) {
      allAvailableTasks.push(...workTasks.filter(t => !completedTasks.includes(t.id)));
    }
  }
  
  // Add personal tasks for evening/weekend
  if (userGoals.includes(TASK_CATEGORIES.PERSONAL)) {
    if ([TIME_PREFERENCES.EVENING, TIME_PREFERENCES.WEEKEND, TIME_PREFERENCES.MORNING].includes(currentContext)) {
      allAvailableTasks.push(...personalTasks.filter(t => !completedTasks.includes(t.id)));
    }
  }
  
  // Health tasks can appear anytime
  if (userGoals.includes(TASK_CATEGORIES.HEALTH)) {
    allAvailableTasks.push(...healthTasks.filter(t => !completedTasks.includes(t.id)));
  }
  
  // Learning tasks for breaks and evening
  if (userGoals.includes(TASK_CATEGORIES.LEARNING)) {
    if ([TIME_PREFERENCES.LUNCH_BREAK, TIME_PREFERENCES.EVENING, TIME_PREFERENCES.WEEKEND].includes(currentContext)) {
      allAvailableTasks.push(...learningTasks.filter(t => !completedTasks.includes(t.id)));
    }
  }
  
  // Visa tasks - flexible timing
  if (userGoals.includes(TASK_CATEGORIES.VISA)) {
    const dayNumber = Math.min(
      Math.ceil((Date.now() - new Date(localStorage.getItem('visa-quest-start-date')).getTime()) / (1000 * 60 * 60 * 24)) + 1,
      21
    );
    const dayTasks = visaTasks[dayNumber % 3 || 3] || visaTasks[1];
    allAvailableTasks.push(...dayTasks.filter(t => !completedTasks.includes(t.id)));
  }
  
  // Sort by priority and time preference match
  return allAvailableTasks.sort((a, b) => {
    // First by time preference match
    const aMatches = a.timePreference === currentContext || a.timePreference === TIME_PREFERENCES.FLEXIBLE;
    const bMatches = b.timePreference === currentContext || b.timePreference === TIME_PREFERENCES.FLEXIBLE;
    
    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
  });
};

// Get contextual tips
export const getContextualTips = (currentContext) => {
  const contextTips = {
    [TIME_PREFERENCES.MORNING]: {
      title: "💡 Tip matutino",
      content: "Las primeras horas son las más productivas. Aprovecha para tareas que requieren concentración profunda.",
      color: 'from-yellow-400 to-orange-600'
    },
    [TIME_PREFERENCES.WORK_HOURS]: {
      title: "🎯 Tip de productividad",
      content: "Usa bloques de tiempo de 25-50 minutos con descansos cortos. Tu cerebro te lo agradecerá.",
      color: 'from-blue-400 to-blue-600'
    },
    [TIME_PREFERENCES.LUNCH_BREAK]: {
      title: "🍽️ Tip de almuerzo",
      content: "Aprovecha para hacer llamadas rápidas o tareas administrativas simples mientras comes.",
      color: 'from-green-400 to-green-600'
    },
    [TIME_PREFERENCES.AFTERNOON]: {
      title: "☕ Tip de tarde",
      content: "Si sientes el bajón de energía, es momento perfecto para tareas menos demandantes o colaborativas.",
      color: 'from-purple-400 to-purple-600'
    },
    [TIME_PREFERENCES.EVENING]: {
      title: "🌙 Tip nocturno",
      content: "Dedica este tiempo a tu crecimiento personal. Es tu momento para proyectos propios.",
      color: 'from-indigo-400 to-purple-600'
    },
    [TIME_PREFERENCES.WEEKEND]: {
      title: "🌟 Tip de fin de semana",
      content: "Balance es clave. Mezcla tareas personales con descanso activo para recargar energías.",
      color: 'from-pink-400 to-pink-600'
    }
  };
  
  return contextTips[currentContext] || contextTips[TIME_PREFERENCES.FLEXIBLE];
};

// Default user goals (can be customized later)
export const DEFAULT_USER_GOALS = [
  TASK_CATEGORIES.VISA,
  TASK_CATEGORIES.WORK,
  TASK_CATEGORIES.PERSONAL,
  TASK_CATEGORIES.HEALTH
];
