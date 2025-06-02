import { PomodoroSettings, PomodoroState, PomodoroTimer } from '@vibe-coding-pomodoro/core';
import { create } from 'zustand';

interface TimerStore {
  timer: PomodoroTimer | null;
  state: PomodoroState | null;
  settings: PomodoroSettings;
  initialize: () => void;
  start: () => void;
  stop: () => void;
  reset: () => void;
  nextSession: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timer: null,
  state: null,
  settings: {
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    notifications: true,
  },

  initialize: () => {
    const { timer, settings } = get();
    if (timer) return;

    const newTimer = new PomodoroTimer(settings, {
      onStateChange: (state) => {
        set({ state });
      },
      onSessionComplete: (sessionType) => {
        if (settings.notifications) {
          const title = sessionType === 'focus' ? '휴식 시간입니다!' : '뽀모도로를 시작해볼까요?';
          const body = sessionType === 'focus' 
            ? '잠시 휴식을 취하고 다시 시작해보세요.'
            : '새로운 뽀모도로 세션을 시작해보세요.';
          
          new Notification(title, { body });
        }
      },
    });

    set({ timer: newTimer, state: newTimer.getState() });
  },

  start: () => {
    const { timer } = get();
    timer?.start();
  },

  stop: () => {
    const { timer } = get();
    timer?.stop();
  },

  reset: () => {
    const { timer } = get();
    timer?.reset();
  },

  nextSession: () => {
    const { timer } = get();
    timer?.nextSession();
  },

  updateSettings: (newSettings) => {
    const { timer, settings } = get();
    const updatedSettings = { ...settings, ...newSettings };
    set({ settings: updatedSettings });
    timer?.updateSettings(updatedSettings);
  },
})); 