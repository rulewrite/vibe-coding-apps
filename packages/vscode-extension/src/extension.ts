import { PomodoroSettings, PomodoroState, PomodoroTimer } from '@vibe-coding-pomodoro/core';
import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
let timer: PomodoroTimer | null = null;
let state: PomodoroState | null = null;

export function activate(context: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  context.subscriptions.push(statusBarItem);

  const settings = getSettings();
  initializeTimer(settings);

  context.subscriptions.push(
    vscode.commands.registerCommand('vibe-coding-pomodoro.start', () => {
      timer?.start();
    }),
    vscode.commands.registerCommand('vibe-coding-pomodoro.stop', () => {
      timer?.stop();
    }),
    vscode.commands.registerCommand('vibe-coding-pomodoro.reset', () => {
      timer?.reset();
    }),
    vscode.commands.registerCommand('vibe-coding-pomodoro.nextSession', () => {
      timer?.nextSession();
    }),
    vscode.commands.registerCommand('vibe-coding-pomodoro.openSettings', () => {
      vscode.commands.executeCommand(
        'workbench.action.openSettings',
        'vibe-coding-pomodoro'
      );
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('vibe-coding-pomodoro')) {
        const newSettings = getSettings();
        timer?.updateSettings(newSettings);
      }
    })
  );
}

function getSettings(): PomodoroSettings {
  const config = vscode.workspace.getConfiguration('vibe-coding-pomodoro');
  return {
    focusTime: config.get('focusTime') ?? 25,
    shortBreakTime: config.get('shortBreakTime') ?? 5,
    longBreakTime: config.get('longBreakTime') ?? 15,
    sessionsBeforeLongBreak: config.get('sessionsBeforeLongBreak') ?? 4,
    autoStartBreaks: config.get('autoStartBreaks') ?? true,
    autoStartPomodoros: config.get('autoStartPomodoros') ?? true,
    notifications: config.get('notifications') ?? true,
  };
}

function initializeTimer(settings: PomodoroSettings) {
  timer = new PomodoroTimer(settings, {
    onStateChange: (newState) => {
      state = newState;
      updateStatusBar(newState);
    },
    onSessionComplete: (sessionType) => {
      if (settings.notifications) {
        const title = sessionType === 'focus' ? '휴식 시간입니다!' : '뽀모도로를 시작해볼까요?';
        const body = sessionType === 'focus' 
          ? '잠시 휴식을 취하고 다시 시작해보세요.'
          : '새로운 뽀모도로 세션을 시작해보세요.';
        
        vscode.window.showInformationMessage(body, { title });
      }
    },
  });

  state = timer.getState();
  updateStatusBar(state);
}

function updateStatusBar(state: PomodoroState) {
  const minutes = Math.ceil(state.timeRemaining / 60);
  const sessionType = state.currentSession === 'focus' ? '🍅' : '☕';
  const status = state.isRunning ? '▶' : '⏸';
  
  statusBarItem.text = `${sessionType} ${status} ${minutes}분`;
  statusBarItem.tooltip = `${state.currentSession === 'focus' ? '뽀모도로' : '휴식'} - ${state.completedSessions}회 완료`;
  statusBarItem.show();
}

export function deactivate() {
  timer?.destroy();
  statusBarItem.dispose();
} 