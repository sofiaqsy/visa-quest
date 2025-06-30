import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';

// User data management
export const userService = {
  // Create or update user profile
  async saveUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
      console.log('VisaQuest: User profile saved');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error saving user profile:', error);
      return false;
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        console.log('VisaQuest: No user profile found');
        return null;
      }
    } catch (error) {
      console.error('VisaQuest: Error getting user profile:', error);
      return null;
    }
  },

  // Create initial user profile
  async createUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('VisaQuest: User profile created');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error creating user profile:', error);
      return false;
    }
  }
};

// Mood tracking
export const moodService = {
  // Save daily mood
  async saveDailyMood(userId, moodData) {
    try {
      const moodRef = collection(db, 'moods');
      await addDoc(moodRef, {
        userId,
        ...moodData,
        date: new Date().toDateString(),
        timestamp: serverTimestamp()
      });
      console.log('VisaQuest: Daily mood saved');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error saving mood:', error);
      return false;
    }
  },

  // Get mood history
  async getMoodHistory(userId, days = 30) {
    try {
      const moodRef = collection(db, 'moods');
      const q = query(
        moodRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(days)
      );
      
      const querySnapshot = await getDocs(q);
      const moods = [];
      querySnapshot.forEach((doc) => {
        moods.push({ id: doc.id, ...doc.data() });
      });
      
      return moods;
    } catch (error) {
      console.error('VisaQuest: Error getting mood history:', error);
      return [];
    }
  },

  // Get today's mood
  async getTodayMood(userId) {
    try {
      const today = new Date().toDateString();
      const moodRef = collection(db, 'moods');
      const q = query(
        moodRef,
        where('userId', '==', userId),
        where('date', '==', today)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('VisaQuest: Error getting today mood:', error);
      return null;
    }
  }
};

// Progress and tasks management
export const progressService = {
  // Save task completion
  async completeTask(userId, taskData) {
    try {
      const taskRef = collection(db, 'completedTasks');
      await addDoc(taskRef, {
        userId,
        ...taskData,
        completedAt: serverTimestamp()
      });
      console.log('VisaQuest: Task completed');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error completing task:', error);
      return false;
    }
  },

  // Get user progress
  async getUserProgress(userId) {
    try {
      const tasksRef = collection(db, 'completedTasks');
      const q = query(
        tasksRef,
        where('userId', '==', userId),
        orderBy('completedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      
      return tasks;
    } catch (error) {
      console.error('VisaQuest: Error getting progress:', error);
      return [];
    }
  },

  // Update overall progress
  async updateProgress(userId, progressData) {
    try {
      const progressRef = doc(db, 'userProgress', userId);
      await updateDoc(progressRef, {
        ...progressData,
        updatedAt: serverTimestamp()
      });
      console.log('VisaQuest: Progress updated');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error updating progress:', error);
      return false;
    }
  }
};

// Community features
export const communityService = {
  // Add success story
  async addSuccessStory(userId, storyData) {
    try {
      const storyRef = collection(db, 'successStories');
      await addDoc(storyRef, {
        userId,
        ...storyData,
        createdAt: serverTimestamp(),
        approved: false // Requires moderation
      });
      console.log('VisaQuest: Success story added');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error adding success story:', error);
      return false;
    }
  },

  // Get success stories
  async getSuccessStories(limitCount = 10) {
    try {
      const storiesRef = collection(db, 'successStories');
      const q = query(
        storiesRef,
        where('approved', '==', true),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const stories = [];
      querySnapshot.forEach((doc) => {
        stories.push({ id: doc.id, ...doc.data() });
      });
      
      return stories;
    } catch (error) {
      console.error('VisaQuest: Error getting success stories:', error);
      return [];
    }
  },

  // Add community post
  async addCommunityPost(userId, postData) {
    try {
      const postRef = collection(db, 'communityPosts');
      await addDoc(postRef, {
        userId,
        ...postData,
        createdAt: serverTimestamp(),
        likes: 0,
        replies: 0
      });
      console.log('VisaQuest: Community post added');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error adding community post:', error);
      return false;
    }
  }
};

// Real-time listeners
export const realtimeService = {
  // Listen to user progress changes
  subscribeToProgress(userId, callback) {
    const progressRef = doc(db, 'userProgress', userId);
    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
  },

  // Listen to community updates
  subscribeToCommunity(callback) {
    const communityRef = collection(db, 'communityPosts');
    const q = query(
      communityRef,
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const posts = [];
      querySnapshot.forEach((doc) => {
        posts.push({ id: doc.id, ...doc.data() });
      });
      callback(posts);
    });
  }
};

// Analytics and insights
export const analyticsService = {
  // Track user action
  async trackAction(userId, action, data = {}) {
    try {
      const actionRef = collection(db, 'userActions');
      await addDoc(actionRef, {
        userId,
        action,
        data,
        timestamp: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('VisaQuest: Error tracking action:', error);
      return false;
    }
  },

  // Get user insights
  async getUserInsights(userId) {
    try {
      const actionsRef = collection(db, 'userActions');
      const q = query(
        actionsRef,
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(q);
      const actions = [];
      querySnapshot.forEach((doc) => {
        actions.push({ id: doc.id, ...doc.data() });
      });
      
      return actions;
    } catch (error) {
      console.error('VisaQuest: Error getting insights:', error);
      return [];
    }
  }
};