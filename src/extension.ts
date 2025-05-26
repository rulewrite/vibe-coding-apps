import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let timerInterval: NodeJS.Timeout | undefined;
let timeLeft: number = 25 * 60; // 기본 25분
let isRunning: boolean = false;
let isBreak: boolean = false;

// 타이머 설정
const TIMER_SETTINGS = {
  FOCUS_TIME: 25 * 60, // 집중 시간: 25분
  SHORT_BREAK: 5 * 60, // 짧은 휴식: 5분
  LONG_BREAK: 15 * 60, // 긴 휴식: 15분
  SESSIONS_BEFORE_LONG_BREAK: 4, // 긴 휴식 전 필요한 세션 수
};

let completedSessions: number = 0;

export function activate(context: vscode.ExtensionContext) {
  // 상태바 아이템 생성
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'vibe-coding-pomodoro-timer.startTimer';
  context.subscriptions.push(statusBarItem);

  // 타이머 시작 명령어
  let startTimerCommand = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.startTimer',
    () => {
      if (!isRunning) {
        isRunning = true;
        updateStatusBar();
        timerInterval = setInterval(() => {
          timeLeft--;
          updateStatusBar();
          if (timeLeft <= 0) {
            handleTimerComplete();
          }
        }, 1000);
      }
    }
  );

  // 타이머 정지 명령어
  let stopTimerCommand = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.stopTimer',
    () => {
      handleStopTimer();
    }
  );

  // 타이머 리셋 명령어
  let resetTimerCommand = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.resetTimer',
    () => {
      handleStopTimer();
      resetToFocusTime();
      updateStatusBar();
    }
  );

  // 다음 세션으로 이동 명령어 추가
  let nextSessionCommand = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.nextSession',
    () => {
      handleStopTimer();
      if (isBreak) {
        resetToFocusTime();
      } else {
        if (
          completedSessions % TIMER_SETTINGS.SESSIONS_BEFORE_LONG_BREAK ===
          0
        ) {
          startLongBreak();
        } else {
          startShortBreak();
        }
      }
      updateStatusBar();
    }
  );

  context.subscriptions.push(
    startTimerCommand,
    stopTimerCommand,
    resetTimerCommand,
    nextSessionCommand
  );
  updateStatusBar();
}

function handleTimerComplete() {
  handleStopTimer();
  if (!isBreak) {
    completedSessions++;
    if (completedSessions % TIMER_SETTINGS.SESSIONS_BEFORE_LONG_BREAK === 0) {
      vscode.window.showInformationMessage(
        '집중 시간이 종료되었습니다! 긴 휴식 시간을 시작합니다.'
      );
      startLongBreak();
    } else {
      vscode.window.showInformationMessage(
        '집중 시간이 종료되었습니다! 짧은 휴식 시간을 시작합니다.'
      );
      startShortBreak();
    }
  } else {
    vscode.window.showInformationMessage(
      '휴식 시간이 종료되었습니다! 다시 집중 시간을 시작합니다.'
    );
    resetToFocusTime();
  }
  updateStatusBar();
}

function startShortBreak() {
  isBreak = true;
  timeLeft = TIMER_SETTINGS.SHORT_BREAK;
}

function startLongBreak() {
  isBreak = true;
  timeLeft = TIMER_SETTINGS.LONG_BREAK;
}

function resetToFocusTime() {
  isBreak = false;
  timeLeft = TIMER_SETTINGS.FOCUS_TIME;
}

function handleStopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = undefined;
  }
  isRunning = false;
  updateStatusBar();
}

function updateStatusBar() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  const icon = isBreak ? '$(coffee)' : '$(clock)';
  const prefix = isBreak ? '휴식' : '집중';

  statusBarItem.text = isRunning
    ? `${icon} ${prefix} ${timeString}`
    : `$(play) ${prefix} ${timeString}`;

  statusBarItem.tooltip = isRunning
    ? `${prefix} 시간 실행 중 (클릭하여 정지)`
    : `${prefix} 시간 시작하기`;

  statusBarItem.command = isRunning
    ? 'vibe-coding-pomodoro-timer.stopTimer'
    : 'vibe-coding-pomodoro-timer.startTimer';

  statusBarItem.show();
}

export function deactivate() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
