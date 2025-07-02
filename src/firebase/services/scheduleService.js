// Firebase service for schedule management
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';

class ScheduleService {
  // Initialize user schedule in Firebase
  async initializeUserSchedule(userId) {
    try {
      // Create a proper user ID for both authenticated and guest users
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      
      const scheduleRef = doc(db, 'schedules', effectiveUserId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (!scheduleDoc.exists()) {
        const defaultSchedule = {
          userId: effectiveUserId,
          workingHours: {
            start: '09:00',
            end: '18:00',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          breaks: {
            lunch: {
              start: '12:00',
              end: '13:00',
              enabled: true
            },
            morning: {
              time: '10:30',
              duration: 15,
              enabled: true
            },
            afternoon: {
              time: '15:30',
              duration: 15,
              enabled: true
            }
          },
          notifications: {
            enabled: true,
            sound: true,
            vibration: true,
            reminderTimes: [15, 5],
            dailySummary: {
              enabled: true,
              time: '08:00'
            },
            weeklyReview: {
              enabled: true,
              day: 0,
              time: '19:00'
            }
          },
          taskPreferences: {
            visa: {
              preferredTimes: ['morning', 'evening'],
              maxDaily: 3
            },
            work: {
              preferredTimes: ['work_hours'],
              maxDaily: 5
            },
            personal: {
              preferredTimes: ['evening', 'weekend'],
              maxDaily: 3
            },
            health: {
              preferredTimes: ['morning', 'lunch_break', 'evening'],
              maxDaily: 4
            },
            learning: {
              preferredTimes: ['evening', 'weekend'],
              maxDaily: 2
            }
          },
          focusMode: {
            enabled: false,
            sessions: []
          },
          weekendMode: {
            enabled: true,
            reducedNotifications: true,
            taskLimit: 5
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(scheduleRef, defaultSchedule);
        console.log('Schedule initialized in Firebase:', effectiveUserId);
        return defaultSchedule;
      }
      
      return scheduleDoc.data();
    } catch (error) {
      console.error('Error initializing schedule:', error);
      throw error;
    }
  }

  // Get user schedule
  async getUserSchedule(userId) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const scheduleRef = doc(db, 'schedules', effectiveUserId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (scheduleDoc.exists()) {
        return scheduleDoc.data();
      }
      
      // If doesn't exist, initialize it
      return await this.initializeUserSchedule(userId);
    } catch (error) {
      console.error('Error getting schedule:', error);
      throw error;
    }
  }

  // Update user schedule
  async updateUserSchedule(userId, updates) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const scheduleRef = doc(db, 'schedules', effectiveUserId);
      
      await updateDoc(scheduleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Schedule updated in Firebase');
      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  }

  // Save scheduled task
  async saveScheduledTask(userId, task) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const taskRef = doc(collection(db, 'scheduledTasks'));
      
      const scheduledTask = {
        ...task,
        userId: effectiveUserId,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      await setDoc(taskRef, scheduledTask);
      console.log('Scheduled task saved:', taskRef.id);
      return taskRef.id;
    } catch (error) {
      console.error('Error saving scheduled task:', error);
      throw error;
    }
  }

  // Get scheduled tasks for user
  async getScheduledTasks(userId) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const q = query(
        collection(db, 'scheduledTasks'),
        where('userId', '==', effectiveUserId),
        where('status', 'in', ['pending', 'reminder_sent'])
      );
      
      const snapshot = await getDocs(q);
      const tasks = [];
      
      snapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting scheduled tasks:', error);
      return [];
    }
  }

  // Update scheduled task status
  async updateScheduledTask(taskId, updates) {
    try {
      const taskRef = doc(db, 'scheduledTasks', taskId);
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Scheduled task updated:', taskId);
      return true;
    } catch (error) {
      console.error('Error updating scheduled task:', error);
      throw error;
    }
  }
}

// Create singleton instance
const scheduleService = new ScheduleService();

export default scheduleService;
