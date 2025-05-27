class PomodoroTimer {
  constructor() {
    this.state = {
      isRunning: false,
      isBreak: false,
      timeLeft: 0,
      totalTime: 0,
      completedSessions: 0,
      totalFocusTime: 0,
    };

    this.settings = {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      sessionsBeforeLongBreak: 4,
      soundEnabled: true,
    };

    this.timerInterval = null;
    this.onTick = null;
    this.onComplete = null;
    this.onModeChange = null;
  }

  async loadSettings() {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
    await this.resetTimer();
  }

  saveSettings() {
    localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));
  }

  startTimer() {
    if (!this.state.isRunning) {
      this.state.isRunning = true;
      this.timerInterval = setInterval(() => this.tick(), 1000);
    }
  }

  stopTimer() {
    if (this.state.isRunning) {
      this.state.isRunning = false;
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  resetTimer() {
    this.stopTimer();
    this.state.isBreak = false;
    this.state.timeLeft = this.settings.focusTime * 60;
    this.state.totalTime = this.settings.focusTime * 60;
    this.state.completedSessions = 0;
    this.state.totalFocusTime = 0;
    if (this.onTick) this.onTick(this.state);
  }

  nextSession() {
    this.stopTimer();
    this.state.isBreak = !this.state.isBreak;

    if (this.state.isBreak) {
      if (
        this.state.completedSessions % this.settings.sessionsBeforeLongBreak ===
        0
      ) {
        this.state.timeLeft = this.settings.longBreakTime * 60;
        this.state.totalTime = this.settings.longBreakTime * 60;
      } else {
        this.state.timeLeft = this.settings.shortBreakTime * 60;
        this.state.totalTime = this.settings.shortBreakTime * 60;
      }
    } else {
      this.state.timeLeft = this.settings.focusTime * 60;
      this.state.totalTime = this.settings.focusTime * 60;
    }

    if (this.onModeChange) this.onModeChange(this.state);
    if (this.onTick) this.onTick(this.state);
  }

  tick() {
    if (this.state.timeLeft > 0) {
      this.state.timeLeft--;
      if (!this.state.isBreak) {
        this.state.totalFocusTime++;
      }
      if (this.onTick) this.onTick(this.state);
    } else {
      this.stopTimer();
      if (!this.state.isBreak) {
        this.state.completedSessions++;
      }
      if (this.onComplete) this.onComplete(this.state);
      this.nextSession();
    }
  }

  getTimeString() {
    const minutes = Math.floor(this.state.timeLeft / 60);
    const seconds = this.state.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  getProgress() {
    return (
      ((this.state.totalTime - this.state.timeLeft) / this.state.totalTime) *
      100
    );
  }
}
