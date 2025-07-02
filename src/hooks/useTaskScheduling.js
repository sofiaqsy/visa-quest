// Custom hook for task scheduling and sound integration
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import soundManager from '../utils/soundManager';
import { scheduleService, goalsService } from '../firebase/services';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useTaskScheduling = () => {
  const { currentUser } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [scheduledTasks, setScheduledTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soundSettings, setSoundSettings] = useState(soundManager.getSettings());

  // Initialize user schedule from Firebase
  useEffect(() => {
    if (!currentUser && !localStorage.getItem('visa-quest-device-id')) {
      setLoading(false);
      return;
    }

    const initSchedule = async () => {
      try {
        // Initialize schedule in Firebase
        const userSchedule = await scheduleService.getUserSchedule(currentUser?.uid);
        setSchedule(userSchedule);
        
        // Initialize goals in Firebase if needed
        await goalsService.getUserGoals(currentUser?.uid);
        
        // Sync local data to Firebase if user is authenticated
        if (currentUser?.uid) {
          await goalsService.syncLocalGoals(currentUser.uid);
        }
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    initSchedule();
  }, [currentUser]);

  // Subscribe to scheduled tasks from Firebase
  useEffect(() => {
    if (!currentUser && !localStorage.getItem('visa-quest-device-id')) return;

    const effectiveUserId = currentUser?.uid || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
    
    const q = query(
      collection(db, 'scheduledTasks'),
      where('userId', '==', effectiveUserId),
      where('status', 'in', ['pending', 'reminder_sent']),
      orderBy('scheduledTime', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({ 
          id: doc.id, 
          ...data,
          // Convert Firestore timestamp to Date if needed
          scheduledTime: data.scheduledTime?.toDate ? data.scheduledTime : new Date(data.scheduledTime)
        });
      });
      setScheduledTasks(tasks);
    }, (error) => {
      console.error('Error subscribing to scheduled tasks:', error);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Schedule a task
  const scheduleTask = useCallback(async (task, scheduledTime = null) => {
    if (!schedule) return null;

    try {
      // Get optimal time if not provided
      const taskTime = scheduledTime || new Date();

      // Save to Firebase
      const taskId = await scheduleService.saveScheduledTask(currentUser?.uid, {
        ...task,
        scheduledTime: Timestamp.fromDate(taskTime),
        soundEnabled: schedule.notifications.sound,
        notificationEnabled: schedule.notifications.enabled
      });

      // Play scheduling sound
      if (soundSettings.enabled) {
        await soundManager.playSound('focus');
      }

      return taskId;
    } catch (error) {
      console.error('Error scheduling task:', error);
      return null;
    }
  }, [currentUser, schedule, soundSettings]);

  // Complete a scheduled task
  const completeScheduledTask = useCallback(async (taskId) => {
    try {
      // Update in Firebase
      await scheduleService.updateScheduledTask(taskId, {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // Play completion sound
      if (soundSettings.enabled) {
        await soundManager.playTaskComplete();
      }

      // Update user stats in Firebase
      const statsRef = doc(db, 'userStats', currentUser?.uid || `guest_${localStorage.getItem('visa-quest-device-id')}`);
      const statsDoc = await getDoc(statsRef);
      
      if (statsDoc.exists()) {
        const stats = statsDoc.data();
        await updateDoc(statsRef, {
          tasksCompleted: (stats.tasksCompleted || 0) + 1,
          lastTaskCompleted: serverTimestamp()
        });
      } else {
        await setDoc(statsRef, {
          tasksCompleted: 1,
          lastTaskCompleted: serverTimestamp(),
          userId: currentUser?.uid || `guest_${localStorage.getItem('visa-quest-device-id')}`
        });
      }

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  }, [currentUser, soundSettings]);

  // Reschedule a task
  const rescheduleTask = useCallback(async (taskId, newTime) => {
    if (!schedule) return false;

    try {
      await scheduleService.updateScheduledTask(taskId, {
        scheduledTime: Timestamp.fromDate(newTime),
        rescheduledAt: serverTimestamp(),
        status: 'pending'
      });

      // Play reschedule sound
      if (soundSettings.enabled) {
        await soundManager.playSound('taskReminder');
      }

      return true;
    } catch (error) {
      console.error('Error rescheduling task:', error);
      return false;
    }
  }, [schedule, soundSettings]);

  // Update schedule preferences
  const updateSchedule = useCallback(async (updates) => {
    try {
      const success = await scheduleService.updateUserSchedule(currentUser?.uid, updates);
      
      if (success) {
        const updatedSchedule = await scheduleService.getUserSchedule(currentUser?.uid);
        setSchedule(updatedSchedule);
      }

      return success;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return false;
    }
  }, [currentUser]);

  // Update sound settings
  const updateSoundSettings = useCallback((settings) => {
    soundManager.setEnabled(settings.enabled);
    soundManager.setVolume(settings.volume);
    setSoundSettings(soundManager.getSettings());
  }, []);

  // Play time-based ambient sound
  const playAmbientSound = useCallback(async (timeContext) => {
    if (soundSettings.enabled) {
      await soundManager.playTimeBasedSound(timeContext);
    }
  }, [soundSettings]);

  // Get upcoming tasks for today
  const getTodayTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return scheduledTasks.filter(task => {
      const taskTime = task.scheduledTime instanceof Date ? task.scheduledTime : task.scheduledTime.toDate();
      return taskTime >= today && taskTime < tomorrow;
    });
  }, [scheduledTasks]);

  // Check if in focus mode
  const isInFocusMode = useCallback(() => {
    if (!schedule) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (!schedule.focusMode?.enabled) return false;
    
    for (const session of (schedule.focusMode.sessions || [])) {
      if (session.days?.includes(currentDay) &&
          currentTime >= session.start &&
          currentTime <= session.end) {
        return session.name;
      }
    }
    
    return false;
  }, [schedule]);

  // Check if it's break time
  const isBreakTime = useCallback(() => {
    if (!schedule) return null;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check lunch break
    if (schedule.breaks?.lunch?.enabled &&
        currentTime >= schedule.breaks.lunch.start &&
        currentTime <= schedule.breaks.lunch.end) {
      return 'lunch';
    }
    
    // Check other breaks
    for (const [breakName, breakConfig] of Object.entries(schedule.breaks || {})) {
      if (breakName !== 'lunch' && breakConfig.enabled) {
        const breakStart = new Date();
        const [hours, minutes] = breakConfig.time.split(':');
        breakStart.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const breakEnd = new Date(breakStart);
        breakEnd.setMinutes(breakEnd.getMinutes() + breakConfig.duration);
        
        if (now >= breakStart && now <= breakEnd) {
          return breakName;
        }
      }
    }
    
    return null;
  }, [schedule]);

  return {
    schedule,
    scheduledTasks,
    loading,
    soundSettings,
    scheduleTask,
    completeScheduledTask,
    rescheduleTask,
    updateSchedule,
    updateSoundSettings,
    playAmbientSound,
    getTodayTasks,
    isInFocusMode,
    isBreakTime
  };
};
