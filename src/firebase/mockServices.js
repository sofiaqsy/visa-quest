// Simplified services that work with localStorage only
// These will be replaced with Firebase services when ready

// Mock progress service
export const progressService = {
  async completeTask(userId, taskData) {
    try {
      // Save to localStorage for now
      const completedTasks = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
      const taskRecord = {
        ...taskData,
        userId: userId || 'anonymous',
        completedAt: new Date().toISOString()
      };
      completedTasks.push(taskRecord);
      localStorage.setItem('visa-quest-completed-tasks', JSON.stringify(completedTasks));
      
      console.log('Task completed:', taskRecord);
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      return false;
    }
  },

  async getUserProgress(userId) {
    try {
      const completedTasks = JSON.parse(localStorage.getItem('visa-quest-completed-tasks') || '[]');
      return completedTasks.filter(task => task.userId === userId || task.userId === 'anonymous');
    } catch (error) {
      console.error('Error getting progress:', error);
      return [];
    }
  },

  async updateProgress(userId, progressData) {
    try {
      const key = `visa-quest-progress-${userId || 'anonymous'}`;
      localStorage.setItem(key, JSON.stringify({
        ...progressData,
        updatedAt: new Date().toISOString()
      }));
      return true;
    } catch (error) {
      console.error('Error updating progress:', error);
      return false;
    }
  }
};

// Mock mood service
export const moodService = {
  async saveDailyMood(userId, moodData) {
    try {
      const moodRecord = {
        ...moodData,
        userId: userId || 'anonymous',
        date: new Date().toDateString(),
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('visa-quest-daily-mood', JSON.stringify(moodRecord));
      
      // Also save to mood history
      const moodHistory = JSON.parse(localStorage.getItem('visa-quest-mood-history') || '[]');
      moodHistory.push(moodRecord);
      localStorage.setItem('visa-quest-mood-history', JSON.stringify(moodHistory));
      
      console.log('Mood saved:', moodRecord);
      return true;
    } catch (error) {
      console.error('Error saving mood:', error);
      return false;
    }
  },

  async getTodayMood(userId) {
    try {
      const savedMood = localStorage.getItem('visa-quest-daily-mood');
      if (!savedMood) return null;
      
      const moodData = JSON.parse(savedMood);
      const today = new Date().toDateString();
      
      if (moodData.date === today) {
        return moodData;
      }
      return null;
    } catch (error) {
      console.error('Error getting today mood:', error);
      return null;
    }
  },

  async getMoodHistory(userId, days = 30) {
    try {
      const moodHistory = JSON.parse(localStorage.getItem('visa-quest-mood-history') || '[]');
      return moodHistory
        .filter(mood => mood.userId === userId || mood.userId === 'anonymous')
        .slice(-days);
    } catch (error) {
      console.error('Error getting mood history:', error);
      return [];
    }
  }
};

// Mock user service
export const userService = {
  async saveUserProfile(userId, userData) {
    try {
      const key = `visa-quest-user-${userId || 'anonymous'}`;
      localStorage.setItem(key, JSON.stringify({
        ...userData,
        updatedAt: new Date().toISOString()
      }));
      console.log('User profile saved');
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  },

  async getUserProfile(userId) {
    try {
      const key = `visa-quest-user-${userId || 'anonymous'}`;
      const profile = localStorage.getItem(key);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
};

// Mock analytics service
export const analyticsService = {
  async trackAction(userId, action, data = {}) {
    try {
      console.log('Analytics:', action, data);
      
      // Save to localStorage for debugging
      const analytics = JSON.parse(localStorage.getItem('visa-quest-analytics') || '[]');
      analytics.push({
        userId: userId || 'anonymous',
        action,
        data,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 100 events
      if (analytics.length > 100) {
        analytics.splice(0, analytics.length - 100);
      }
      
      localStorage.setItem('visa-quest-analytics', JSON.stringify(analytics));
      return true;
    } catch (error) {
      console.error('Error tracking action:', error);
      return false;
    }
  }
};

// Mock community service
export const communityService = {
  async addSuccessStory(userId, storyData) {
    console.log('Success story would be saved:', storyData);
    return true;
  },

  async getSuccessStories(limit = 10) {
    // Return some mock success stories
    return [
      {
        id: '1',
        title: '¡Mi visa fue aprobada!',
        content: 'Después de seguir todos los pasos de VisaQuest, mi visa fue aprobada en solo 2 semanas.',
        country: 'Canada',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

// Mock realtime service
export const realtimeService = {
  subscribeToProgress(userId, callback) {
    // Return a mock unsubscribe function
    return () => {};
  },

  subscribeToCommunity(callback) {
    // Return a mock unsubscribe function
    return () => {};
  }
};
