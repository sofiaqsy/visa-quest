import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  userService, 
  moodService, 
  progressService, 
  communityService,
  analyticsService
} from '../firebase/services';

// Main Firebase hook
export const useFirebase = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        console.log('VisaQuest: User signed in:', user.uid);
        // Track user login
        analyticsService.trackAction(user.uid, 'user_login');
      }
    });

    // Online/offline listener
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Anonymous sign in
  const signInUser = async () => {
    try {
      setLoading(true);
      const result = await signInAnonymously(auth);
      console.log('VisaQuest: Anonymous sign in successful');
      return result.user;
    } catch (error) {
      console.error('VisaQuest: Sign in error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isOnline,
    signInUser
  };
};

// User data hook
export const useUserData = () => {
  const { user } = useFirebase();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Save user profile
  const saveProfile = async (profileData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await userService.saveUserProfile(user.uid, profileData);
      if (success) {
        setUserProfile(prev => ({ ...prev, ...profileData }));
        // Track profile update
        analyticsService.trackAction(user.uid, 'profile_updated', profileData);
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  // Load user profile
  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const profile = await userService.getUserProfile(user.uid);
      setUserProfile(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  // Create initial profile
  const createProfile = async (profileData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await userService.createUserProfile(user.uid, {
        ...profileData,
        userId: user.uid
      });
      if (success) {
        setUserProfile({ userId: user.uid, ...profileData });
        // Track new user
        analyticsService.trackAction(user.uid, 'user_registered', profileData);
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !userProfile) {
      loadProfile();
    }
  }, [user, userProfile]);

  return {
    userProfile,
    loading,
    saveProfile,
    loadProfile,
    createProfile
  };
};

// Mood tracking hook
export const useMoodTracking = () => {
  const { user } = useFirebase();
  const [todayMood, setTodayMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save daily mood
  const saveMood = async (moodData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await moodService.saveDailyMood(user.uid, moodData);
      if (success) {
        setTodayMood(moodData);
        // Track mood
        analyticsService.trackAction(user.uid, 'mood_recorded', { mood: moodData.mood });
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  // Load today's mood
  const loadTodayMood = async () => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const mood = await moodService.getTodayMood(user.uid);
      setTodayMood(mood);
      return mood;
    } finally {
      setLoading(false);
    }
  };

  // Load mood history
  const loadMoodHistory = async (days = 30) => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const history = await moodService.getMoodHistory(user.uid, days);
      setMoodHistory(history);
      return history;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTodayMood();
      loadMoodHistory();
    }
  }, [user]);

  return {
    todayMood,
    moodHistory,
    loading,
    saveMood,
    loadTodayMood,
    loadMoodHistory
  };
};

// Progress tracking hook
export const useProgress = () => {
  const { user } = useFirebase();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [overallProgress, setOverallProgress] = useState(null);
  const [loading, setLoading] = useState(false);

  // Complete a task
  const completeTask = async (taskData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await progressService.completeTask(user.uid, taskData);
      if (success) {
        setCompletedTasks(prev => [taskData, ...prev]);
        // Track task completion
        analyticsService.trackAction(user.uid, 'task_completed', {
          taskId: taskData.id,
          week: taskData.week,
          day: taskData.day
        });
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  // Update overall progress
  const updateProgress = async (progressData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await progressService.updateProgress(user.uid, progressData);
      if (success) {
        setOverallProgress(prev => ({ ...prev, ...progressData }));
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  // Load user progress
  const loadProgress = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const tasks = await progressService.getUserProgress(user.uid);
      setCompletedTasks(tasks);
      return tasks;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  return {
    completedTasks,
    overallProgress,
    loading,
    completeTask,
    updateProgress,
    loadProgress
  };
};

// Community hook
export const useCommunity = () => {
  const { user } = useFirebase();
  const [successStories, setSuccessStories] = useState([]);
  const [communityPosts, setCommunityPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add success story
  const addSuccessStory = async (storyData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await communityService.addSuccessStory(user.uid, storyData);
      if (success) {
        // Track success story
        analyticsService.trackAction(user.uid, 'success_story_shared');
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  // Add community post
  const addPost = async (postData) => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await communityService.addCommunityPost(user.uid, postData);
      if (success) {
        // Track community engagement
        analyticsService.trackAction(user.uid, 'community_post_created');
      }
      return success;
    } finally {
      setLoading(false);
    }
  };

  // Load success stories
  const loadSuccessStories = async () => {
    setLoading(true);
    try {
      const stories = await communityService.getSuccessStories();
      setSuccessStories(stories);
      return stories;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuccessStories();
  }, []);

  return {
    successStories,
    communityPosts,
    loading,
    addSuccessStory,
    addPost,
    loadSuccessStories
  };
};

// Offline sync hook
export const useOfflineSync = () => {
  const { user, isOnline } = useFirebase();
  const [pendingActions, setPendingActions] = useState([]);

  // Queue action for later sync
  const queueAction = (action) => {
    setPendingActions(prev => [...prev, {
      ...action,
      id: Date.now(),
      timestamp: new Date().toISOString()
    }]);
    
    // Store in localStorage as backup
    const stored = localStorage.getItem('visa-quest-offline-actions') || '[]';
    const actions = JSON.parse(stored);
    localStorage.setItem('visa-quest-offline-actions', JSON.stringify([...actions, action]));
  };

  // Sync pending actions when online
  const syncPendingActions = async () => {
    if (!isOnline || !user || pendingActions.length === 0) return;

    console.log('VisaQuest: Syncing', pendingActions.length, 'pending actions');
    
    for (const action of pendingActions) {
      try {
        // Process each action based on its type
        switch (action.type) {
          case 'mood':
            await moodService.saveDailyMood(user.uid, action.data);
            break;
          case 'task':
            await progressService.completeTask(user.uid, action.data);
            break;
          case 'profile':
            await userService.saveUserProfile(user.uid, action.data);
            break;
          default:
            console.log('VisaQuest: Unknown action type:', action.type);
        }
      } catch (error) {
        console.error('VisaQuest: Error syncing action:', error);
      }
    }

    // Clear pending actions
    setPendingActions([]);
    localStorage.removeItem('visa-quest-offline-actions');
  };

  // Load pending actions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('visa-quest-offline-actions');
    if (stored) {
      try {
        const actions = JSON.parse(stored);
        setPendingActions(actions);
      } catch (error) {
        console.error('VisaQuest: Error loading offline actions:', error);
      }
    }
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && user && pendingActions.length > 0) {
      syncPendingActions();
    }
  }, [isOnline, user, pendingActions.length]);

  return {
    pendingActions,
    queueAction,
    syncPendingActions,
    isOnline
  };
};