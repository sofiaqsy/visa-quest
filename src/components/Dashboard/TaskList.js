import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, Heart, CheckCircle, X, MessageCircle, Share2, Clock } from 'lucide-react';
import soundManager from '../../utils/soundManager';
import './Dashboard.css';

const TaskList = ({ tasks, completedTasks, onTaskComplete, userName, dayNumber }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Filter out completed tasks
  const activeTasks = tasks.filter(task => !completedTasks.includes(task.id));
  const currentTask = activeTasks[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowUp') navigateTask('prev');
      if (e.key === 'ArrowDown') navigateTask('next');
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (currentTask) {
          handleComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, currentTask]);

  // Touch handlers for swipe
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const distance = startY.current - currentY.current;
    setDragDistance(distance);
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance > 0) {
        navigateTask('next');
      } else {
        navigateTask('prev');
      }
    }
    setDragDistance(0);
  };

  // Navigate between tasks
  const navigateTask = (direction) => {
    if (isAnimating || activeTasks.length === 0) return;
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % activeTasks.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + activeTasks.length) % activeTasks.length);
    }
  };

  // Handle task completion
  const handleComplete = async () => {
    if (!currentTask) return;
    
    // Play sound
    await soundManager.playTaskComplete();
    
    // Complete the task
    onTaskComplete(currentTask.id);
    
    // Show celebration
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      // Move to next task if available
      if (activeTasks.length > 1) {
        setCurrentIndex(currentIndex % (activeTasks.length - 1));
      }
    }, 500);
  };

  // Progress calculation
  const totalTasks = tasks.length;
  const completedCount = completedTasks.length;
  const progress = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  if (activeTasks.length === 0) {
    return (
      <div className="task-container celebration-mode">
        <div className="all-done-container">
          <div className="celebration-emoji">🎉</div>
          <h2>¡Increíble {userName}!</h2>
          <p>Has completado todas las tareas del día {dayNumber}</p>
          <div className="progress-summary">
            <div className="progress-stat">
              <span className="stat-number">{completedCount}</span>
              <span className="stat-label">Tareas completadas</span>
            </div>
            <div className="progress-stat">
              <span className="stat-number">100%</span>
              <span className="stat-label">Progreso del día</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="task-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bar */}
      <div className="progress-header">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{completedCount}/{totalTasks}</span>
      </div>

      {/* Main Task Card */}
      {currentTask && (
        <div 
          className={`task-card ${isAnimating ? 'animating' : ''}`}
          style={{
            transform: `translateY(${-dragDistance * 0.3}px) scale(${1 - Math.abs(dragDistance) * 0.0005})`,
            opacity: 1 - Math.abs(dragDistance) * 0.003
          }}
        >
          <div className={`task-gradient ${currentTask.color || 'from-purple-400 to-pink-600'}`}>
            <div className="task-emoji">{currentTask.icon || currentTask.emoji}</div>
          </div>
          
          <div className="task-content">
            <h2 className="task-title">{currentTask.title}</h2>
            <p className="task-description">{currentTask.description}</p>
            
            <div className="task-meta">
              <span className="task-time">
                <Clock size={16} />
                {currentTask.time}
              </span>
              <span className="task-category">
                {currentTask.category === 'visa' ? '🛂 Visa' : 
                 currentTask.category === 'work' ? '💼 Trabajo' :
                 currentTask.category === 'health' ? '💪 Salud' : 
                 '✨ Personal'}
              </span>
            </div>

            {/* Tips Section */}
            {currentTask.tips && currentTask.tips.length > 0 && (
              <div className="tips-section">
                <button 
                  className="tips-toggle"
                  onClick={() => setShowTips(!showTips)}
                >
                  💡 {showTips ? 'Ocultar' : 'Ver'} consejos
                </button>
                
                {showTips && (
                  <div className="tips-list">
                    {currentTask.tips.map((tip, index) => (
                      <div key={index} className="tip-item">
                        <span className="tip-bullet">•</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="action-btn secondary">
          <X size={24} />
        </button>
        
        <button 
          className="action-btn primary"
          onClick={handleComplete}
        >
          <CheckCircle size={32} />
        </button>
        
        <button className="action-btn secondary">
          <Share2 size={24} />
        </button>
      </div>

      {/* Navigation */}
      <div className="navigation-buttons">
        <button 
          className="nav-btn"
          onClick={() => navigateTask('prev')}
          disabled={activeTasks.length <= 1}
        >
          <ChevronUp size={24} />
        </button>
        <span className="task-counter">
          {currentIndex + 1} / {activeTasks.length}
        </span>
        <button 
          className="nav-btn"
          onClick={() => navigateTask('next')}
          disabled={activeTasks.length <= 1}
        >
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
};

export default TaskList;