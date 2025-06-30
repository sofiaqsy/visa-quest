import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration
// IMPORTANTE: Estas son variables públicas, es seguro incluirlas en el código
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "visa-quest-app.firebaseapp.com",
  projectId: "visa-quest-app", 
  storageBucket: "visa-quest-app.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX"
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

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment these lines if you want to use Firebase emulators
  // connectFirestoreEmulator(db, 'localhost', 8080);
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

// Push notification helpers
export const requestNotificationToken = async () => {
  if (!messaging) return null;
  
  try {
    const token = await getToken(messaging, {
      vapidKey: 'YOUR_VAPID_KEY_HERE' // You'll get this from Firebase Console
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