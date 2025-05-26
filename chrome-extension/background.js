// 타이머 상태 관리
let timerState = {
  isRunning: false,
  isBreak: false,
  timeLeft: 0,
  completedSessions: 0,
};

// 알람 이름
const TIMER_ALARM = 'pomodoroTimer';

// 타이머 시작
function startTimer(timeLeft) {
  timerState.isRunning = true;
  timerState.timeLeft = timeLeft;

  // 1초마다 실행되는 알람 생성
  chrome.alarms.create(TIMER_ALARM, {
    periodInMinutes: 1 / 60, // 1초
  });
}

// 타이머 정지
function stopTimer() {
  timerState.isRunning = false;
  chrome.alarms.clear(TIMER_ALARM);
}

// 타이머 리셋
async function resetTimer() {
  stopTimer();
  const settings = await getSettings();
  timerState.isBreak = false;
  timerState.timeLeft = settings.focusTime * 60;
  timerState.completedSessions = 0;
}

// 다음 세션으로 이동
async function nextSession(timeLeft) {
  stopTimer();
  timerState.timeLeft = timeLeft;
  timerState.isBreak = !timerState.isBreak;

  if (timerState.isRunning) {
    startTimer(timeLeft);
  }
}

// 설정 가져오기
async function getSettings() {
  const result = await chrome.storage.sync.get({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
  });
  return result;
}

// 알람 이벤트 처리
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === TIMER_ALARM && timerState.isRunning) {
    timerState.timeLeft--;

    // 모든 팝업에 타이머 업데이트 전송
    chrome.runtime.sendMessage({
      action: 'timerUpdate',
      timeLeft: timerState.timeLeft,
    });

    // 타이머 종료 체크
    if (timerState.timeLeft <= 0) {
      stopTimer();
      chrome.runtime.sendMessage({ action: 'timerComplete' });
    }
  }
});

// 메시지 처리
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.timeLeft);
      break;
    case 'stopTimer':
      stopTimer();
      break;
    case 'resetTimer':
      resetTimer();
      break;
    case 'nextSession':
      nextSession(message.timeLeft);
      break;
    case 'getTimerState':
      sendResponse(timerState);
      break;
  }
  return true;
});

// 초기화
async function initialize() {
  const settings = await getSettings();
  timerState.timeLeft = settings.focusTime * 60;
}

// 익스텐션 설치/업데이트 시 초기화
chrome.runtime.onInstalled.addListener(initialize);
