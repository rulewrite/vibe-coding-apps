import * as vscode from 'vscode';
import { PomodoroTimer } from '../../pomodoro-core';

// 타이머 인스턴스 생성
const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
};

const timer = new PomodoroTimer(defaultSettings);

// 상태바 아이템 생성
let statusBarItem: vscode.StatusBarItem;
let timerStatusBarItem: vscode.StatusBarItem;

// 설정 불러오기
function loadSettings() {
  const config = vscode.workspace.getConfiguration('pomodoroTimer');
  const settings = {
    focusTime: config.get('focusTime', 25),
    shortBreakTime: config.get('shortBreakTime', 5),
    longBreakTime: config.get('longBreakTime', 15),
    sessionsBeforeLongBreak: config.get('sessionsBeforeLongBreak', 4),
  };
  timer.updateSettings(settings);
}

// 상태바 업데이트
function updateStatusBar(state: any) {
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  let modeText = '';
  switch (state.mode) {
    case 'focus':
      modeText = '🍅 집중';
      break;
    case 'shortBreak':
      modeText = '☕ 짧은 휴식';
      break;
    case 'longBreak':
      modeText = '🌴 긴 휴식';
      break;
  }

  timerStatusBarItem.text = `${modeText} ${timeString}`;
  statusBarItem.text = state.isRunning ? '$(stop) 정지' : '$(play) 시작';
}

// 타이머 완료 알림
function showNotification(state: any) {
  if (state.timeLeft === 0) {
    const title =
      state.mode === 'focus' ? '집중 시간 완료!' : '휴식 시간 완료!';
    const message =
      state.mode === 'focus'
        ? '휴식 시간을 시작합니다.'
        : '다음 집중 시간을 시작합니다.';

    vscode.window.showInformationMessage(message, { title });
  }
}

export function activate(context: vscode.ExtensionContext) {
  // 설정 불러오기
  loadSettings();

  // 상태바 아이템 초기화
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  timerStatusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    101
  );

  statusBarItem.command = 'pomodoroTimer.toggleTimer';
  timerStatusBarItem.command = 'pomodoroTimer.showStatus';

  // 명령 등록
  let startCommand = vscode.commands.registerCommand(
    'pomodoroTimer.start',
    () => {
      timer.start();
    }
  );

  let stopCommand = vscode.commands.registerCommand(
    'pomodoroTimer.stop',
    () => {
      timer.stop();
    }
  );

  let resetCommand = vscode.commands.registerCommand(
    'pomodoroTimer.reset',
    () => {
      timer.reset();
    }
  );

  let nextCommand = vscode.commands.registerCommand(
    'pomodoroTimer.next',
    () => {
      timer.nextSession();
    }
  );

  let toggleCommand = vscode.commands.registerCommand(
    'pomodoroTimer.toggleTimer',
    () => {
      if (timer.getState().isRunning) {
        timer.stop();
      } else {
        timer.start();
      }
    }
  );

  let settingsCommand = vscode.commands.registerCommand(
    'pomodoroTimer.settings',
    async () => {
      const config = vscode.workspace.getConfiguration('pomodoroTimer');
      const focusTime = await vscode.window.showInputBox({
        prompt: '집중 시간 (분)',
        value: config.get('focusTime', 25).toString(),
      });
      if (focusTime) {
        const shortBreakTime = await vscode.window.showInputBox({
          prompt: '짧은 휴식 시간 (분)',
          value: config.get('shortBreakTime', 5).toString(),
        });
        if (shortBreakTime) {
          const longBreakTime = await vscode.window.showInputBox({
            prompt: '긴 휴식 시간 (분)',
            value: config.get('longBreakTime', 15).toString(),
          });
          if (longBreakTime) {
            const sessionsBeforeLongBreak = await vscode.window.showInputBox({
              prompt: '긴 휴식 전 세션 수',
              value: config.get('sessionsBeforeLongBreak', 4).toString(),
            });
            if (sessionsBeforeLongBreak) {
              const settings = {
                focusTime: parseInt(focusTime),
                shortBreakTime: parseInt(shortBreakTime),
                longBreakTime: parseInt(longBreakTime),
                sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreak),
              };
              await config.update('focusTime', settings.focusTime, true);
              await config.update(
                'shortBreakTime',
                settings.shortBreakTime,
                true
              );
              await config.update(
                'longBreakTime',
                settings.longBreakTime,
                true
              );
              await config.update(
                'sessionsBeforeLongBreak',
                settings.sessionsBeforeLongBreak,
                true
              );
              timer.updateSettings(settings);
            }
          }
        }
      }
    }
  );

  let showStatusCommand = vscode.commands.registerCommand(
    'pomodoroTimer.showStatus',
    () => {
      const state = timer.getState();
      const message =
        `현재 모드: ${
          state.mode === 'focus'
            ? '집중'
            : state.mode === 'shortBreak'
            ? '짧은 휴식'
            : '긴 휴식'
        }\n` +
        `남은 시간: ${Math.floor(state.timeLeft / 60)}:${(state.timeLeft % 60)
          .toString()
          .padStart(2, '0')}\n` +
        `완료된 세션: ${state.completedSessions}\n` +
        `총 집중 시간: ${Math.floor(state.totalFocusTime / 60)}시간 ${
          state.totalFocusTime % 60
        }분`;
      vscode.window.showInformationMessage(message);
    }
  );

  // 타이머 상태 변경 리스너
  timer.onChange((state) => {
    updateStatusBar(state);
    showNotification(state);
  });

  // 컨텍스트에 명령 추가
  context.subscriptions.push(
    startCommand,
    stopCommand,
    resetCommand,
    nextCommand,
    toggleCommand,
    settingsCommand,
    showStatusCommand,
    statusBarItem,
    timerStatusBarItem
  );

  // 초기 상태 표시
  updateStatusBar(timer.getState());
  statusBarItem.show();
  timerStatusBarItem.show();
}

export function deactivate() {
  timer.stop();
  statusBarItem.dispose();
  timerStatusBarItem.dispose();
}
