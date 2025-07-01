import React, { useState, useEffect } from 'react';
import { CheckCircle, Circle, Settings, Plus, X, Briefcase, Heart, Calendar, Clock, ChevronRight } from 'lucide-react';
import './SimpleProgressView.css';

// Default projects with tasks
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

// Simple Progress View Component
const SimpleProgressView = ({ completedTasks, activeGoals, userName, onGoalsUpdate }) => {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [tasks, setTasks] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [activeCategory, setActiveCategory] = useState('personal');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Initialize data
  useEffect(() => {
    // Load saved projects
    const savedProjects = localStorage.getItem('simple-progress-projects');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Load saved tasks
    const savedTasks = localStorage.getItem('simple-progress-tasks');
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
  }, []);

  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('simple-progress-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('simple-progress-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Get all tasks for a category
  const getAllTasksForCategory = (category) => {
    const categoryTasks = [];
    
    // Add daily tasks
    if (tasks.daily && tasks.daily[category]) {
      categoryTasks.push(...tasks.daily[category].map(t => ({ ...t, frequency: 'daily' })));
    }

    // Add weekend tasks
    if (tasks.weekend && tasks.weekend[category]) {
      categoryTasks.push(...tasks.weekend[category].map(t => ({ ...t, frequency: 'weekend' })));
    }

    // Add monthly tasks
    if (tasks.monthly && tasks.monthly[category]) {
      categoryTasks.push(...tasks.monthly[category].map(t => ({ ...t, frequency: 'monthly' })));
    }

    return categoryTasks;
  };

  // Calculate progress for category
  const calculateProgress = (category) => {
    const categoryTasks = getAllTasksForCategory(category);
    if (categoryTasks.length === 0) return 0;
    
    const completed = categoryTasks.filter(task => completedTasks.includes(task.id)).length;
    return Math.round((completed / categoryTasks.length) * 100);
  };

  const workProgress = calculateProgress('work');
  const personalProgress = calculateProgress('personal');
  const overallProgress = Math.round((workProgress + personalProgress) / 2);

  // Add/Delete project handlers
  const addProject = (category, projectName) => {
    if (projectName.trim()) {
      const newProject = {
        id: `project-${Date.now()}`,
        name: projectName.trim(),
        active: true
      };
      
      setProjects({
        ...projects,
        [category]: [...projects[category], newProject]
      });
    }
  };

  const deleteProject = (category, projectId) => {
    setProjects({
      ...projects,
      [category]: projects[category].filter(p => p.id !== projectId)
    });
  };

  // Add/Delete task handlers
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

  const deleteTask = (frequency, category, taskId) => {
    const updatedTasks = { ...tasks };
    if (updatedTasks[frequency] && updatedTasks[frequency][category]) {
      updatedTasks[frequency][category] = updatedTasks[frequency][category].filter(t => t.id !== taskId);
      setTasks(updatedTasks);
    }
  };

  return (
    <div className="simple-progress-view">
      {/* Header */}
      <div className="progress-header">
        <div>
          <h1>Tu Progreso</h1>
          <p className="subtitle">Hola {userName} 👋 Has completado el {overallProgress}% de tus tareas</p>
        </div>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Overall Progress */}
      <div className="overall-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="progress-stats">
          <span>{overallProgress}% Total</span>
          <span>{completedTasks.length} tareas completadas</span>
        </div>
      </div>

      {/* Categories */}
      <div className="categories-container">
        {/* Work Category */}
        <div className="category-card work">
          <button 
            className="category-header"
            onClick={() => setExpandedCategory(expandedCategory === 'work' ? null : 'work')}
          >
            <div className="category-info">
              <Briefcase size={24} />
              <div>
                <h2>Trabajo</h2>
                <p>{workProgress}% completado</p>
              </div>
            </div>
            <ChevronRight 
              size={20} 
              className={`expand-icon ${expandedCategory === 'work' ? 'expanded' : ''}`}
            />
          </button>

          {expandedCategory === 'work' && (
            <div className="category-content">
              <div className="projects-section">
                <h3>Proyectos</h3>
                <div className="projects-list">
                  {projects.work.map(project => (
                    <div key={project.id} className="project-item">
                      <span>{project.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tasks-section">
                <h3>Tareas</h3>
                <div className="tasks-summary">
                  {getAllTasksForCategory('work').map(task => (
                    <div key={task.id} className="task-summary-item">
                      <span className={`checkbox ${completedTasks.includes(task.id) ? 'completed' : ''}`}>
                        {completedTasks.includes(task.id) ? <CheckCircle size={16} /> : <Circle size={16} />}
                      </span>
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
          )}
        </div>

        {/* Personal Category */}
        <div className="category-card personal">
          <button 
            className="category-header"
            onClick={() => setExpandedCategory(expandedCategory === 'personal' ? null : 'personal')}
          >
            <div className="category-info">
              <Heart size={24} />
              <div>
                <h2>Personal</h2>
                <p>{personalProgress}% completado</p>
              </div>
            </div>
            <ChevronRight 
              size={20} 
              className={`expand-icon ${expandedCategory === 'personal' ? 'expanded' : ''}`}
            />
          </button>

          {expandedCategory === 'personal' && (
            <div className="category-content">
              <div className="projects-section">
                <h3>Proyectos</h3>
                <div className="projects-list">
                  {projects.personal.map(project => (
                    <div key={project.id} className="project-item">
                      <span>{project.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="tasks-section">
                <h3>Tareas</h3>
                <div className="tasks-summary">
                  {getAllTasksForCategory('personal').map(task => (
                    <div key={task.id} className="task-summary-item">
                      <span className={`checkbox ${completedTasks.includes(task.id) ? 'completed' : ''}`}>
                        {completedTasks.includes(task.id) ? <CheckCircle size={16} /> : <Circle size={16} />}
                      </span>
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
          )}
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
  setActiveCategory
}) => {
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('daily');

  const handleAddProject = () => {
    onAddProject(activeCategory, newProjectName);
    setNewProjectName('');
    setShowAddProject(false);
  };

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
                  onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                />
                <button onClick={handleAddProject}>Agregar</button>
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

export default SimpleProgressView;
