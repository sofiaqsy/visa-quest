import React, { useState } from 'react';
import './MoodCheck.css';

const MoodCheck = ({ userName = 'Amiga', onMoodComplete }) => {
  const [selectedMood, setSelectedMood] = useState(null);

  const moods = [
    {
      id: 'bien',
      emoji: '😊',
      label: 'Bien',
      message: '¡Qué bueno! Aprovechemos esa energía positiva'
    },
    {
      id: 'normal',
      emoji: '😐',
      label: 'Normal',
      message: 'Perfecto, vamos paso a paso sin presión'
    },
    {
      id: 'agobiada',
      emoji: '😰',
      label: 'Agobiada',
      message: 'Te entiendo, hagamos esto juntas sin estrés'
    },
    {
      id: 'confundida',
      emoji: '🤔',
      label: 'Confundida',
      message: 'No te preocupes, te voy a guiar en todo'
    },
    {
      id: 'ansiosa',
      emoji: '😥',
      label: 'Ansiosa',
      message: 'Respira hondo, vamos a organizarlo todo juntas'
    }
  ];

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood.id);
    
    // Save mood to localStorage with date
    const moodData = {
      mood: mood.id,
      message: mood.message,
      date: new Date().toDateString()
    };
    localStorage.setItem('visa-quest-daily-mood', JSON.stringify(moodData));
    
    // Call the completion handler after a short delay
    setTimeout(() => {
      if (onMoodComplete) {
        onMoodComplete();
      }
    }, 500);
  };

  return (
    <div className="mood-check-container">
      <div className="mood-check-content">
        <div className="mood-header">
          <span className="mood-emoji">😊</span>
          <h1>¡Hola {userName}!</h1>
          <p className="mood-subtitle">Antes de empezar el día, me gustaría saber...</p>
        </div>

        <h2 className="mood-question">¿Cómo te sientes hoy con el tema de tu visa?</h2>

        <div className="mood-options">
          {moods.map((mood) => (
            <button
              key={mood.id}
              className={`mood-option ${selectedMood === mood.id ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
            >
              <span className="mood-option-emoji">{mood.emoji}</span>
              <div className="mood-option-content">
                <h3>{mood.label}</h3>
                <p>{mood.message}</p>
              </div>
            </button>
          ))}
        </div>

        <p className="mood-footer">
          💡 Esta información me ayuda a personalizar tu experiencia de hoy
        </p>
      </div>
    </div>
  );
};

export default MoodCheck;
