// Schedule Configuration for VisaQuest
// Manages user preferences for task scheduling and notifications

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

class ScheduleManager {
  constructor() {
    this.defaultSchedule = {
      // Working hours preferences
      workingHours: {
        start: '09:00',
        end: '18:00',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      
      // Break times
      breaks: {
        lunch: {
          start: '12:00',
          end: '13:00',
          enabled: true
        },
        morning: {
          time: '10:30',
          duration: 15, // minutes
          enabled: true
        },
        afternoon: {
          time: '15:30',
          duration: 15,
          enabled: true
        }
      },
      
      // Task notification preferences
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
        
        // Reminder times before task
        reminderTimes: [15, 5], // minutes
        
        // Daily summary
        dailySummary: {
          enabled: true,
          time: '08:00'
        },
        
        // Weekly review
        weeklyReview: {
          enabled: true,
          day: 0, // Sunday
          time: '19:00'
        }
      },
      
      // Time preferences for different task types
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
      
      // Focus mode settings
      focusMode: {
        enabled: false,
        sessions: [
          {
            name: 'Morning Focus',
            start: '09:00',
            end: '11:00',
            days: [1, 2, 3, 4, 5] // Monday to Friday
          },
          {
            name: 'Afternoon Focus',
            start: '14:00',
            end: '16:00',
            days: [1, 2, 3, 4, 5]
          }
        ]
      },
      
      // Weekend mode
      weekendMode: {
        enabled: true,
        reducedNotifications: true,
        taskLimit: 5
      }
    };
  }

  // Initialize schedule for new user
  async initializeUserSchedule(userId) {
    try {
      const scheduleRef = doc(db, 'schedules', userId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (!scheduleDoc.exists()) {
        await setDoc(scheduleRef, {
          ...this.defaultSchedule,
          userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        return this.defaultSchedule;
      }
      
      return scheduleDoc.data();
    } catch (error) {
      console.error('Error initializing schedule:', error);
      return this.defaultSchedule;
    }
  }

  // Get user schedule
  async getUserSchedule(userId) {
    try {
      const scheduleRef = doc(db, 'schedules', userId);
      const scheduleDoc = await getDoc(scheduleRef);
      
      if (scheduleDoc.exists()) {
        return scheduleDoc.data();
      }
      
      return await this.initializeUserSchedule(userId);
    } catch (error) {
      console.error('Error getting schedule:', error);
      return this.defaultSchedule;
    }
  }

  // Update user schedule
  async updateUserSchedule(userId, updates) {
    try {
      const scheduleRef = doc(db, 'schedules', userId);
      
      await updateDoc(scheduleRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return false;
    }
  }

  // Check if current time is in working hours
  isWorkingHours(schedule) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return currentTime >= schedule.workingHours.start && 
           currentTime <= schedule.workingHours.end;
  }

  // Check if current time is in break
  isBreakTime(schedule) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check lunch break
    if (schedule.breaks.lunch.enabled &&
        currentTime >= schedule.breaks.lunch.start &&
        currentTime <= schedule.breaks.lunch.end) {
      return 'lunch';
    }
    
    // Check other breaks
    for (const [breakName, breakConfig] of Object.entries(schedule.breaks)) {
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
  }

  // Check if in focus mode
  isInFocusMode(schedule) {
    if (!schedule.focusMode.enabled) return false;
    
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    for (const session of schedule.focusMode.sessions) {
      if (session.days.includes(currentDay) &&
          currentTime >= session.start &&
          currentTime <= session.end) {
        return session.name;
      }
    }
    
    return false;
  }

  // Get next reminder time for a task
  getNextReminder(taskTime, schedule) {
    const reminders = [];
    const taskDate = new Date(taskTime);
    
    for (const minutesBefore of schedule.notifications.reminderTimes) {
      const reminderTime = new Date(taskDate);
      reminderTime.setMinutes(reminderTime.getMinutes() - minutesBefore);
      
      if (reminderTime > new Date()) {
        reminders.push({
          time: reminderTime,
          minutesBefore
        });
      }
    }
    
    return reminders.sort((a, b) => a.time - b.time)[0] || null;
  }

  // Get optimal task time based on preferences
  getOptimalTaskTime(taskCategory, schedule) {
    const preferences = schedule.taskPreferences[taskCategory];
    if (!preferences) return null;
    
    const now = new Date();
    const timeSlots = [];
    
    // Generate time slots for the next 7 days
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      
      for (const timePreference of preferences.preferredTimes) {
        const slot = this.getTimeSlotForPreference(timePreference, date, schedule);
        if (slot) {
          timeSlots.push(slot);
        }
      }
    }
    
    // Sort by proximity and preference
    return timeSlots.sort((a, b) => {
      // Prefer today over future days
      const dayDiff = a.date.getDate() - b.date.getDate();
      if (dayDiff !== 0) return dayDiff;
      
      // Then by time
      return a.date - b.date;
    })[0];
  }

  // Convert time preference to actual time slot
  getTimeSlotForPreference(preference, date, schedule) {
    const slots = {
      morning: { start: '06:00', end: '09:00' },
      work_hours: { 
        start: schedule.workingHours.start, 
        end: schedule.workingHours.end 
      },
      lunch_break: { 
        start: schedule.breaks.lunch.start, 
        end: schedule.breaks.lunch.end 
      },
      afternoon: { start: '13:00', end: '18:00' },
      evening: { start: '18:00', end: '21:00' },
      night: { start: '21:00', end: '23:00' },
      weekend: { start: '10:00', end: '17:00' }
    };
    
    const slot = slots[preference];
    if (!slot) return null;
    
    // Check if it's weekend preference on a weekday
    if (preference === 'weekend' && date.getDay() !== 0 && date.getDay() !== 6) {
      return null;
    }
    
    const slotDate = new Date(date);
    const [hours, minutes] = slot.start.split(':');
    slotDate.setHours(parseInt(hours), parseInt(minutes), 0);
    
    return {
      date: slotDate,
      preference,
      duration: 30 // Default task duration in minutes
    };
  }

  // Schedule a notification
  async scheduleNotification(userId, task, schedule) {
    if (!schedule.notifications.enabled) return null;
    
    try {
      const reminder = this.getNextReminder(task.scheduledTime, schedule);
      if (!reminder) return null;
      
      // Store notification in Firebase for the service worker to pick up
      const notificationRef = doc(db, 'notifications', `${userId}_${task.id}_${reminder.time.getTime()}`);
      
      await setDoc(notificationRef, {
        userId,
        taskId: task.id,
        taskTitle: task.title,
        scheduledTime: reminder.time,
        minutesBefore: reminder.minutesBefore,
        type: 'task_reminder',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      return reminder;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }
}

// Create singleton instance
const scheduleManager = new ScheduleManager();

export default scheduleManager;
