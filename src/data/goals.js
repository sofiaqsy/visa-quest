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
    id: 'work_bbva_time_report',
    category: GOAL_CATEGORIES.WORK,
    icon: '⏰',
    title: "BBVA Time Report",
    description: "Registrar actividades del día en bbva-timereport.appspot.com",
    time: "10 min",
    color: 'from-blue-500 to-blue-700',
    preferredTime: ['AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.URGENT,
    recurring: true,
    tips: [
      'Abre https://bbva-timereport.appspot.com/',
      'Registra en qué features trabajaste hoy',
      'Asigna el tiempo real a cada actividad',
      'Guarda antes de cerrar la página'
    ]
  },
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
  },
  {
    id: 'work_weekly_time_summary',
    category: GOAL_CATEGORIES.WORK,
    icon: '📈',
    title: "Resumen semanal de time report",
    description: "Revisar y validar las horas registradas de la semana",
    time: "15 min",
    color: 'from-indigo-500 to-indigo-700',
    preferredTime: ['AFTERNOON'],
    priority: PRIORITY_LEVELS.HIGH,
    weeklyTask: true,
    dayOfWeek: 5, // Friday
    tips: [
      'Verifica que todos los días tengan registro',
      'Confirma que las horas sumen correctamente',
      'Identifica patrones de productividad',
      'Prepara resumen para el manager si es necesario'
    ]
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
  },
  // History Telling Course Tasks
  {
    id: 'storytelling_morning_pages',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '✍️',
    title: "Morning Pages - Escritura libre",
    description: "3 páginas de escritura libre para desbloquear creatividad narrativa",
    time: "30 min",
    color: 'from-amber-500 to-amber-700',
    preferredTime: ['EARLY_MORNING', 'MORNING'],
    priority: PRIORITY_LEVELS.HIGH,
    recurring: true,
    tips: [
      'No te detengas a editar', 
      'Escribe sin parar por 30 min', 
      'No hay tema incorrecto',
      'Es para liberar, no para mostrar'
    ]
  },
  {
    id: 'storytelling_story_structure',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🏗️',
    title: "Análisis de estructura narrativa",
    description: "Estudiar la estructura de una historia exitosa (película, libro, podcast)",
    time: "45 min",
    color: 'from-indigo-500 to-indigo-700',
    preferredTime: ['AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'Identifica los 3 actos principales',
      'Marca el punto de giro',
      'Analiza el arco del protagonista',
      'Toma notas de técnicas efectivas'
    ]
  },
  {
    id: 'storytelling_character_development',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '👥',
    title: "Desarrollo de personajes",
    description: "Crear o profundizar en un personaje con backstory completo",
    time: "25 min",
    color: 'from-purple-500 to-purple-700',
    preferredTime: ['MORNING', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'Define motivaciones profundas',
      'Crea contradicciones realistas',
      'Desarrolla su voz única',
      'Incluye detalles memorables'
    ]
  },
  {
    id: 'storytelling_voice_practice',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🎙️',
    title: "Práctica de narración oral",
    description: "Contar una historia en voz alta (grabar opcional)",
    time: "15 min",
    color: 'from-red-500 to-red-700',
    preferredTime: ['EVENING', 'NIGHT'],
    priority: PRIORITY_LEVELS.MEDIUM,
    recurring: true,
    tips: [
      'Modula tu voz según la emoción',
      'Practica pausas dramáticas',
      'Usa gestos aunque nadie te vea',
      'Grábate para autoevaluarte'
    ]
  },
  {
    id: 'storytelling_micro_story',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '⚡',
    title: "Micro-relato del día",
    description: "Escribir una historia completa en 100 palabras o menos",
    time: "10 min",
    color: 'from-yellow-500 to-yellow-700',
    preferredTime: ['LUNCH', 'AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.LOW,
    microTask: true,
    tips: [
      'Cada palabra debe contar',
      'Empieza in media res',
      'Implica más de lo que dices',
      'Busca el giro inesperado'
    ]
  },
  {
    id: 'storytelling_sensory_details',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '👁️',
    title: "Ejercicio sensorial",
    description: "Describir una escena usando los 5 sentidos",
    time: "20 min",
    color: 'from-teal-500 to-teal-700',
    preferredTime: ['MORNING', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'No solo lo visual importa',
      'Los olores evocan memorias',
      'Incluye texturas y temperaturas',
      'Sonidos ambientales dan vida'
    ]
  },
  {
    id: 'storytelling_dialogue_workshop',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '💬',
    title: "Taller de diálogos",
    description: "Escribir una conversación que revele carácter sin decirlo",
    time: "25 min",
    color: 'from-green-500 to-green-700',
    preferredTime: ['AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'Subtexto es clave',
      'Cada personaje habla diferente',
      'Conflicto en cada intercambio',
      'Menos tags, más acción'
    ]
  },
  {
    id: 'storytelling_story_journal',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '📔',
    title: "Diario de historias cotidianas",
    description: "Capturar una anécdota del día con potencial narrativo",
    time: "15 min",
    color: 'from-pink-500 to-pink-700',
    preferredTime: ['EVENING', 'NIGHT'],
    priority: PRIORITY_LEVELS.LOW,
    recurring: true,
    tips: [
      'Busca lo extraordinario en lo ordinario',
      'Anota diálogos reales interesantes',
      'Captura gestos y expresiones',
      'Material futuro para historias'
    ]
  },
  {
    id: 'storytelling_plot_twist',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🔄',
    title: "Ejercicio de giro argumental",
    description: "Tomar una historia conocida y darle un giro inesperado",
    time: "30 min",
    color: 'from-orange-500 to-orange-700',
    preferredTime: ['AFTERNOON', 'EVENING'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'Subvierte expectativas lógicamente',
      'El giro debe estar sembrado',
      'Cambia perspectiva del narrador',
      'Explora "¿qué pasaría si...?"'
    ]
  },
  {
    id: 'storytelling_emotion_mapping',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '❤️',
    title: "Mapa emocional de escena",
    description: "Planificar el viaje emocional del lector en una escena",
    time: "20 min",
    color: 'from-rose-500 to-rose-700',
    preferredTime: ['MORNING', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'Define emoción inicial y final',
      'Marca puntos de cambio',
      'Usa ritmo para intensificar',
      'Contraste crea impacto'
    ]
  },
  {
    id: 'storytelling_hook_practice',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🎣',
    title: "Práctica de ganchos narrativos",
    description: "Escribir 5 primeras líneas irresistibles",
    time: "15 min",
    color: 'from-cyan-500 to-cyan-700',
    preferredTime: ['MORNING', 'LUNCH'],
    priority: PRIORITY_LEVELS.LOW,
    microTask: true,
    tips: [
      'Empieza con acción o misterio',
      'Voz única desde la primera palabra',
      'Promete conflicto inmediato',
      'Sorprende sin confundir'
    ]
  },
  {
    id: 'storytelling_world_building',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🌍',
    title: "Construcción de mundo",
    description: "Desarrollar reglas y detalles de tu universo narrativo",
    time: "40 min",
    color: 'from-emerald-500 to-emerald-700',
    preferredTime: ['EVENING', 'NIGHT'],
    priority: PRIORITY_LEVELS.MEDIUM,
    tips: [
      'Consistencia es credibilidad',
      'Menos exposición, más inmersión',
      'Las reglas crean tensión',
      'Detalles pequeños dan vida'
    ]
  },
  {
    id: 'storytelling_feedback_session',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🤝',
    title: "Sesión de feedback",
    description: "Compartir tu historia y recibir retroalimentación constructiva",
    time: "45 min",
    color: 'from-blue-500 to-blue-700',
    preferredTime: ['EVENING'],
    priority: PRIORITY_LEVELS.HIGH,
    tips: [
      'Escucha sin defender',
      'Haz preguntas específicas',
      'Agradece toda crítica',
      'Toma notas para mejorar'
    ]
  },
  {
    id: 'storytelling_revision_deep',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '✏️',
    title: "Revisión profunda",
    description: "Editar y pulir una historia existente",
    time: "60 min",
    color: 'from-gray-500 to-gray-700',
    preferredTime: ['MORNING', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.HIGH,
    tips: [
      'Primera pasada: estructura',
      'Segunda pasada: personajes',
      'Tercera pasada: prosa',
      'Lee en voz alta al final'
    ]
  },
  {
    id: 'storytelling_inspiration_hunt',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🔍',
    title: "Cacería de inspiración",
    description: "Salir a observar y recolectar material para historias",
    time: "30 min",
    color: 'from-violet-500 to-violet-700',
    preferredTime: ['LUNCH', 'AFTERNOON'],
    priority: PRIORITY_LEVELS.LOW,
    tips: [
      'Observa sin juzgar',
      'Escucha conversaciones ajenas',
      'Fotografía detalles curiosos',
      'Pregúntate "¿y si...?"'
    ]
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
  },
  // Storytelling Micro Tasks
  {
    id: 'micro_story_prompt',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '💭',
    title: "Prompt creativo rápido",
    description: "Genera 3 ideas de historia a partir de una palabra aleatoria",
    time: "5 min",
    color: 'from-purple-400 to-purple-600',
    microTask: true,
    tips: ['No filtres ideas', 'Busca conexiones inusuales', 'Piensa en géneros diversos']
  },
  {
    id: 'micro_verb_upgrade',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '🎯',
    title: "Mejora de verbos",
    description: "Reemplaza 10 verbos débiles por verbos más específicos",
    time: "5 min",
    color: 'from-green-400 to-green-600',
    microTask: true,
    tips: ['Evita ser/estar en exceso', 'Verbos específicos pintan escenas', 'Muestra, no cuentes']
  },
  {
    id: 'micro_title_brainstorm',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '💡',
    title: "Lluvia de títulos",
    description: "Genera 10 títulos alternativos para tu historia actual",
    time: "7 min",
    color: 'from-yellow-400 to-yellow-600',
    microTask: true,
    tips: ['Juega con aliteraciones', 'Prueba metáforas', 'Títulos cortos impactan más']
  },
  {
    id: 'micro_emotion_quickwrite',
    category: GOAL_CATEGORIES.LEARNING,
    icon: '😊',
    title: "Escritura emocional express",
    description: "Escribe un párrafo que transmita una emoción sin nombrarla",
    time: "8 min",
    color: 'from-red-400 to-red-600',
    microTask: true,
    tips: ['Usa lenguaje corporal', 'Ambiente refleja emoción', 'Acciones revelan sentimientos']
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
        content: "No olvides completar tu BBVA Time Report antes de cerrar el día. Solo toma 10 minutos."
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
    },
    [GOAL_CATEGORIES.LEARNING]: {
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
  const currentDay = new Date().getDay();
  
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
  eligibleTasks = eligibleTasks.filter(task => {
    // If it's a weekly task, only show on the specified day
    if (task.weeklyTask && task.dayOfWeek !== undefined) {
      return currentDay === task.dayOfWeek && !completedTasks.includes(task.id);
    }
    // Otherwise, filter out if completed
    return !completedTasks.includes(task.id);
  });
  
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
