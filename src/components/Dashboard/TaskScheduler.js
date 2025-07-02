import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  Volume2, 
  VolumeX,
  Calendar,
  Bell,
  RefreshCw,
  Target,
  Coffee,
  Sun,
  Moon
} from 'lucide-react';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import { getCurrentTimeContext, getContextualGreeting } from '../../data/taskData';
import soundManager from '../../utils/soundManager';

const TaskScheduler = ({ tasks, onTaskComplete }) => {
  const {
    schedule,
    soundSettings,
    scheduleTask,
    completeScheduledTask,
    rescheduleTask,
    playAmbientSound,
    isInFocusMode,
    isBreakTime,
    getTodayTasks,
    updateSoundSettings
  } = useTaskScheduling();

  const [selectedTask, setSelectedTask] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [timeContext, setTimeContext] = useState(getCurrentTimeContext());
  const [greeting, setGreeting] = useState(getContextualGreeting());

  // Update time context every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeContext(getCurrentTimeContext());
      setGreeting(getContextualGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Play ambient sound on time context change
  useEffect(() => {
    playAmbientSound(timeContext);
  }, [timeContext, playAmbientSound]);

  const handleScheduleTask = async (task) => {
    setSelectedTask(task);
    setShowScheduler(true);
    
    // Set default time based on task preference
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    setScheduleTime(now.toISOString().slice(0, 16));
  };

  const confirmSchedule = async () => {
    if (!selectedTask || !scheduleTime) return;

    const scheduled = await scheduleTask(selectedTask, new Date(scheduleTime));
    
    if (scheduled) {
      setShowScheduler(false);
      setSelectedTask(null);
      
      // Play scheduling sound
      if (soundSettings.enabled) {
        await soundManager.playSound('focus');
      }
    }
  };

  const handleCompleteTask = async (taskId, isScheduled = false) => {
    if (isScheduled) {
      const success = await completeScheduledTask(taskId);
      if (!success) return;
    }
    
    // Call parent completion handler
    if (onTaskComplete) {
      onTaskComplete(taskId);
    }
  };

  const handleReschedule = async (taskId) => {
    const newTime = prompt('Nueva hora (HH:MM):');
    if (!newTime) return;

    const [hours, minutes] = newTime.split(':');
    const newDate = new Date();
    newDate.setHours(parseInt(hours), parseInt(minutes), 0);

    await rescheduleTask(taskId, newDate);
  };

  const todaysTasks = getTodayTasks();
  const focusMode = isInFocusMode();
  const breakTime = isBreakTime();

  // Get time-appropriate icon
  const getTimeIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 18) return <Sun className="text-yellow-500" size={20} />;
    return <Moon className="text-indigo-500" size={20} />;
  };

  return (
    <div className="space-y-6">
      {/* Time Context Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {getTimeIcon()}
            {greeting}
          </h2>
          <button
            onClick={() => updateSoundSettings({ ...soundSettings, enabled: !soundSettings.enabled })}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {soundSettings.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
        
        {focusMode && (
          <div className="bg-white/20 rounded-lg px-4 py-2 inline-flex items-center gap-2">
            <Target size={16} />
            <span className="text-sm font-medium">Modo Enfoque: {focusMode}</span>
          </div>
        )}
        
        {breakTime && (
          <div className="bg-white/20 rounded-lg px-4 py-2 inline-flex items-center gap-2 mt-2">
            <Coffee size={16} />
            <span className="text-sm font-medium">
              Tiempo de descanso: {breakTime === 'lunch' ? 'Almuerzo' : 'Pausa'}
            </span>
          </div>
        )}
      </div>

      {/* Today's Scheduled Tasks */}
      {todaysTasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-purple-600" size={20} />
            Tareas Programadas para Hoy
          </h3>
          
          <div className="space-y-3">
            {todaysTasks.map((task) => {
              const taskTime = task.scheduledTime.toDate();
              const isPast = taskTime < new Date();
              const isUpcoming = taskTime > new Date() && taskTime < new Date(Date.now() + 30 * 60000);
              
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    task.status === 'completed'
                      ? 'bg-green-50 border-green-200'
                      : isPast
                      ? 'bg-red-50 border-red-200'
                      : isUpcoming
                      ? 'bg-yellow-50 border-yellow-200 animate-pulse'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{task.icon}</span>
                        <div>
                          <h4 className="font-medium text-gray-800">{task.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <Clock size={14} />
                            {taskTime.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                            {task.notificationEnabled && <Bell size={14} className="text-blue-500" />}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {task.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => handleCompleteTask(task.id, true)}
                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            title="Completar"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleReschedule(task.id)}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Reprogramar"
                          >
                            <RefreshCw size={20} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Tasks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Tareas Disponibles
        </h3>
        
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                task.timePreference === timeContext
                  ? 'border-purple-300 bg-purple-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{task.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {task.time}
                        </span>
                        {task.priority && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleScheduleTask(task)}
                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                    title="Programar"
                  >
                    <Calendar size={20} />
                  </button>
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                    title="Completar ahora"
                  >
                    <CheckCircle size={20} />
                  </button>
                </div>
              </div>
              
              {task.tips && task.tips.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    💡 {task.tips[0]}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduler && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Programar: {selectedTask.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tiempo estimado:</span> {selectedTask.time}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Categoría:</span> {selectedTask.category}
                </p>
                {schedule?.notifications.enabled && (
                  <p className="text-sm text-gray-600 mt-1">
                    <Bell size={14} className="inline mr-1" />
                    Recibirás recordatorios {schedule.notifications.reminderTimes.join(' y ')} minutos antes
                  </p>
                )}
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowScheduler(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmSchedule}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Programar Tarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskScheduler;
