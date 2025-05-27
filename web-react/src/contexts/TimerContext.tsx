import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  PomodoroSettings,
  PomodoroState,
  PomodoroTimer,
} from '../../../pomodoro-core';

const defaultSettings: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
};

// 싱글톤 인스턴스 생성
const timer = new PomodoroTimer(defaultSettings);

interface TimerContextType {
  state: PomodoroState;
  start: () => void;
  stop: () => void;
  reset: () => void;
  nextSession: () => void;
  updateSettings: (settings: PomodoroSettings) => void;
}

const TimerContext = createContext<TimerContextType>({
  state: timer.getState(),
  start: () => {},
  stop: () => {},
  reset: () => {},
  nextSession: () => {},
  updateSettings: () => {},
});

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<PomodoroState>(timer.getState());

  useEffect(() => {
    const listener = (newState: PomodoroState) => {
      setState(newState);
    };
    timer.onChange(listener);
    return () => {
      // TODO: 추후 offChange 메서드 추가 시 구독 해제
    };
  }, []);

  const start = () => timer.start();
  const stop = () => timer.stop();
  const reset = () => timer.reset();
  const nextSession = () => timer.nextSession();
  const updateSettings = (settings: PomodoroSettings) =>
    timer.updateSettings(settings);

  return (
    <TimerContext.Provider
      value={{ state, start, stop, reset, nextSession, updateSettings }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);
