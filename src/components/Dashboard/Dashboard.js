import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { moodService, progressService, analyticsService } from '../../firebase/services';
import { CheckCircle, Circle, Calendar, Target, Heart, TrendingUp, Clock, Award } from 'lucide-react';
import './Dashboard.css';

// Daily tasks data - In a real app, this would come from Firebase
const getDailyTasks = (dayNumber) => {
  const allTasks = {
    1: [
      { id: 1, title: "Revisar requisitos de visa", description: "Lee la lista completa de documentos necesarios", time: "15 min" },
      { id: 2, title: "Verificar pasaporte", description: "Asegúrate que esté vigente por al menos 6 meses", time: "5 min" },
      { id: 3, title: "Crear carpeta digital", description: "Organiza tus documentos en Google Drive o Dropbox", time: "10 min" }
    ],
    2: [
      { id: 4, title: "Fotografías para visa", description: "Toma fotos con fondo blanco según especificaciones", time: "20 min" },
      { id: 5, title: "Estado de cuenta bancario", description: "Solicita los últimos 6 meses en tu banco", time: "30 min" },
      { id: 6, title: "Carta de empleo", description: "Pide carta a RRHH con salario y antigüedad", time: "15 min" }
    ],
    // Add more days...
  };
  
  return allTasks[dayNumber] || allTasks[1];
};

// Motivational quotes
const motivationalQuotes = [
  { text: "Cada documento que completas es un paso más cerca de tu sueño canadiense", author: "VisaQuest" },
  { text: "El viaje de mil millas comienza con un solo paso", author: "Lao Tzu" },
  { text: "Tu futuro en Canadá está más cerca de lo que piensas", author: "VisaQuest" },
  { text: "La preparación es la clave del éxito", author: "Alexander Graham Bell" },
  { text: "Hoy es el día perfecto para avanzar hacia tus metas", author: "VisaQuest" }
];

const Dashboard = () => {
  const { currentUser, isGuest } = useAuth();
  const [userName] = useState(localStorage.getItem('visa-quest-user-name') || 'Viajera');
  const [todayMood, setTodayMood] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [dayNumber, setDayNumber] = useState(1);
  const [moodStreak, setMoodStreak] = useState(0);
  const [dailyQuote, setDailyQuote] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    initializeDashboard();
  }, [currentUser]);

  const initializeDashboard = async () => {
    // Get today's mood
    const savedMood = localStorage.getItem('visa-quest-daily-mood');
    if (savedMood) {
      const parsed = JSON.parse(savedMood);
      setTodayMood(parsed);
    }

    // Calculate day number (days since start)
    const startDate = localStorage.getItem('visa-quest-start-date');
    if (startDate) {
      const start = new Date(startDate);
      const today = new Date();
      const diffTime = Math.abs(today - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDayNumber(Math.min(diffDays, 21)); // Cap at 21 days
    } else {
      localStorage.setItem('visa-quest-start-date', new Date().toISOString());
    }

    // Get tasks for today
    const tasks = getDailyTasks(dayNumber);
    setDailyTasks(tasks);

    // Get completed tasks from localStorage (or Firebase)
    const completed = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
    setCompletedTasks(completed);

    // Calculate progress
    const totalTasks = 21 * 3; // 21 days * 3 tasks per day (approximate)
    const completedCount = completed.length;
    setProgress(Math.round((completedCount / totalTasks) * 100));

    // Get mood streak from Firebase
    if (!isGuest) {
      const stats = await moodService.getMoodStats(currentUser?.uid);
      if (stats) {
        setMoodStreak(stats.currentStreak);
      }
    }

    // Select random daily quote
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setDailyQuote(randomQuote);

    // Track dashboard view
    analyticsService.trackAction(currentUser?.uid, 'dashboard_view', { dayNumber });
  };

  const handleTaskComplete = async (taskId) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || completedTasks.includes(taskId)) return;

    // Update completed tasks
    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);
    localStorage.setItem('visa-quest-completed-tasks', JSON.stringify(newCompleted));

    // Save to Firebase
    await progressService.completeTask(currentUser?.uid, {
      taskId,
      taskTitle: task.title,
      dayNumber,
      completedAt: new Date().toISOString()
    });

    // Update progress
    const totalTasks = 21 * 3;
    setProgress(Math.round((newCompleted.length / totalTasks) * 100));

    // Track action
    analyticsService.trackAction(currentUser?.uid, 'task_completed', { taskId, dayNumber });
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const getMoodMessage = () => {
    if (!todayMood) return null;
    
    const messages = {
      good: "¡Me alegra que te sientas bien! Aprovechemos esa energía positiva 🚀",
      okay: "Un día normal también es un buen día para avanzar. ¡Vamos paso a paso! 🌟",
      overwhelmed: "Respira profundo. Hoy haremos solo lo necesario, sin presión 💙",
      confused: "No te preocupes, te guiaré en cada paso. ¡Juntas lo lograremos! 🤝",
      anxious: "La ansiedad es normal en este proceso. Vamos con calma y todo saldrá bien 🌸"
    };

    return messages[todayMood.mood];
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>{getTimeOfDayGreeting()}, {userName}! 👋</h1>
          <p className="subtitle">Día {dayNumber} de tu viaje hacia Canadá</p>
        </div>
        
        {/* Mood Indicator */}
        {todayMood && (
          <div className="mood-indicator">
            <span className="mood-emoji">{todayMood.emoji}</span>
            <span className="mood-label">{todayMood.label}</span>
          </div>
        )}
      </div>

      {/* Mood Message */}
      {getMoodMessage() && (
        <div className="mood-message">
          <Heart className="icon" />
          <p>{getMoodMessage()}</p>
        </div>
      )}

      {/* Progress Overview */}
      <div className="progress-card">
        <div className="progress-header">
          <h2><TrendingUp className="icon" /> Tu Progreso</h2>
          <span className="progress-percentage">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-stats">
          <div className="stat">
            <Calendar className="icon" />
            <span>Día {dayNumber}/21</span>
          </div>
          {moodStreak > 0 && (
            <div className="stat">
              <Award className="icon" />
              <span>{moodStreak} días de racha</span>
            </div>
          )}
        </div>
      </div>

      {/* Daily Objective */}
      <div className="objective-card">
        <h2><Target className="icon" /> Objetivo de Hoy</h2>
        <div className="objective-content">
          <h3>🎯 Completar documentación básica</h3>
          <p>Hoy nos enfocaremos en reunir los documentos esenciales para tu aplicación.</p>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="tasks-card">
        <h2><Clock className="icon" /> Tareas de Hoy</h2>
        <div className="tasks-list">
          {dailyTasks.map(task => (
            <div key={task.id} className={`task-item ${completedTasks.includes(task.id) ? 'completed' : ''}`}>
              <button 
                className="task-checkbox"
                onClick={() => handleTaskComplete(task.id)}
                disabled={completedTasks.includes(task.id)}
              >
                {completedTasks.includes(task.id) ? (
                  <CheckCircle className="icon check" />
                ) : (
                  <Circle className="icon" />
                )}
              </button>
              <div className="task-content">
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <span className="task-time">⏱️ {task.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Motivation */}
      {dailyQuote && (
        <div className="motivation-card">
          <h2>✨ Tu Motivación del Día</h2>
          <blockquote>
            <p>"{dailyQuote.text}"</p>
            <cite>- {dailyQuote.author}</cite>
          </blockquote>
        </div>
      )}

      {/* Quick Tips */}
      <div className="tips-card">
        <h2>💡 Tips Rápidos</h2>
        <ul>
          <li>Guarda todos los documentos en formato PDF</li>
          <li>Mantén copias digitales y físicas</li>
          <li>Revisa cada documento antes de enviarlo</li>
          <li>No dudes en pedir ayuda si la necesitas</li>
        </ul>
      </div>

      {/* Community Section */}
      <div className="community-card">
        <h2>👥 Comunidad</h2>
        <p>¡No estás sola! Únete a nuestra comunidad de viajeras</p>
        <div className="community-stats">
          <div className="stat">
            <span className="number">1,234</span>
            <span className="label">Viajeras activas</span>
          </div>
          <div className="stat">
            <span className="number">89</span>
            <span className="label">Visas aprobadas este mes</span>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      {isGuest && (
        <div className="cta-card">
          <h3>¿Quieres guardar tu progreso?</h3>
          <p>Crea una cuenta gratuita para sincronizar tu avance en todos tus dispositivos</p>
          <a href="/login" className="cta-button">Crear Cuenta</a>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
