import React from 'react';
import { useDailyPhrases } from '../hooks/useDailyPhrases';
import { RefreshCw, Heart, Sparkles } from 'lucide-react';

function DailyPhrases({ userMood = 'esperanzado' }) {
  const { phrases, loading, error } = useDailyPhrases(userMood);
  const [currentPhraseIndex, setCurrentPhraseIndex] = React.useState(0);
  
  const nextPhrase = () => {
    setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin text-indigo-600" size={32} />
        <span className="ml-3 text-gray-600">Cargando frases inspiradoras...</span>
      </div>
    );
  }
  
  if (error) {
    console.error('Error loading phrases:', error);
  }
  
  if (!phrases || phrases.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sparkles className="text-indigo-600 mr-2" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">
            Tu frase del día
          </h3>
        </div>
        <span className="text-sm text-gray-500">
          Mood: {userMood}
        </span>
      </div>
      
      <div className="relative">
        <p className="text-gray-700 text-lg leading-relaxed mb-4 min-h-[80px]">
          "{phrases[currentPhraseIndex]}"
        </p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={nextPhrase}
            className="flex items-center text-indigo-600 hover:text-indigo-700 transition-colors"
            disabled={phrases.length <= 1}
          >
            <RefreshCw size={18} className="mr-1" />
            <span className="text-sm">Siguiente frase</span>
          </button>
          
          <div className="flex items-center text-gray-400">
            <Heart size={16} className="mr-1" />
            <span className="text-xs">
              {currentPhraseIndex + 1} de {phrases.length}
            </span>
          </div>
        </div>
      </div>
      
      {!error && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Frases actualizadas diariamente a las 6 AM 🌅
          </p>
        </div>
      )}
    </div>
  );
}

export default DailyPhrases;