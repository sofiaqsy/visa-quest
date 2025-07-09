import { useState, useEffect } from 'react';

// Frases motivacionales por mood
const phrasesByMood = {
  bien: [
    "¡Tu energía positiva te llevará lejos! Cada paso cuenta.",
    "Con esa actitud, tu visa está más cerca que nunca.",
    "Tu entusiasmo es contagioso. ¡Sigue así!",
    "La positividad atrae buenos resultados. Tu visa llegará.",
    "¡Qué buena vibra! El universo conspira a tu favor."
  ],
  normal: [
    "Un paso a la vez, sin prisa pero sin pausa.",
    "La constancia es la clave del éxito. Tú puedes.",
    "Cada día es una nueva oportunidad para avanzar.",
    "Roma no se construyó en un día, ni tu visa tampoco.",
    "Mantén el ritmo, lo estás haciendo bien."
  ],
  agobiada: [
    "Respira profundo. Todo proceso tiene su tiempo.",
    "Es normal sentirse así. Descansa y continúa mañana.",
    "Divide las tareas grandes en pequeños pasos.",
    "No estás sola en esto. Vamos juntas.",
    "Un descanso también es parte del progreso."
  ],
  confundida: [
    "La claridad llega paso a paso. No te presiones.",
    "Cada pregunta tiene su respuesta. Las encontrarás.",
    "Es normal tener dudas. Eso significa que estás aprendiendo.",
    "Tómate tu tiempo para entender. No hay prisa.",
    "La confusión es el primer paso hacia la comprensión."
  ],
  ansiosa: [
    "Inhala calma, exhala preocupación. Todo saldrá bien.",
    "Un día a la vez. No te adelantes al futuro.",
    "Tu ansiedad no define tu capacidad. Eres capaz.",
    "Enfócate en el presente. El futuro se construye hoy.",
    "La ansiedad es energía. Úsala para avanzar con calma."
  ]
};

// Default phrases if mood not found
const defaultPhrases = [
  "Cada paso te acerca a tu meta.",
  "Tu determinación es tu mayor fortaleza.",
  "El camino puede ser largo, pero vale la pena.",
  "Confía en el proceso y en ti misma.",
  "Tu visa es un sueño que se hará realidad."
];

export const useDailyPhrases = (userMood = 'normal') => {
  const [phrases, setPhrases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Get phrases for the user's mood
      const moodPhrases = phrasesByMood[userMood] || defaultPhrases;
      
      // Get today's date as seed for randomization
      const today = new Date().toDateString();
      const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Shuffle phrases deterministically based on date
      const shuffled = [...moodPhrases].sort((a, b) => {
        const aVal = a.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const bVal = b.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return ((aVal + seed) % 100) - ((bVal + seed) % 100);
      });
      
      // Take 3 phrases for the day
      setPhrases(shuffled.slice(0, 3));
      setLoading(false);
    } catch (err) {
      console.error('Error getting daily phrases:', err);
      setError(err);
      setPhrases(defaultPhrases.slice(0, 3));
      setLoading(false);
    }
  }, [userMood]);

  return { phrases, loading, error };
};
