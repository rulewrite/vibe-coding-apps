import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { PomodoroSettings, PomodoroState, PomodoroTimer } from '../core';

const defaultSettings: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
};

interface TimerContextType {
  state: PomodoroState;
  start: () => void;
  stop: () => void;
  reset: () => void;
  nextSession: () => void;
  updateSettings: (settings: PomodoroSettings) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const timerRef = useRef<PomodoroTimer | null>(null);
  const [state, setState] = useState<PomodoroState>(() => {
    const timer = new PomodoroTimer(defaultSettings);
    timerRef.current = timer;
    return timer.getState();
  });

  useEffect(() => {
    const timer = timerRef.current;
    if (!timer) return;

    const listener = (newState: PomodoroState) => {
      setState(newState);
    };

    timer.onChange(listener);

    return () => {
      const currentTimer = timerRef.current;
      if (currentTimer) {
        const listeners = (currentTimer as any).listeners;
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }, []);

  const start = useCallback(() => {
    timerRef.current?.start();
  }, []);

  const stop = useCallback(() => {
    timerRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    timerRef.current?.reset();
  }, []);

  const nextSession = useCallback(() => {
    timerRef.current?.nextSession();
  }, []);

  const updateSettings = useCallback((settings: PomodoroSettings) => {
    timerRef.current?.updateSettings(settings);
  }, []);

  const value = useMemo(
    () => ({
      state,
      start,
      stop,
      reset,
      nextSession,
      updateSettings,
    }),
    [state, start, stop, reset, nextSession, updateSettings]
  );

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
