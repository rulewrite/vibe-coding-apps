export interface TimerSettings {
  focusTime: number;
  shortBreakTime: number;
  longBreakTime: number;
  sessionsBeforeLongBreak: number;
  soundEnabled: boolean;
}

export interface TimerState {
  isRunning: boolean;
  isBreak: boolean;
  timeLeft: number;
  totalTime: number;
  completedSessions: number;
  totalFocusTime: number;
}

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
