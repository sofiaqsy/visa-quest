import { useState, useEffect } from 'react';
import { database } from '../config/firebase';
import { ref, onValue, get } from 'firebase/database';

export const useDailyPhrases = (mood) => {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!mood) {
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const phrasesRef = ref(database, `daily-phrases/${today}/phrases/${mood}`);
    
    // Intentar obtener datos en tiempo real
    const unsubscribe = onValue(phrasesRef, 
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setPhrases(Array.isArray(data) ? data : Object.values(data));
        } else {
          // Si no hay frases para hoy, usar frases por defecto
          setPhrases(getDefaultPhrases(mood));
        }
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching phrases:', error);
        setError(error.message);
        // En caso de error, usar frases por defecto
        setPhrases(getDefaultPhrases(mood));
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [mood]);
  
  return { phrases, loading, error };
};

// Frases por defecto en caso de que Firebase no esté disponible
const getDefaultPhrases = (mood) => {
  const defaultPhrases = {
    ansioso: [
      'La ansiedad es temporal, tu determinación es permanente 💪',
      'Cada día de espera es un día menos para tu visa 📅',
      'Respira profundo, tu proceso avanza aunque no lo veas 🌟'
    ],
    esperanzado: [
      'Tu esperanza ilumina el camino hacia tu destino ✈️',
      'Hoy es un gran día para recibir buenas noticias 📧',
      'La esperanza es el motor que mueve tu proceso 🚀'
    ],
    frustrado: [
      'La frustración de hoy es la historia de superación de mañana 📖',
      'Es normal sentir frustración, es señal de que te importa 💝',
      'Cada "no" te acerca más al "sí" definitivo 🗝️'
    ],
    optimista: [
      'Tu optimismo está acelerando el universo a tu favor 🌈',
      '¡Esa actitud positiva es tu mejor carta de presentación! ⭐',
      'Los optimistas como tú escriben las mejores historias de éxito 📝'
    ],
    cansado: [
      'El cansancio es la medalla de los valientes 🏅',
      'Descansa, los grandes viajes requieren pausas estratégicas 🛌',
      'Tu cansancio es prueba de tu esfuerzo, no de debilidad 💜'
    ],
    determinado: [
      'Tu determinación está moviendo montañas burocráticas 🏔️',
      'Esa determinación tuya es imparable, igual que tu visa 🎯',
      'Los determinados como tú siempre encuentran el camino 🛤️'
    ]
  };
  
  return defaultPhrases[mood] || defaultPhrases.esperanzado;
};

export default useDailyPhrases;