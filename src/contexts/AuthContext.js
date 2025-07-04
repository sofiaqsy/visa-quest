import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  signInAnonymously
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { userService } from '../firebase/services';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError('');
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Create user profile in Firestore
      await userService.createUserProfile(user.uid, {
        email: user.email,
        displayName,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError('');
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setError('');
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create it
      const profile = await userService.getUserProfile(user.uid);
      if (!profile) {
        await userService.createUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString()
        });
      }
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Continue as guest (anonymous auth)
  const continueAsGuest = async () => {
    try {
      setError('');
      const { user } = await signInAnonymously(auth);
      setIsGuest(true);
      
      // Store guest status in localStorage
      localStorage.setItem('visa-quest-guest-mode', 'true');
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setIsGuest(false);
      localStorage.removeItem('visa-quest-guest-mode');
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Check if user is guest
      if (user && user.isAnonymous) {
        setIsGuest(true);
      } else {
        setIsGuest(localStorage.getItem('visa-quest-guest-mode') === 'true');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isGuest,
    signup,
    login,
    signInWithGoogle,
    continueAsGuest,
    logout,
    resetPassword,
    error,
    setError
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
