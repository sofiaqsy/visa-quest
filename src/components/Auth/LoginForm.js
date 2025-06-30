import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, signInWithGoogle, continueAsGuest, error, setError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setLoading(true);
    setError('');
    
    try {
      await continueAsGuest();
      navigate('/');
    } catch (error) {
      console.error('Guest mode error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Inicia sesión para continuar tu viaje' 
            : 'Comienza tu camino hacia el éxito'}
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="displayName">Nombre completo</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {isLogin && (
            <div className="forgot-password">
              <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isLogin ? 'Iniciar sesión' : 'Crear cuenta')}
          </button>
        </form>

        <div className="divider">
          <span>o continúa con</span>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="btn-google"
          disabled={loading}
        >
          <img src="/google-icon.svg" alt="Google" />
          Continuar con Google
        </button>

        <button 
          onClick={handleGuestMode}
          className="btn-guest"
          disabled={loading}
        >
          <span className="guest-icon">👤</span>
          Continuar sin cuenta
        </button>

        <p className="auth-switch">
          {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="link-button"
            disabled={loading}
          >
            {isLogin ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>

        <div className="guest-info">
          <p className="text-xs text-gray-500 text-center mt-4">
            💡 Puedes usar la app sin crear cuenta, pero tu progreso solo se guardará en este dispositivo
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
