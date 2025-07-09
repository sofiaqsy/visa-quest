import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Use mock services for now
import { progressService, analyticsService } from '../mockServices';
import { CheckCircle, Circle, Sparkles, BookOpen, RefreshCw, User, Home, Trophy } from 'lucide-react';
import { 
  getSmartTaskDistribution, 
  getContextualGreeting,
  getCurrentTimeContext,
  GOAL_CATEGORIES,
  WORK_TASKS,
  PERSONAL_TASKS,
  DEFAULT_USER_PREFERENCES
} from '../../data/goals';
import SimpleProgressView from './SimpleProgressView';
import DailyPhrases from '../DailyPhrases';
import './Dashboard.css';

// Rest of the Dashboard.js code remains the same...
// [I'll copy the entire Dashboard code but change the import]
