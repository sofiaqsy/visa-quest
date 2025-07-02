import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Bell, 
  Volume2, 
  Calendar, 
  Coffee, 
  Target,
  Moon,
  Sun,
  Save,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useTaskScheduling } from '../../hooks/useTaskScheduling';
import soundManager from '../../utils/soundManager';

const ScheduleSettings = () => {
  const { schedule, soundSettings, updateSchedule, updateSoundSettings, loading } = useTaskScheduling();
  
  const [localSchedule, setLocalSchedule] = useState(null);
  const [localSoundSettings, setLocalSoundSettings] = useState(soundSettings);
  const [saving, setSaving] = useState(false);
  const [testingSound, setTestingSound] = useState(false);

  useEffect(() => {
    if (schedule) {
      setLocalSchedule(schedule);
    }
  }, [schedule]);

  useEffect(() => {
    setLocalSoundSettings(soundSettings);
  }, [soundSettings]);

  const handleScheduleChange = (section, field, value) => {
    setLocalSchedule(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBreakChange = (breakType, field, value) => {
    setLocalSchedule(prev => ({
      ...prev,
      breaks: {
        ...prev.breaks,
        [breakType]: {
          ...prev.breaks[breakType],
          [field]: value
        }
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setLocalSchedule(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleTaskPreferenceChange = (category, field, value) => {
    setLocalSchedule(prev => ({
      ...prev,
      taskPreferences: {
        ...prev.taskPreferences,
        [category]: {
          ...prev.taskPreferences[category],
          [field]: value
        }
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      // Update schedule
      await updateSchedule(localSchedule);
      
      // Update sound settings
      updateSoundSettings(localSoundSettings);
      
      // Show success feedback
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaving(false);
    }
  };

  const testSound = async (soundType) => {
    setTestingSound(true);
    await soundManager.playSound(soundType);
    setTimeout(() => setTestingSound(false), 1000);
  };

  if (loading || !localSchedule) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Clock className="mr-3 text-purple-600" />
          Configuración de Horarios
        </h2>

        {/* Working Hours */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Sun className="mr-2 text-yellow-500" size={20} />
            Horario de Trabajo
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hora de inicio
              </label>
              <input
                type="time"
                value={localSchedule.workingHours.start}
                onChange={(e) => handleScheduleChange('workingHours', 'start', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Hora de fin
              </label>
              <input
                type="time"
                value={localSchedule.workingHours.end}
                onChange={(e) => handleScheduleChange('workingHours', 'end', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Breaks */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Coffee className="mr-2 text-orange-500" size={20} />
            Descansos
          </h3>
          
          {/* Lunch Break */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Almuerzo</span>
              <button
                onClick={() => handleBreakChange('lunch', 'enabled', !localSchedule.breaks.lunch.enabled)}
                className="text-purple-600"
              >
                {localSchedule.breaks.lunch.enabled ? (
                  <ToggleRight size={24} />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>
            </div>
            {localSchedule.breaks.lunch.enabled && (
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={localSchedule.breaks.lunch.start}
                  onChange={(e) => handleBreakChange('lunch', 'start', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="time"
                  value={localSchedule.breaks.lunch.end}
                  onChange={(e) => handleBreakChange('lunch', 'end', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>

          {/* Other Breaks */}
          {['morning', 'afternoon'].map((breakType) => (
            <div key={breakType} className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-700">
                  Descanso {breakType === 'morning' ? 'Matutino' : 'Vespertino'}
                </span>
                <button
                  onClick={() => handleBreakChange(breakType, 'enabled', !localSchedule.breaks[breakType].enabled)}
                  className="text-purple-600"
                >
                  {localSchedule.breaks[breakType].enabled ? (
                    <ToggleRight size={24} />
                  ) : (
                    <ToggleLeft size={24} className="text-gray-400" />
                  )}
                </button>
              </div>
              {localSchedule.breaks[breakType].enabled && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="time"
                    value={localSchedule.breaks[breakType].time}
                    onChange={(e) => handleBreakChange(breakType, 'time', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="number"
                    value={localSchedule.breaks[breakType].duration}
                    onChange={(e) => handleBreakChange(breakType, 'duration', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="Duración (min)"
                    min="5"
                    max="60"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sound Settings */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Volume2 className="mr-2 text-green-500" size={20} />
            Configuración de Sonidos
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Sonidos habilitados</span>
              <button
                onClick={() => setLocalSoundSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                className="text-purple-600"
              >
                {localSoundSettings.enabled ? (
                  <ToggleRight size={24} />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>
            </div>

            {localSoundSettings.enabled && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volumen: {Math.round(localSoundSettings.volume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={localSoundSettings.volume * 100}
                    onChange={(e) => setLocalSoundSettings(prev => ({ ...prev, volume: e.target.value / 100 }))}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => testSound('taskComplete')}
                    disabled={testingSound}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    Probar: Tarea Completada
                  </button>
                  <button
                    onClick={() => testSound('taskReminder')}
                    disabled={testingSound}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                  >
                    Probar: Recordatorio
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Bell className="mr-2 text-blue-500" size={20} />
            Notificaciones
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">Notificaciones push</span>
              <button
                onClick={() => handleNotificationChange('enabled', !localSchedule.notifications.enabled)}
                className="text-purple-600"
              >
                {localSchedule.notifications.enabled ? (
                  <ToggleRight size={24} />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>
            </div>

            {localSchedule.notifications.enabled && (
              <>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recordatorios antes de la tarea (minutos)
                  </label>
                  <div className="flex gap-2">
                    {localSchedule.notifications.reminderTimes.map((time, index) => (
                      <input
                        key={index}
                        type="number"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...localSchedule.notifications.reminderTimes];
                          newTimes[index] = parseInt(e.target.value);
                          handleNotificationChange('reminderTimes', newTimes);
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                        min="1"
                        max="60"
                      />
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Resumen diario</span>
                    <button
                      onClick={() => {
                        const newSummary = { ...localSchedule.notifications.dailySummary };
                        newSummary.enabled = !newSummary.enabled;
                        handleNotificationChange('dailySummary', newSummary);
                      }}
                      className="text-purple-600"
                    >
                      {localSchedule.notifications.dailySummary.enabled ? (
                        <ToggleRight size={24} />
                      ) : (
                        <ToggleLeft size={24} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {localSchedule.notifications.dailySummary.enabled && (
                    <input
                      type="time"
                      value={localSchedule.notifications.dailySummary.time}
                      onChange={(e) => {
                        const newSummary = { ...localSchedule.notifications.dailySummary };
                        newSummary.time = e.target.value;
                        handleNotificationChange('dailySummary', newSummary);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Weekend Mode */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <Moon className="mr-2 text-indigo-500" size={20} />
            Modo Fin de Semana
          </h3>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-medium text-gray-700">Modo fin de semana</p>
                <p className="text-sm text-gray-500">Reduce notificaciones y limita tareas</p>
              </div>
              <button
                onClick={() => handleScheduleChange('weekendMode', 'enabled', !localSchedule.weekendMode.enabled)}
                className="text-purple-600"
              >
                {localSchedule.weekendMode.enabled ? (
                  <ToggleRight size={24} />
                ) : (
                  <ToggleLeft size={24} className="text-gray-400" />
                )}
              </button>
            </div>
            
            {localSchedule.weekendMode.enabled && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Límite de tareas
                </label>
                <input
                  type="number"
                  value={localSchedule.weekendMode.taskLimit}
                  onChange={(e) => handleScheduleChange('weekendMode', 'taskLimit', parseInt(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="1"
                  max="10"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg flex items-center disabled:opacity-50"
          >
            <Save className="mr-2" size={20} />
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSettings;
