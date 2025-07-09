import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const { continueAsGuest, error, setError } = useAuth();
  const navigate = useNavigate();

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
        <h1 className="auth-title">🇨🇦 VisaQuest</h1>
        <h2>Tu guía gamificada para obtener tu visa</h2>
        <p className="auth-subtitle">
          Convierte el proceso de visa en una aventura paso a paso
        </p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-emoji">🎮</span>
            <span>Sistema gamificado con logros</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">📱</span>
            <span>Funciona sin conexión</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">🏆</span>
            <span>Motivación diaria personalizada</span>
          </div>
          <div className="feature-item">
            <span className="feature-emoji">💾</span>
            <span>Tu progreso se guarda automáticamente</span>
          </div>
        </div>

        <button 
          onClick={handleGuestMode}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Iniciando...' : 'Comenzar mi viaje'}
        </button>

        <div className="guest-info">
          <p className="text-xs text-gray-500 text-center mt-4">
            💡 No necesitas crear cuenta. Tu progreso se guarda en este dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
