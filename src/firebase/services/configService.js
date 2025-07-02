import { db } from '../firebase';
import { 
  doc, 
  collection, 
  getDoc, 
  setDoc, 
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  GOAL_CATEGORIES, 
  TIME_CONTEXTS, 
  PRIORITY_LEVELS,
  CATEGORY_SCHEDULES,
  CONTEXTUAL_TIPS,
  SPECIAL_TASKS,
  DEFAULT_USER_PREFERENCES,
  GAMIFICATION,
  ACHIEVEMENTS
} from '../../config/config';
import { WORK_TASKS, PERSONAL_TASKS, MICRO_TASKS } from '../../data/goals';

// Configuration service for managing app configuration in Firebase
export const configService = {
  // Initialize configuration in Firebase (run once)
  async initializeConfiguration() {
    try {
      const configRef = doc(db, 'configuration', 'app_config');
      const configDoc = await getDoc(configRef);
      
      if (!configDoc.exists()) {
        console.log('Initializing app configuration in Firebase...');
        
        // Upload complete configuration
        await setDoc(configRef, {
          goalCategories: GOAL_CATEGORIES,
          timeContexts: TIME_CONTEXTS,
          priorityLevels: PRIORITY_LEVELS,
          categorySchedules: CATEGORY_SCHEDULES,
          contextualTips: CONTEXTUAL_TIPS,
          specialTasks: SPECIAL_TASKS,
          gamification: GAMIFICATION,
          achievements: ACHIEVEMENTS,
          lastUpdated: serverTimestamp(),
          version: '1.0.0'
        });
        
        console.log('Configuration initialized successfully');
      }
      
      return true;
    } catch (error) {
      console.error('Error initializing configuration:', error);
      return false;
    }
  },

  // Get configuration from Firebase
  async getConfiguration() {
    try {
      const configRef = doc(db, 'configuration', 'app_config');
      const configDoc = await getDoc(configRef);
      
      if (configDoc.exists()) {
        return configDoc.data();
      }
      
      // If not exists, initialize and return defaults
      await this.initializeConfiguration();
      return {
        goalCategories: GOAL_CATEGORIES,
        timeContexts: TIME_CONTEXTS,
        priorityLevels: PRIORITY_LEVELS,
        categorySchedules: CATEGORY_SCHEDULES,
        contextualTips: CONTEXTUAL_TIPS,
        specialTasks: SPECIAL_TASKS,
        gamification: GAMIFICATION,
        achievements: ACHIEVEMENTS
      };
    } catch (error) {
      console.error('Error getting configuration:', error);
      // Return local defaults on error
      return {
        goalCategories: GOAL_CATEGORIES,
        timeContexts: TIME_CONTEXTS,
        priorityLevels: PRIORITY_LEVELS,
        categorySchedules: CATEGORY_SCHEDULES,
        contextualTips: CONTEXTUAL_TIPS,
        specialTasks: SPECIAL_TASKS,
        gamification: GAMIFICATION,
        achievements: ACHIEVEMENTS
      };
    }
  },

  // Update specific configuration
  async updateConfiguration(configType, data) {
    try {
      const configRef = doc(db, 'configuration', 'app_config');
      await updateDoc(configRef, {
        [configType]: data,
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating configuration:', error);
      return false;
    }
  }
};

// Tasks service for managing tasks templates in Firebase
export const tasksService = {
  // Initialize all tasks in Firebase (run once)
  async initializeTasks() {
    try {
      const tasksRef = collection(db, 'task_templates');
      
      // Check if tasks already exist
      const existingTasks = await getDocs(tasksRef);
      if (!existingTasks.empty) {
        console.log('Tasks already initialized');
        return true;
      }
      
      console.log('Initializing tasks in Firebase...');
      
      // Combine all tasks
      const allTasks = [
        ...WORK_TASKS,
        ...PERSONAL_TASKS,
        ...MICRO_TASKS
      ];
      
      // Upload each task
      for (const task of allTasks) {
        await setDoc(doc(tasksRef, task.id), {
          ...task,
          createdAt: serverTimestamp(),
          lastUpdated: serverTimestamp()
        });
      }
      
      console.log(`Initialized ${allTasks.length} tasks successfully`);
      return true;
    } catch (error) {
      console.error('Error initializing tasks:', error);
      return false;
    }
  },

  // Get all tasks from Firebase
  async getAllTasks() {
    try {
      const tasksRef = collection(db, 'task_templates');
      const snapshot = await getDocs(tasksRef);
      
      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks:', error);
      // Return local defaults on error
      return [...WORK_TASKS, ...PERSONAL_TASKS, ...MICRO_TASKS];
    }
  },

  // Get tasks by category
  async getTasksByCategory(category) {
    try {
      const tasksRef = collection(db, 'task_templates');
      const q = query(tasksRef, where('category', '==', category));
      const snapshot = await getDocs(q);
      
      const tasks = [];
      snapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('Error getting tasks by category:', error);
      return [];
    }
  },

  // Add new task template
  async addTaskTemplate(task) {
    try {
      const tasksRef = collection(db, 'task_templates');
      await setDoc(doc(tasksRef, task.id), {
        ...task,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error adding task template:', error);
      return false;
    }
  },

  // Update task template
  async updateTaskTemplate(taskId, updates) {
    try {
      const taskRef = doc(db, 'task_templates', taskId);
      await updateDoc(taskRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating task template:', error);
      return false;
    }
  }
};

// Goals service for managing user goals
export const goalsService = {
  // Get default goals with tasks from Firebase
  async getDefaultGoals() {
    try {
      // Get all tasks first
      const allTasks = await tasksService.getAllTasks();
      
      // Group tasks by category
      const tasksByCategory = allTasks.reduce((acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = [];
        }
        acc[task.category].push(task);
        return acc;
      }, {});
      
      // Create default goals
      const defaultGoals = [
        {
          id: 'visa-canada',
          name: 'Visa Canadá',
          category: GOAL_CATEGORIES.VISA.id,
          active: true,
          tasks: tasksByCategory[GOAL_CATEGORIES.VISA.id] || []
        },
        {
          id: 'work-productivity',
          name: 'Productividad Laboral',
          category: GOAL_CATEGORIES.WORK.id,
          active: true,
          tasks: tasksByCategory[GOAL_CATEGORIES.WORK.id] || []
        },
        {
          id: 'daily-wellness',
          name: 'Bienestar Diario',
          category: GOAL_CATEGORIES.HEALTH.id,
          active: true,
          tasks: tasksByCategory[GOAL_CATEGORIES.HEALTH.id] || []
        },
        {
          id: 'story-telling',
          name: 'Curso Story Telling',
          category: GOAL_CATEGORIES.LEARNING.id,
          active: true,
          tasks: tasksByCategory[GOAL_CATEGORIES.LEARNING.id] || []
        }
      ];
      
      return defaultGoals;
    } catch (error) {
      console.error('Error getting default goals:', error);
      return [];
    }
  },

  // Save user goals
  async saveUserGoals(userId, goals) {
    try {
      const userRef = userId ? doc(db, 'users', userId) : null;
      
      if (userRef) {
        await updateDoc(userRef, {
          activeGoals: goals,
          goalsLastUpdated: serverTimestamp()
        });
      }
      
      // Also save to localStorage for offline access
      localStorage.setItem('visa-quest-active-goals', JSON.stringify(goals));
      
      return true;
    } catch (error) {
      console.error('Error saving user goals:', error);
      // Save to localStorage as fallback
      localStorage.setItem('visa-quest-active-goals', JSON.stringify(goals));
      return false;
    }
  },

  // Get user goals
  async getUserGoals(userId) {
    try {
      // First try Firebase if user is authenticated
      if (userId) {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().activeGoals) {
          return userDoc.data().activeGoals;
        }
      }
      
      // Check localStorage
      const savedGoals = localStorage.getItem('visa-quest-active-goals');
      if (savedGoals) {
        return JSON.parse(savedGoals);
      }
      
      // Return default goals if nothing found
      return await this.getDefaultGoals();
    } catch (error) {
      console.error('Error getting user goals:', error);
      // Try localStorage as fallback
      const savedGoals = localStorage.getItem('visa-quest-active-goals');
      if (savedGoals) {
        return JSON.parse(savedGoals);
      }
      return await this.getDefaultGoals();
    }
  }
};

// Initialize Firebase data (call this once on app start)
export const initializeFirebaseData = async () => {
  try {
    console.log('Initializing Firebase data...');
    
    // Initialize configuration
    await configService.initializeConfiguration();
    
    // Initialize tasks
    await tasksService.initializeTasks();
    
    console.log('Firebase data initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    return false;
  }
};
