// Sound Manager for VisaQuest
// Manages task sounds and notifications

// Sound library using Web Audio API and Tone.js
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.7;
    
    // Initialize on first user interaction
    this.initialized = false;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.playSound = this.playSound.bind(this);
  }

  async init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      
      // Load settings from localStorage
      const settings = localStorage.getItem('visa-quest-sound-settings');
      if (settings) {
        const { enabled, volume } = JSON.parse(settings);
        this.enabled = enabled !== false;
        this.volume = volume || 0.7;
      }
      
      // Preload sounds
      await this.preloadSounds();
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async preloadSounds() {
    // Define sound configurations
    this.soundConfigs = {
      taskComplete: {
        frequency: 800,
        duration: 0.2,
        type: 'success',
        melody: [800, 1000, 1200]
      },
      taskReminder: {
        frequency: 600,
        duration: 0.3,
        type: 'notification',
        melody: [600, 500, 600]
      },
      achievement: {
        frequency: 1000,
        duration: 0.5,
        type: 'celebration',
        melody: [500, 600, 700, 800, 1000, 1200]
      },
      morning: {
        frequency: 400,
        duration: 1,
        type: 'ambient',
        melody: [400, 500, 600, 500]
      },
      focus: {
        frequency: 440,
        duration: 0.1,
        type: 'ping',
        melody: [440]
      },
      break: {
        frequency: 300,
        duration: 0.8,
        type: 'chime',
        melody: [300, 400, 300]
      }
    };
  }

  createOscillator(frequency, startTime, duration) {
    if (!this.audioContext) return null;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
    
    return oscillator;
  }

  async playSound(soundType) {
    if (!this.enabled || !this.initialized) {
      if (!this.initialized) await this.init();
      if (!this.enabled) return;
    }
    
    const config = this.soundConfigs[soundType];
    if (!config) return;
    
    try {
      const now = this.audioContext.currentTime;
      const { melody, duration } = config;
      
      melody.forEach((freq, index) => {
        const startTime = now + (index * duration * 0.8);
        this.createOscillator(freq, startTime, duration);
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  // Play task completion sound with haptic feedback
  async playTaskComplete() {
    await this.playSound('taskComplete');
    
    // Vibration API for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  // Play reminder sound
  async playReminder() {
    await this.playSound('taskReminder');
    
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }

  // Play achievement sound
  async playAchievement() {
    await this.playSound('achievement');
    
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200]);
    }
  }

  // Play time-based ambient sounds
  async playTimeBasedSound(timeContext) {
    const soundMap = {
      morning: 'morning',
      work_hours: 'focus',
      lunch_break: 'break',
      afternoon: 'focus',
      evening: 'break',
      night: 'break',
      weekend: 'morning'
    };
    
    const soundType = soundMap[timeContext];
    if (soundType) {
      await this.playSound(soundType);
    }
  }

  // Settings management
  setEnabled(enabled) {
    this.enabled = enabled;
    this.saveSettings();
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  saveSettings() {
    localStorage.setItem('visa-quest-sound-settings', JSON.stringify({
      enabled: this.enabled,
      volume: this.volume
    }));
  }

  // Get current settings
  getSettings() {
    return {
      enabled: this.enabled,
      volume: this.volume
    };
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Auto-initialize on user interaction
if (typeof window !== 'undefined') {
  ['click', 'touchstart'].forEach(event => {
    window.addEventListener(event, () => {
      soundManager.init();
    }, { once: true });
  });
}

export default soundManager;
