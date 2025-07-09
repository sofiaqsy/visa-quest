// Re-export from App.js to maintain compatibility
export { AuthContext, useAuth } from '../App';

// Mock AuthProvider for compatibility
export const AuthProvider = ({ children }) => children;
