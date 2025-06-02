import { DEFAULT_SETTINGS, PomodoroEvents, PomodoroSettings, PomodoroState } from './types';

export class PomodoroTimer {
  private state: PomodoroState;
  private timerId: number | null = null;
  private events: PomodoroEvents = {};

  constructor(settings: Partial<PomodoroSettings> = {}, events: PomodoroEvents = {}) {
    this.events = events;
    this.state = this.createInitialState(settings);
  }

  private createInitialState(settings: Partial<PomodoroSettings>): PomodoroState {
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
    return {
      isRunning: false,
      currentSession: 'focus',
      timeRemaining: mergedSettings.focusTime * 60,
      completedSessions: 0,
      totalFocusTime: 0,
      settings: mergedSettings,
      lastTickTime: Date.now(),
    };
  }

  private notifyListeners() {
    const stateCopy = { ...this.state };
    this.events.onStateChange?.(stateCopy);
    this.events.onTick?.(stateCopy);
  }

  private tick = () => {
    if (!this.state.isRunning) return;

    const now = Date.now();
    const elapsed = Math.floor((now - this.state.lastTickTime) / 1000);
    
    if (elapsed > 0) {
      this.state.lastTickTime = now;
      const newTimeRemaining = Math.max(0, this.state.timeRemaining - elapsed);
      this.state.timeRemaining = newTimeRemaining;

      if (this.state.currentSession === 'focus') {
        this.state.totalFocusTime += elapsed;
      }

      this.notifyListeners();

      if (newTimeRemaining === 0) {
        this.events.onSessionComplete?.(this.state.currentSession);
        this.nextSession();
      }
    }
  };

  start() {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.lastTickTime = Date.now();
    this.notifyListeners();

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }
    this.timerId = window.setInterval(this.tick, 100);
  }

  stop() {
    if (!this.state.isRunning) return;

    this.state.isRunning = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.notifyListeners();
  }

  reset() {
    this.stop();
    this.state = this.createInitialState(this.state.settings);
    this.notifyListeners();
  }

  nextSession() {
    this.stop();

    if (this.state.currentSession === 'focus') {
      this.state.completedSessions++;
      const shouldTakeLongBreak =
        this.state.completedSessions % this.state.settings.sessionsBeforeLongBreak === 0;

      this.state.currentSession = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
      this.state.timeRemaining =
        (shouldTakeLongBreak
          ? this.state.settings.longBreakTime
          : this.state.settings.shortBreakTime) * 60;

      if (this.state.settings.autoStartBreaks) {
        this.start();
      }
    } else {
      this.state.currentSession = 'focus';
      this.state.timeRemaining = this.state.settings.focusTime * 60;

      if (this.state.settings.autoStartPomodoros) {
        this.start();
      }
    }

    this.notifyListeners();
  }

  updateSettings(settings: Partial<PomodoroSettings>) {
    const oldSettings = { ...this.state.settings };
    this.state.settings = { ...this.state.settings, ...settings };
    this.events.onSettingsUpdate?.(this.state.settings);

    if (!this.state.isRunning) {
      this.state.timeRemaining =
        this.state.currentSession === 'focus'
          ? this.state.settings.focusTime * 60
          : this.state.currentSession === 'longBreak'
          ? this.state.settings.longBreakTime * 60
          : this.state.settings.shortBreakTime * 60;
    }

    this.notifyListeners();
  }

  getState(): PomodoroState {
    return { ...this.state };
  }

  destroy() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    this.events = {};
  }
} 