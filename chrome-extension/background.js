import { PomodoroTimer } from '../../pomodoro-core';

const defaultSettings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  sessionsBeforeLongBreak: 4,
};

// 싱글톤 인스턴스 생성
const timer = new PomodoroTimer(defaultSettings);

// 설정 불러오기
chrome.storage.local.get('pomodoroSettings', (result) => {
  if (result.pomodoroSettings) {
    timer.updateSettings(result.pomodoroSettings);
  }
});

// 타이머 상태 변경 시 popup에 알림
timer.onChange((state) => {
  chrome.runtime.sendMessage({ type: 'TIMER_UPDATE', state });
});

// 타이머 완료 시 알림
timer.onChange((state) => {
  if (state.timeLeft === 0) {
    const title =
      state.mode === 'focus' ? '집중 시간 완료!' : '휴식 시간 완료!';
    const message =
      state.mode === 'focus'
        ? '휴식 시간을 시작합니다.'
        : '다음 집중 시간을 시작합니다.';

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title,
      message,
    });
  }
});

// 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'GET_STATE':
      sendResponse(timer.getState());
      break;
    case 'START_TIMER':
      timer.start();
      sendResponse(timer.getState());
      break;
    case 'STOP_TIMER':
      timer.stop();
      sendResponse(timer.getState());
      break;
    case 'RESET_TIMER':
      timer.reset();
      sendResponse(timer.getState());
      break;
    case 'NEXT_SESSION':
      timer.nextSession();
      sendResponse(timer.getState());
      break;
    case 'UPDATE_SETTINGS':
      timer.updateSettings(message.settings);
      chrome.storage.local.set({ pomodoroSettings: message.settings });
      sendResponse(timer.getState());
      break;
  }
  return true; // 비동기 응답을 위해 true 반환
});
