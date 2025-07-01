import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Settings, Plus, X, Briefcase, Heart, Calendar, Clock } from 'lucide-react';
import './SimpleDashboard.css';

// Default projects
const DEFAULT_PROJECTS = {
  work: [
    { id: 'project-a', name: 'Proyecto A', active: true }
  ],
  personal: [
    { id: 'visa-canada', name: 'Visa Canadá', active: true },
    { id: 'history-course', name: 'Curso History Telling', active: true },
    { id: 'apartment', name: 'Depa', active: true }
  ]
};

const SimpleDashboard = () => {
  const [userName, setUserName] = useState('');
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [tasks, setTasks] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState('personal');
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Initialize data
  useEffect(() => {
    // Get user name
    const savedName = localStorage.getItem('visa-quest-user-name') || 'Amiga';
    setUserName(savedName);

    // Load saved projects
    const savedProjects = localStorage.getItem('simple-dashboard-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load saved tasks
    const savedTasks = localStorage.getItem('simple-dashboard-tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Initialize default tasks
      const defaultTasks = {
        daily: {
          work: [
            { id: 'daily-work-1', text: 'Revisar emails', project: null },
            { id: 'daily-work-2', text: 'Stand-up meeting', project: null }
          ],
          personal: [
            { id: 'daily-personal-1', text: 'Ejercicio matutino', project: null },
            { id: 'daily-personal-2', text: 'Meditación 10 min', project: null }
          ]
        },
        weekend: {
          personal: [
            { id: 'weekend-1', text: 'Limpieza general', project: 'apartment' },
            { id: 'weekend-2', text: 'Planificar semana', project: null }
          ]
        },
        monthly: {
          personal: [
            { id: 'monthly-1', text: 'Pagar servicios', project: 'apartment' },
            { id: 'monthly-2', text: 'Revisar presupuesto', project: null }
          ]
        }
      };
      setTasks(defaultTasks);
    }

    // Load completed tasks for today
    const today = new Date().toDateString();
    const savedCompleted = JSON.parse(localStorage.getItem('simple-dashboard-completed') || '{}');
    if (savedCompleted[today]) {
      setCompletedTasks(savedCompleted[today]);
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('simple-dashboard-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('simple-dashboard-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedCompleted = JSON.parse(localStorage.getItem('simple-dashboard-completed') || '{}');
    savedCompleted[today] = completedTasks;
    localStorage.setItem('simple-dashboard-completed', JSON.stringify(savedCompleted));
  }, [completedTasks]);

  // Check if today is weekend
  const isWeekend = () => {
    const day = new Date().getDay();
    return day === 0 || day === 6;
  };

  // Check if today is end of month (last 3 days)
  const isEndOfMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return today.getDate() >= lastDay - 2;
  };

  // Get tasks for current time context
  const getCurrentTasks = (category) => {
    const categoryTasks = [];
    
    // Always add daily tasks
    if (tasks.daily && tasks.daily[category]) {
      categoryTasks.push(...tasks.daily[category].map(t => ({ ...t, frequency: 'daily' })));
    }

    // Add weekend tasks if it's weekend
    if (isWeekend() && tasks.weekend && tasks.weekend[category]) {
      categoryTasks.push(...tasks.weekend[category].map(t => ({ ...t, frequency: 'weekend' })));
    }

    // Add monthly tasks if it's end of month
    if (isEndOfMonth() && tasks.monthly && tasks.monthly[category]) {
      categoryTasks.push(...tasks.monthly[category].map(t => ({ ...t, frequency: 'monthly' })));
    }

    return categoryTasks;
  };

  // Toggle task completion
  const toggleTask = (taskId) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(completedTasks.filter(id => id !== taskId));
    } else {
      setCompletedTasks([...completedTasks, taskId]);
    }
  };

  // Add new project
  const addProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: `project-${Date.now()}`,
        name: newProjectName.trim(),
        active: true
      };
      
      setProjects({
        ...projects,
        [activeCategory]: [...projects[activeCategory], newProject]
      });
      
      setNewProjectName('');
      setShowAddProject(false);
    }
  };

  // Delete project
  const deleteProject = (category, projectId) => {
    setProjects({
      ...projects,
      [category]: projects[category].filter(p => p.id !== projectId)
    });
  };

  // Add new task
  const addTask = (frequency, category, taskText, projectId = null) => {
    const newTask = {
      id: `task-${Date.now()}`,
      text: taskText,
      project: projectId
    };

    const updatedTasks = { ...tasks };
    if (!updatedTasks[frequency]) updatedTasks[frequency] = {};
    if (!updatedTasks[frequency][category]) updatedTasks[frequency][category] = [];
    
    updatedTasks[frequency][category].push(newTask);
    setTasks(updatedTasks);
  };

  // Delete task
  const deleteTask = (frequency, category, taskId) => {
    const updatedTasks = { ...tasks };
    if (updatedTasks[frequency] && updatedTasks[frequency][category]) {
      updatedTasks[frequency][category] = updatedTasks[frequency][category].filter(t => t.id !== taskId);
      setTasks(updatedTasks);
    }
  };

  // Calculate progress
  const calculateProgress = (category) => {
    const currentTasks = getCurrentTasks(category);
    if (currentTasks.length === 0) return 0;
    
    const completed = currentTasks.filter(task => completedTasks.includes(task.id)).length;
    return Math.round((completed / currentTasks.length) * 100);
  };

  const workProgress = calculateProgress('work');
  const personalProgress = calculateProgress('personal');

  return (
    <div className="simple-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="greeting">
          <h1>Hola {userName} 👋</h1>
          <p className="date">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="main-grid">
        {/* Work Section */}
        <div className="category-section work">
          <div className="category-header">
            <div className="category-title">
              <Briefcase size={24} />
              <h2>Trabajo</h2>
            </div>
            <div className="progress-circle">
              <span>{workProgress}%</span>
            </div>
          </div>

          {/* Projects */}
          <div className="projects-list">
            {projects.work.map(project => (
              <div key={project.id} className="project-tag">
                {project.name}
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="tasks-list">
            {getCurrentTasks('work').map(task => (
              <div key={task.id} className="task-item">
                <button
                  className={`task-checkbox ${completedTasks.includes(task.id) ? 'completed' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  {completedTasks.includes(task.id) ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
                <span className={completedTasks.includes(task.id) ? 'completed' : ''}>
                  {task.text}
                </span>
                <span className={`frequency-badge ${task.frequency}`}>
                  {task.frequency === 'daily' ? <Clock size={12} /> : <Calendar size={12} />}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Section */}
        <div className="category-section personal">
          <div className="category-header">
            <div className="category-title">
              <Heart size={24} />
              <h2>Personal</h2>
            </div>
            <div className="progress-circle">
              <span>{personalProgress}%</span>
            </div>
          </div>

          {/* Projects */}
          <div className="projects-list">
            {projects.personal.map(project => (
              <div key={project.id} className="project-tag">
                {project.name}
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="tasks-list">
            {getCurrentTasks('personal').map(task => (
              <div key={task.id} className="task-item">
                <button
                  className={`task-checkbox ${completedTasks.includes(task.id) ? 'completed' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  {completedTasks.includes(task.id) ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>
                <span className={completedTasks.includes(task.id) ? 'completed' : ''}>
                  {task.text}
                </span>
                <span className={`frequency-badge ${task.frequency}`}>
                  {task.frequency === 'daily' ? <Clock size={12} /> : <Calendar size={12} />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal 
          projects={projects}
          tasks={tasks}
          onClose={() => setShowSettings(false)}
          onAddProject={addProject}
          onDeleteProject={deleteProject}
          onAddTask={addTask}
          onDeleteTask={deleteTask}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          showAddProject={showAddProject}
          setShowAddProject={setShowAddProject}
          newProjectName={newProjectName}
          setNewProjectName={setNewProjectName}
        />
      )}
    </div>
  );
};

// Settings Modal Component
const SettingsModal = ({ 
  projects, 
  tasks, 
  onClose, 
  onAddProject, 
  onDeleteProject, 
  onAddTask, 
  onDeleteTask,
  activeCategory,
  setActiveCategory,
  showAddProject,
  setShowAddProject,
  newProjectName,
  setNewProjectName
}) => {
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(selectedFrequency, activeCategory, newTaskText.trim());
      setNewTaskText('');
      setShowAddTask(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Configuración</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-tabs">
          <button 
            className={`tab ${activeCategory === 'work' ? 'active' : ''}`}
            onClick={() => setActiveCategory('work')}
          >
            <Briefcase size={16} /> Trabajo
          </button>
          <button 
            className={`tab ${activeCategory === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveCategory('personal')}
          >
            <Heart size={16} /> Personal
          </button>
        </div>

        <div className="settings-content">
          {/* Projects Section */}
          <div className="settings-section">
            <div className="section-header">
              <h4>Proyectos</h4>
              <button className="add-btn" onClick={() => setShowAddProject(true)}>
                <Plus size={16} />
              </button>
            </div>
            
            {showAddProject && (
              <div className="add-form">
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && onAddProject()}
                />
                <button onClick={onAddProject}>Agregar</button>
                <button onClick={() => setShowAddProject(false)}>Cancelar</button>
              </div>
            )}

            <div className="items-list">
              {projects[activeCategory].map(project => (
                <div key={project.id} className="item">
                  <span>{project.name}</span>
                  <button onClick={() => onDeleteProject(activeCategory, project.id)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Section */}
          <div className="settings-section">
            <div className="section-header">
              <h4>Tareas</h4>
              <button className="add-btn" onClick={() => setShowAddTask(true)}>
                <Plus size={16} />
              </button>
            </div>

            {showAddTask && (
              <div className="add-form">
                <input
                  type="text"
                  placeholder="Nueva tarea"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
                <select 
                  value={selectedFrequency} 
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                >
                  <option value="daily">Diaria</option>
                  <option value="weekend">Fin de semana</option>
                  <option value="monthly">Mensual</option>
                </select>
                <button onClick={handleAddTask}>Agregar</button>
                <button onClick={() => setShowAddTask(false)}>Cancelar</button>
              </div>
            )}

            {/* Task lists by frequency */}
            {['daily', 'weekend', 'monthly'].map(frequency => (
              <div key={frequency} className="frequency-group">
                <h5>
                  {frequency === 'daily' && '📅 Diarias'}
                  {frequency === 'weekend' && '🏖️ Fin de semana'}
                  {frequency === 'monthly' && '📆 Mensuales'}
                </h5>
                <div className="items-list">
                  {tasks[frequency] && tasks[frequency][activeCategory] && 
                    tasks[frequency][activeCategory].map(task => (
                      <div key={task.id} className="item">
                        <span>{task.text}</span>
                        <button onClick={() => onDeleteTask(frequency, activeCategory, task.id)}>
                          <X size={16} />
                        </button>
                      </div>
                    ))
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
