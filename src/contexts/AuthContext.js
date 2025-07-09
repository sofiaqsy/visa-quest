import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { 
  signInAnonymously,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthProvider: Auth state changed', user?.uid);
      
      if (!user) {
        // Auto sign in anonymously if no user
        try {
          console.log('AuthProvider: No user, signing in anonymously');
          const result = await signInAnonymously(auth);
          console.log('AuthProvider: Anonymous sign in successful', result.user.uid);
          setCurrentUser(result.user);
        } catch (error) {
          console.error('AuthProvider: Anonymous sign in failed', error);
          setError(error.message);
        }
      } else {
        setCurrentUser(user);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Guest mode (already using anonymous auth)
  const continueAsGuest = async () => {
    try {
      setError('');
      const result = await signInAnonymously(auth);
      setCurrentUser(result.user);
      return result.user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // Clear all local storage data
      localStorage.removeItem('visa-quest-user-name');
      localStorage.removeItem('visa-quest-has-seen-welcome');
      localStorage.removeItem('visa-quest-daily-mood');
      localStorage.removeItem('visa-quest-completed-tasks');
      localStorage.removeItem('visa-quest-start-date');
      localStorage.removeItem('visa-quest-active-goals');
      localStorage.removeItem('visa-quest-preferences');
      
      setCurrentUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Placeholder functions for email auth (not implemented yet)
  const login = async (email, password) => {
    throw new Error('Email login not implemented yet');
  };

  const signup = async (email, password, displayName) => {
    throw new Error('Email signup not implemented yet');
  };

  const signInWithGoogle = async () => {
    throw new Error('Google sign in not implemented yet');
  };

  const value = {
    currentUser,
    loading,
    error,
    setError,
    continueAsGuest,
    signOut,
    login,
    signup,
    signInWithGoogle
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
