import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - VisaQuest App
const firebaseConfig = {
  apiKey: "AIzaSyDy8bg1yC1FhBX6AF34CHOgk_noqMZpPjU",
  authDomain: "visa-quest-app.firebaseapp.com",
  projectId: "visa-quest-app",
  storageBucket: "visa-quest-app.firebasestorage.app",
  messagingSenderId: "294633942380",
  appId: "1:294633942380:web:198bdec3c5b18ccb789749",
  measurementId: "G-7PG9EBXT83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics (only in production)
export let analytics = null;
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  analytics = getAnalytics(app);
}

// Initialize Cloud Messaging (for push notifications)
export let messaging = null;
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.log('Messaging not supported in this browser');
  }
}

// Push notification helpers
export const requestNotificationToken = async () => {
  if (!messaging) return null;
  
  try {
    // You'll need to add VAPID key from Firebase Console → Cloud Messaging
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY_HERE' // We'll configure this in the next step
    });
    console.log('VisaQuest: FCM token:', token);
    return token;
  } catch (error) {
    console.error('VisaQuest: Error getting FCM token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    
    onMessage(messaging, (payload) => {
      console.log('VisaQuest: Foreground message received:', payload);
      resolve(payload);
    });
  });

export default app;
