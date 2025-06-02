import { PomodoroSettings, PomodoroState } from '@vibe-coding-pomodoro/core';
import { create } from 'zustand';

interface TimerStore {
  state: PomodoroState | null;
  settings: PomodoroSettings;
  initialize: () => Promise<void>;
  start: () => void;
  stop: () => void;
  reset: () => void;
  nextSession: () => void;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
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

  initialize: async () => {
    const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
    if (response) {
      set({ state: response.state, settings: response.settings });
    }
  },

  start: () => {
    chrome.runtime.sendMessage({ type: 'START' });
  },

  stop: () => {
    chrome.runtime.sendMessage({ type: 'STOP' });
  },

  reset: () => {
    chrome.runtime.sendMessage({ type: 'RESET' });
  },

  nextSession: () => {
    chrome.runtime.sendMessage({ type: 'NEXT_SESSION' });
  },

  updateSettings: (newSettings) => {
    const { settings } = get();
    const updatedSettings = { ...settings, ...newSettings };
    set({ settings: updatedSettings });
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: updatedSettings });
  },
})); 