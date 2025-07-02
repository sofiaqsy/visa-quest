// Firebase service for goals management
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config';

class GoalsService {
  // Initialize user goals in Firebase
  async initializeUserGoals(userId) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      
      const goalsRef = doc(db, 'userGoals', effectiveUserId);
      const goalsDoc = await getDoc(goalsRef);
      
      if (!goalsDoc.exists()) {
        const defaultGoals = {
          userId: effectiveUserId,
          activeGoals: [
            {
              id: 'visa-canada',
              name: 'Visa Canadá',
              category: 'visa',
              active: true,
              startDate: new Date().toISOString(),
              progress: 0
            },
            {
              id: 'work-productivity',
              name: 'Productividad Laboral',
              category: 'work',
              active: true,
              startDate: new Date().toISOString(),
              progress: 0
            },
            {
              id: 'daily-wellness',
              name: 'Bienestar Diario',
              category: 'health',
              active: true,
              startDate: new Date().toISOString(),
              progress: 0
            }
          ],
          preferences: {
            dailyTaskLimit: 6,
            preferredCategories: ['visa', 'work', 'health'],
            notificationTime: '09:00',
            weekendMode: true
          },
          statistics: {
            totalTasksCompleted: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: new Date().toISOString()
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(goalsRef, defaultGoals);
        console.log('Goals initialized in Firebase:', effectiveUserId);
        return defaultGoals;
      }
      
      return goalsDoc.data();
    } catch (error) {
      console.error('Error initializing goals:', error);
      throw error;
    }
  }

  // Get user goals
  async getUserGoals(userId) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const goalsRef = doc(db, 'userGoals', effectiveUserId);
      const goalsDoc = await getDoc(goalsRef);
      
      if (goalsDoc.exists()) {
        return goalsDoc.data();
      }
      
      // If doesn't exist, initialize it
      return await this.initializeUserGoals(userId);
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  }

  // Update user goals
  async updateUserGoals(userId, updates) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const goalsRef = doc(db, 'userGoals', effectiveUserId);
      
      // First check if document exists
      const goalsDoc = await getDoc(goalsRef);
      if (!goalsDoc.exists()) {
        await this.initializeUserGoals(userId);
      }
      
      await updateDoc(goalsRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      console.log('Goals updated in Firebase');
      return true;
    } catch (error) {
      console.error('Error updating goals:', error);
      throw error;
    }
  }

  // Update goal progress
  async updateGoalProgress(userId, goalId, completedTasks) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const goalsRef = doc(db, 'userGoals', effectiveUserId);
      const goalsDoc = await getDoc(goalsRef);
      
      if (goalsDoc.exists()) {
        const data = goalsDoc.data();
        const updatedGoals = data.activeGoals.map(goal => {
          if (goal.id === goalId) {
            return {
              ...goal,
              progress: completedTasks,
              lastUpdated: new Date().toISOString()
            };
          }
          return goal;
        });
        
        await updateDoc(goalsRef, {
          activeGoals: updatedGoals,
          updatedAt: serverTimestamp()
        });
        
        console.log('Goal progress updated:', goalId);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw error;
    }
  }

  // Update user statistics
  async updateUserStatistics(userId, stats) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      const goalsRef = doc(db, 'userGoals', effectiveUserId);
      
      await updateDoc(goalsRef, {
        statistics: stats,
        updatedAt: serverTimestamp()
      });
      
      console.log('User statistics updated');
      return true;
    } catch (error) {
      console.error('Error updating statistics:', error);
      throw error;
    }
  }

  // Get all users' goals (for analytics)
  async getAllUsersGoals() {
    try {
      const goalsCollection = collection(db, 'userGoals');
      const snapshot = await getDocs(goalsCollection);
      
      const allGoals = [];
      snapshot.forEach((doc) => {
        allGoals.push({ id: doc.id, ...doc.data() });
      });
      
      return allGoals;
    } catch (error) {
      console.error('Error getting all users goals:', error);
      return [];
    }
  }

  // Sync local goals with Firebase
  async syncLocalGoals(userId) {
    try {
      const effectiveUserId = userId || `guest_${localStorage.getItem('visa-quest-device-id') || Date.now()}`;
      
      // Get local data
      const localGoals = JSON.parse(localStorage.getItem('visa-quest-active-goals') || '[]');
      const localPreferences = JSON.parse(localStorage.getItem('visa-quest-preferences') || '{}');
      const completedTasks = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
      
      if (localGoals.length > 0) {
        await this.updateUserGoals(effectiveUserId, {
          activeGoals: localGoals,
          preferences: localPreferences,
          'statistics.totalTasksCompleted': completedTasks.length
        });
        
        console.log('Local goals synced to Firebase');
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing local goals:', error);
      return false;
    }
  }
}

// Create singleton instance
const goalsService = new GoalsService();

export default goalsService;
