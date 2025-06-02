export interface PomodoroSettings {
  focusTime: number; // 분 단위
  shortBreakTime: number; // 분 단위
  longBreakTime: number; // 분 단위
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
}

export interface PomodoroState {
  isRunning: boolean;
  currentSession: 'focus' | 'shortBreak' | 'longBreak';
  timeRemaining: number; // 초 단위
  completedSessions: number;
  totalFocusTime: number; // 초 단위
  settings: PomodoroSettings;
  lastTickTime: number;
}

export type SessionType = PomodoroState['currentSession'];

export interface PomodoroEvents {
  onTick?: (state: PomodoroState) => void;
  onSessionComplete?: (sessionType: SessionType) => void;
  onStateChange?: (state: PomodoroState) => void;
  onSettingsUpdate?: (settings: PomodoroSettings) => void;
}

export const DEFAULT_SETTINGS: PomodoroSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: true,
  autoStartPomodoros: true,
  notifications: true,
}; 