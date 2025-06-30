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
  onSnapshot,
  setDoc,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Generate a unique device ID if not exists
const getDeviceId = () => {
  let deviceId = localStorage.getItem('visa-quest-device-id');
  if (!deviceId) {
    // Generate a unique ID for this device
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visa-quest-device-id', deviceId);
  }
  return deviceId;
};

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  const platform = navigator.platform || 'Unknown';
  
  return {
    deviceId: getDeviceId(),
    userAgent: ua,
    platform: platform,
    isMobile: isMobile,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    lastSeen: serverTimestamp()
  };
};

// User data management
export const userService = {
  // Create or update user profile
  async saveUserProfile(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true });
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

  // Create anonymous device profile
  async createDeviceProfile(deviceData) {
    try {
      const deviceId = getDeviceId();
      const deviceRef = doc(db, 'devices', deviceId);
      
      await setDoc(deviceRef, {
        ...deviceData,
        ...getDeviceInfo(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log('VisaQuest: Device profile created');
      return deviceId;
    } catch (error) {
      console.error('VisaQuest: Error creating device profile:', error);
      return null;
    }
  },

  // Update device activity
  async updateDeviceActivity() {
    try {
      const deviceId = getDeviceId();
      const deviceRef = doc(db, 'devices', deviceId);
      
      await updateDoc(deviceRef, {
        lastSeen: serverTimestamp(),
        visitCount: increment(1)
      });
    } catch (error) {
      // If document doesn't exist, create it
      await this.createDeviceProfile({});
    }
  }
};

// Mood tracking - Enhanced with device tracking
export const moodService = {
  // Save daily mood
  async saveDailyMood(userId, moodData) {
    try {
      // Determine the ID to use (user ID or device ID)
      const identifier = userId || getDeviceId();
      const isAnonymous = !userId;
      
      const moodRef = collection(db, 'moods');
      const docData = {
        identifier,
        isAnonymous,
        ...moodData,
        date: new Date().toDateString(),
        timestamp: serverTimestamp(),
        deviceInfo: getDeviceInfo()
      };
      
      // If authenticated user, add userId
      if (userId) {
        docData.userId = userId;
      }
      
      await addDoc(moodRef, docData);
      console.log('VisaQuest: Daily mood saved');
      
      // Update user or device profile with latest mood
      if (userId) {
        await userService.saveUserProfile(userId, {
          lastMood: moodData,
          lastMoodDate: new Date().toDateString()
        });
      } else {
        await userService.createDeviceProfile({
          lastMood: moodData,
          lastMoodDate: new Date().toDateString(),
          userName: localStorage.getItem('visa-quest-user-name') || 'Anónimo'
        });
      }
      
      return true;
    } catch (error) {
      console.error('VisaQuest: Error saving mood:', error);
      return false;
    }
  },

  // Get mood history (by user or device)
  async getMoodHistory(userId, days = 30) {
    try {
      const identifier = userId || getDeviceId();
      const moodRef = collection(db, 'moods');
      const q = query(
        moodRef,
        where('identifier', '==', identifier),
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
      const identifier = userId || getDeviceId();
      const today = new Date().toDateString();
      const moodRef = collection(db, 'moods');
      const q = query(
        moodRef,
        where('identifier', '==', identifier),
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
  },

  // Get mood statistics
  async getMoodStats(userId) {
    try {
      const moods = await this.getMoodHistory(userId, 365); // Get last year
      
      if (moods.length === 0) return null;
      
      // Calculate statistics
      const moodCounts = {};
      const moodByWeek = {};
      const currentStreak = this.calculateStreak(moods);
      
      moods.forEach(mood => {
        // Count moods
        moodCounts[mood.mood] = (moodCounts[mood.mood] || 0) + 1;
        
        // Group by week
        const week = new Date(mood.timestamp.toDate()).toISOString().slice(0, 10);
        if (!moodByWeek[week]) moodByWeek[week] = [];
        moodByWeek[week].push(mood);
      });
      
      return {
        totalDays: moods.length,
        moodCounts,
        currentStreak,
        moodByWeek,
        mostCommonMood: Object.keys(moodCounts).reduce((a, b) => 
          moodCounts[a] > moodCounts[b] ? a : b
        )
      };
    } catch (error) {
      console.error('VisaQuest: Error getting mood stats:', error);
      return null;
    }
  },

  // Calculate consecutive days streak
  calculateStreak(moods) {
    if (moods.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toDateString();
    
    // Check if the first mood is from today
    if (moods[0].date !== today) return 0;
    
    // Count consecutive days
    for (let i = 1; i < moods.length; i++) {
      const prevDate = new Date(moods[i-1].date);
      const currDate = new Date(moods[i].date);
      const diffDays = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
};

// Progress and tasks management
export const progressService = {
  // Save task completion
  async completeTask(userId, taskData) {
    try {
      const identifier = userId || getDeviceId();
      const taskRef = collection(db, 'completedTasks');
      await addDoc(taskRef, {
        identifier,
        userId: userId || null,
        ...taskData,
        completedAt: serverTimestamp(),
        deviceInfo: getDeviceInfo()
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
      const identifier = userId || getDeviceId();
      const tasksRef = collection(db, 'completedTasks');
      const q = query(
        tasksRef,
        where('identifier', '==', identifier),
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
      const identifier = userId || getDeviceId();
      const progressRef = doc(db, 'userProgress', identifier);
      await setDoc(progressRef, {
        identifier,
        userId: userId || null,
        ...progressData,
        updatedAt: serverTimestamp(),
        deviceInfo: getDeviceInfo()
      }, { merge: true });
      console.log('VisaQuest: Progress updated');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error updating progress:', error);
      return false;
    }
  },

  // Link anonymous data to user account
  async linkAnonymousDataToUser(userId) {
    try {
      const deviceId = getDeviceId();
      const batch = writeBatch(db);
      
      // Update moods
      const moodsRef = collection(db, 'moods');
      const moodsQuery = query(moodsRef, where('identifier', '==', deviceId));
      const moodsSnapshot = await getDocs(moodsQuery);
      
      moodsSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          userId: userId,
          identifier: userId,
          isAnonymous: false,
          linkedAt: serverTimestamp()
        });
      });
      
      // Update tasks
      const tasksRef = collection(db, 'completedTasks');
      const tasksQuery = query(tasksRef, where('identifier', '==', deviceId));
      const tasksSnapshot = await getDocs(tasksQuery);
      
      tasksSnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          userId: userId,
          identifier: userId,
          linkedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('VisaQuest: Anonymous data linked to user account');
      return true;
    } catch (error) {
      console.error('VisaQuest: Error linking anonymous data:', error);
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
    const identifier = userId || getDeviceId();
    const progressRef = doc(db, 'userProgress', identifier);
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
      const identifier = userId || getDeviceId();
      const actionRef = collection(db, 'userActions');
      await addDoc(actionRef, {
        identifier,
        userId: userId || null,
        action,
        data,
        timestamp: serverTimestamp(),
        deviceInfo: getDeviceInfo()
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
      const identifier = userId || getDeviceId();
      const actionsRef = collection(db, 'userActions');
      const q = query(
        actionsRef,
        where('identifier', '==', identifier),
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
