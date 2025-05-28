export interface PomodoroSettings {
  focusTime: number; // 분 단위
  shortBreakTime: number; // 분 단위
  longBreakTime: number; // 분 단위
  sessionsBeforeLongBreak: number;
}

export interface PomodoroState {
  isRunning: boolean;
  currentSession: 'focus' | 'shortBreak' | 'longBreak';
  timeRemaining: number; // 초 단위
  completedSessions: number;
  totalFocusTime: number; // 초 단위
  settings: PomodoroSettings;
}

type StateChangeListener = (state: PomodoroState) => void;

export class PomodoroTimer {
  private state: PomodoroState;
  private timerId: NodeJS.Timeout | null = null;
  private listeners: StateChangeListener[] = [];
  private lastTickTime: number = 0;

  constructor(settings: PomodoroSettings) {
    this.state = {
      isRunning: false,
      currentSession: 'focus',
      timeRemaining: settings.focusTime * 60,
      completedSessions: 0,
      totalFocusTime: 0,
      settings,
    };
  }

  private notifyListeners() {
    const stateCopy = { ...this.state };
    this.listeners.forEach((listener) => listener(stateCopy));
  }

  private tick = () => {
    if (!this.state.isRunning) return;

    const now = Date.now();
    const elapsed = Math.floor((now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    if (elapsed > 0) {
      const newTimeRemaining = Math.max(0, this.state.timeRemaining - elapsed);
      this.state.timeRemaining = newTimeRemaining;

      if (this.state.isRunning && this.state.currentSession === 'focus') {
        this.state.totalFocusTime += elapsed;
      }

      this.notifyListeners();

      if (newTimeRemaining === 0) {
        this.nextSession();
      }
    }
  };

  start() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.lastTickTime = Date.now();
    this.notifyListeners();

    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(this.tick, 100);
  }

  stop() {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.notifyListeners();
  }

  reset() {
    this.stop();
    this.state = {
      isRunning: false,
      currentSession: 'focus',
      timeRemaining: this.state.settings.focusTime * 60,
      completedSessions: 0,
      totalFocusTime: 0,
      settings: this.state.settings,
    };
    this.notifyListeners();
  }

  nextSession() {
    this.stop();

    if (this.state.currentSession === 'focus') {
      this.state.completedSessions++;
      const shouldTakeLongBreak =
        this.state.completedSessions %
          this.state.settings.sessionsBeforeLongBreak ===
        0;

      this.state.currentSession = shouldTakeLongBreak
        ? 'longBreak'
        : 'shortBreak';
      this.state.timeRemaining =
        (shouldTakeLongBreak
          ? this.state.settings.longBreakTime
          : this.state.settings.shortBreakTime) * 60;
    } else {
      this.state.currentSession = 'focus';
      this.state.timeRemaining = this.state.settings.focusTime * 60;
    }

    this.notifyListeners();
  }

  updateSettings(settings: PomodoroSettings) {
    this.state.settings = settings;
    if (!this.state.isRunning) {
      this.state.timeRemaining =
        this.state.currentSession === 'focus'
          ? settings.focusTime * 60
          : this.state.currentSession === 'longBreak'
          ? settings.longBreakTime * 60
          : settings.shortBreakTime * 60;
    }
    this.notifyListeners();
  }

  onChange(listener: StateChangeListener) {
    this.listeners.push(listener);
    listener({ ...this.state });
  }

  getState(): PomodoroState {
    return { ...this.state };
  }

  destroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.listeners = [];
  }
}
