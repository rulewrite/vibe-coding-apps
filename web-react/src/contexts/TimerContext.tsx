import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { TimerSettings, TimerState } from '../types/timer';

interface TimerContextType {
  state: TimerState;
  settings: TimerSettings;
  startTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;
  nextSession: () => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

const defaultSettings: TimerSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
};

const initialState: TimerState = {
  isRunning: false,
  isBreak: false,
  timeLeft: defaultSettings.focusTime * 60,
  totalTime: defaultSettings.focusTime * 60,
  completedSessions: 0,
  totalFocusTime: 0,
};

type TimerAction =
  | { type: 'START_TIMER' }
  | { type: 'STOP_TIMER' }
  | { type: 'TICK' }
  | { type: 'RESET_TIMER' }
  | { type: 'NEXT_SESSION' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<TimerSettings> };

const TimerContext = createContext<TimerContextType | undefined>(undefined);

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START_TIMER':
      return { ...state, isRunning: true };
    case 'STOP_TIMER':
      return { ...state, isRunning: false };
    case 'TICK':
      if (state.timeLeft <= 0) return state;
      return {
        ...state,
        timeLeft: state.timeLeft - 1,
        totalFocusTime: state.isBreak
          ? state.totalFocusTime
          : state.totalFocusTime + 1,
      };
    case 'RESET_TIMER':
      return {
        ...initialState,
        timeLeft: defaultSettings.focusTime * 60,
        totalTime: defaultSettings.focusTime * 60,
      };
    case 'NEXT_SESSION':
      const isLongBreak =
        !state.isBreak &&
        (state.completedSessions + 1) %
          defaultSettings.sessionsBeforeLongBreak ===
          0;

      return {
        ...state,
        isBreak: !state.isBreak,
        isRunning: false,
        timeLeft: !state.isBreak
          ? (isLongBreak
              ? defaultSettings.longBreakTime
              : defaultSettings.shortBreakTime) * 60
          : defaultSettings.focusTime * 60,
        totalTime: !state.isBreak
          ? (isLongBreak
              ? defaultSettings.longBreakTime
              : defaultSettings.shortBreakTime) * 60
          : defaultSettings.focusTime * 60,
        completedSessions: state.isBreak
          ? state.completedSessions
          : state.completedSessions + 1,
      };
    default:
      return state;
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);
  const [settings, setSettings] = React.useState<TimerSettings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.isRunning) {
      interval = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.isRunning]);

  useEffect(() => {
    if (state.timeLeft === 0) {
      dispatch({ type: 'NEXT_SESSION' });
      if (settings.soundEnabled) {
        new Audio('/notification.mp3').play().catch(() => {});
      }
    }
  }, [state.timeLeft, settings.soundEnabled]);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(updatedSettings));
  };

  const value = {
    state,
    settings,
    startTimer: () => dispatch({ type: 'START_TIMER' }),
    stopTimer: () => dispatch({ type: 'STOP_TIMER' }),
    resetTimer: () => dispatch({ type: 'RESET_TIMER' }),
    nextSession: () => dispatch({ type: 'NEXT_SESSION' }),
    updateSettings,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
