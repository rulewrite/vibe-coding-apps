import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let timerInterval: NodeJS.Timeout | undefined;
let timeLeft: number = 25 * 60; // 25분
let isRunning: boolean = false;

export function activate(context: vscode.ExtensionContext) {
  // 상태바 아이템 생성
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarItem.command = 'vibe-coding-pomodoro-timer.startTimer';
  context.subscriptions.push(statusBarItem);

  // 타이머 시작 명령어
  let startTimer = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.startTimer',
    () => {
      if (!isRunning) {
        isRunning = true;
        updateStatusBar();
        timerInterval = setInterval(() => {
          timeLeft--;
          updateStatusBar();
          if (timeLeft <= 0) {
            stopTimer();
            vscode.window.showInformationMessage(
              '뽀모도로 세션이 종료되었습니다! 휴식을 취하세요.'
            );
          }
        }, 1000);
      }
    }
  );

  // 타이머 정지 명령어
  let stopTimer = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.stopTimer',
    () => {
      stopTimer();
    }
  );

  // 타이머 리셋 명령어
  let resetTimer = vscode.commands.registerCommand(
    'vibe-coding-pomodoro-timer.resetTimer',
    () => {
      stopTimer();
      timeLeft = 25 * 60;
      updateStatusBar();
    }
  );

  context.subscriptions.push(startTimer, stopTimer, resetTimer);
  updateStatusBar();
}

function stopTimer() {
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

  statusBarItem.text = isRunning
    ? `$(clock) ${timeString}`
    : `$(play) ${timeString}`;

  statusBarItem.tooltip = isRunning
    ? '뽀모도로 타이머 실행 중 (클릭하여 정지)'
    : '뽀모도로 타이머 시작하기';

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
