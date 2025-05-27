export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusTime: number; // 분 단위
  shortBreakTime: number; // 분 단위
  longBreakTime: number; // 분 단위
  sessionsBeforeLongBreak: number;
}

export interface PomodoroState {
  mode: PomodoroMode;
  timeLeft: number; // 초 단위
  isRunning: boolean;
  completedSessions: number;
  totalFocusTime: number; // 초 단위
}

type PomodoroListener = (state: PomodoroState) => void;

export class PomodoroTimer {
  private settings: PomodoroSettings;
  private state: PomodoroState;
  private timerId: NodeJS.Timeout | null = null;
  private listeners: PomodoroListener[] = [];

  constructor(settings: PomodoroSettings) {
    this.settings = settings;
    this.state = {
      mode: 'focus',
      timeLeft: settings.focusTime * 60,
      isRunning: false,
      completedSessions: 0,
      totalFocusTime: 0,
    };
  }

  getState(): PomodoroState {
    return { ...this.state };
  }

  updateSettings(settings: PomodoroSettings) {
    this.settings = settings;
    // 현재 세션이 진행 중이 아니면 즉시 반영
    if (!this.state.isRunning) {
      this.reset();
    }
  }

  onChange(listener: PomodoroListener) {
    this.listeners.push(listener);
  }

  private emit() {
    this.listeners.forEach((fn) => fn(this.getState()));
  }

  start() {
    if (this.state.isRunning) return;
    this.state.isRunning = true;
    this.emit();
    this.timerId = setInterval(() => this.tick(), 1000);
  }

  stop() {
    if (!this.state.isRunning) return;
    this.state.isRunning = false;
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    this.emit();
  }

  reset() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    this.state = {
      ...this.state,
      isRunning: false,
      timeLeft: this.getSessionTime(this.state.mode),
    };
    this.emit();
  }

  nextSession() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = null;
    const next = this.getNextMode();
    this.state = {
      ...this.state,
      mode: next,
      isRunning: false,
      timeLeft: this.getSessionTime(next),
    };
    this.emit();
  }

  private tick() {
    if (this.state.timeLeft > 0) {
      this.state.timeLeft -= 1;
      if (this.state.mode === 'focus') {
        this.state.totalFocusTime += 1;
      }
      this.emit();
    } else {
      // 세션 완료 처리
      if (this.state.mode === 'focus') {
        this.state.completedSessions += 1;
      }
      const next = this.getNextMode();
      this.state = {
        ...this.state,
        mode: next,
        isRunning: false,
        timeLeft: this.getSessionTime(next),
      };
      this.emit();
      if (this.timerId) clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private getSessionTime(mode: PomodoroMode): number {
    switch (mode) {
      case 'focus':
        return this.settings.focusTime * 60;
      case 'shortBreak':
        return this.settings.shortBreakTime * 60;
      case 'longBreak':
        return this.settings.longBreakTime * 60;
    }
  }

  private getNextMode(): PomodoroMode {
    if (this.state.mode === 'focus') {
      // 긴 휴식 조건
      if (
        (this.state.completedSessions + 1) %
          this.settings.sessionsBeforeLongBreak ===
        0
      ) {
        return 'longBreak';
      }
      return 'shortBreak';
    }
    return 'focus';
  }
}
