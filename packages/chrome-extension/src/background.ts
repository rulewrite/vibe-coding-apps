import { PomodoroSettings, PomodoroState, PomodoroTimer } from '@vibe-coding-pomodoro/core';

let timer: PomodoroTimer | null = null;
let state: PomodoroState | null = null;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('settings', (result) => {
    const settings = result.settings || {
      focusTime: 25,
      shortBreakTime: 5,
      longBreakTime: 15,
      sessionsBeforeLongBreak: 4,
      autoStartBreaks: true,
      autoStartPomodoros: true,
      notifications: true,
    };

    initializeTimer(settings);
  });
});

function initializeTimer(settings: PomodoroSettings) {
  timer = new PomodoroTimer(settings, {
    onStateChange: (newState) => {
      state = newState;
      chrome.storage.local.set({ state: newState });
      updateBadge(newState);
    },
    onSessionComplete: (sessionType) => {
      if (settings.notifications) {
        const title = sessionType === 'focus' ? '휴식 시간입니다!' : '뽀모도로를 시작해볼까요?';
        const body = sessionType === 'focus' 
          ? '잠시 휴식을 취하고 다시 시작해보세요.'
          : '새로운 뽀모도로 세션을 시작해보세요.';
        
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title,
          message: body,
        });
      }
    },
  });

  state = timer.getState();
  chrome.storage.local.set({ state, settings });
  updateBadge(state);
}

function updateBadge(state: PomodoroState) {
  const minutes = Math.ceil(state.timeRemaining / 60);
  chrome.action.setBadgeText({ text: minutes.toString() });
  chrome.action.setBadgeBackgroundColor({
    color: state.currentSession === 'focus' ? '#FF6B6B' : '#4ECDC4',
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!timer || !state) return;

  switch (message.type) {
    case 'START':
      timer.start();
      break;
    case 'STOP':
      timer.stop();
      break;
    case 'RESET':
      timer.reset();
      break;
    case 'NEXT_SESSION':
      timer.nextSession();
      break;
    case 'UPDATE_SETTINGS':
      timer.updateSettings(message.settings);
      chrome.storage.local.set({ settings: message.settings });
      break;
    case 'GET_STATE':
      sendResponse({ state, settings: state.settings });
      break;
  }
}); 