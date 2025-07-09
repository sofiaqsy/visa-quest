import React, { createContext, useContext, useState, useEffect } from 'react';

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
    console.log('AuthProvider: Initializing...');
    
    // Simulate authentication without Firebase for now
    const initAuth = async () => {
      try {
        // Check if user exists in localStorage
        const savedUserId = localStorage.getItem('visa-quest-user-id');
        
        if (savedUserId) {
          // Simulate user object
          setCurrentUser({
            uid: savedUserId,
            isAnonymous: true
          });
        } else {
          // Create new anonymous user
          const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('visa-quest-user-id', newUserId);
          
          setCurrentUser({
            uid: newUserId,
            isAnonymous: true
          });
        }
        
        console.log('AuthProvider: Auth initialized');
      } catch (error) {
        console.error('AuthProvider: Error initializing auth', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent race conditions
    setTimeout(() => {
      initAuth();
    }, 500);
  }, []);

  // Guest mode (already using anonymous auth)
  const continueAsGuest = async () => {
    try {
      setError('');
      
      // User is already set up in the useEffect
      if (!currentUser) {
        const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('visa-quest-user-id', newUserId);
        
        setCurrentUser({
          uid: newUserId,
          isAnonymous: true
        });
      }
      
      return currentUser;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear all local storage data
      localStorage.removeItem('visa-quest-user-id');
      localStorage.removeItem('visa-quest-user-name');
      localStorage.removeItem('visa-quest-has-seen-welcome');
      localStorage.removeItem('visa-quest-daily-mood');
      localStorage.removeItem('visa-quest-completed-tasks');
      localStorage.removeItem('visa-quest-start-date');
      localStorage.removeItem('visa-quest-active-goals');
      localStorage.removeItem('visa-quest-preferences');
      
      setCurrentUser(null);
      window.location.href = '/';
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
