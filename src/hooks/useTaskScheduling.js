// Custom hook for task scheduling and sound integration
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import soundManager from '../utils/soundManager';
import scheduleManager from '../utils/scheduleManager';
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

  // Initialize user schedule
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const initSchedule = async () => {
      try {
        const userSchedule = await scheduleManager.getUserSchedule(currentUser.uid);
        setSchedule(userSchedule);
      } catch (error) {
        console.error('Error loading schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    initSchedule();
  }, [currentUser]);

  // Subscribe to scheduled tasks
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'scheduledTasks'),
      where('userId', '==', currentUser.uid),
      where('status', 'in', ['pending', 'reminder_sent']),
      orderBy('scheduledTime', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = [];
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      setScheduledTasks(tasks);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Schedule a task
  const scheduleTask = useCallback(async (task, scheduledTime = null) => {
    if (!currentUser || !schedule) return null;

    try {
      // Get optimal time if not provided
      const taskTime = scheduledTime || 
        scheduleManager.getOptimalTaskTime(task.category, schedule)?.date ||
        new Date();

      // Create scheduled task document
      const scheduledTaskRef = doc(collection(db, 'scheduledTasks'));
      const scheduledTask = {
        ...task,
        userId: currentUser.uid,
        scheduledTime: Timestamp.fromDate(taskTime),
        status: 'pending',
        createdAt: serverTimestamp(),
        soundEnabled: schedule.notifications.sound,
        notificationEnabled: schedule.notifications.enabled
      };

      await setDoc(scheduledTaskRef, scheduledTask);

      // Schedule notification
      if (schedule.notifications.enabled) {
        await scheduleManager.scheduleNotification(
          currentUser.uid, 
          { ...task, scheduledTime: taskTime, id: scheduledTaskRef.id },
          schedule
        );
      }

      // Play scheduling sound
      if (soundSettings.enabled) {
        await soundManager.playSound('focus');
      }

      return scheduledTaskRef.id;
    } catch (error) {
      console.error('Error scheduling task:', error);
      return null;
    }
  }, [currentUser, schedule, soundSettings]);

  // Complete a scheduled task
  const completeScheduledTask = useCallback(async (taskId) => {
    if (!currentUser) return false;

    try {
      const taskRef = doc(db, 'scheduledTasks', taskId);
      
      await updateDoc(taskRef, {
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // Play completion sound
      if (soundSettings.enabled) {
        await soundManager.playTaskComplete();
      }

      // Update user stats
      const statsRef = doc(db, 'userStats', currentUser.uid);
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
          userId: currentUser.uid
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
    if (!currentUser || !schedule) return false;

    try {
      const taskRef = doc(db, 'scheduledTasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) return false;

      await updateDoc(taskRef, {
        scheduledTime: Timestamp.fromDate(newTime),
        rescheduledAt: serverTimestamp(),
        status: 'pending'
      });

      // Reschedule notification
      const task = taskDoc.data();
      await scheduleManager.scheduleNotification(
        currentUser.uid,
        { ...task, scheduledTime: newTime, id: taskId },
        schedule
      );

      // Play reschedule sound
      if (soundSettings.enabled) {
        await soundManager.playSound('taskReminder');
      }

      return true;
    } catch (error) {
      console.error('Error rescheduling task:', error);
      return false;
    }
  }, [currentUser, schedule, soundSettings]);

  // Update schedule preferences
  const updateSchedule = useCallback(async (updates) => {
    if (!currentUser) return false;

    try {
      const success = await scheduleManager.updateUserSchedule(currentUser.uid, updates);
      
      if (success) {
        const updatedSchedule = await scheduleManager.getUserSchedule(currentUser.uid);
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
      const taskTime = task.scheduledTime.toDate();
      return taskTime >= today && taskTime < tomorrow;
    });
  }, [scheduledTasks]);

  // Check if in focus mode
  const isInFocusMode = useCallback(() => {
    if (!schedule) return false;
    return scheduleManager.isInFocusMode(schedule);
  }, [schedule]);

  // Check if it's break time
  const isBreakTime = useCallback(() => {
    if (!schedule) return null;
    return scheduleManager.isBreakTime(schedule);
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
