// 타이머 상태 관리
let timerState = {
  isRunning: false,
  isBreak: false,
  timeLeft: 0,
  totalTime: 0,
  completedSessions: 0,
};

// DOM 요소
const timerDisplay = document.getElementById('timer');
const modeDisplay = document.getElementById('mode');
const progressBar = document.getElementById('progress');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const resetButton = document.getElementById('reset');
const nextButton = document.getElementById('next');
const settingsButton = document.getElementById('settings');

let currentState = null;

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

// 타이머 상태 업데이트
function updateTimerDisplay(state) {
  currentState = state;
  const minutes = Math.floor(state.timeLeft / 60);
  const seconds = state.timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // 모드 표시
  switch (state.mode) {
    case 'focus':
      modeDisplay.textContent = '집중 시간';
      break;
    case 'shortBreak':
      modeDisplay.textContent = '짧은 휴식';
      break;
    case 'longBreak':
      modeDisplay.textContent = '긴 휴식';
      break;
  }

  // 진행 바 업데이트
  const totalTime =
    state.mode === 'focus'
      ? 25 * 60
      : state.mode === 'shortBreak'
      ? 5 * 60
      : 15 * 60;
  const progress = ((totalTime - state.timeLeft) / totalTime) * 100;
  progressBar.style.width = `${progress}%`;

  // 버튼 상태 업데이트
  startButton.style.display = state.isRunning ? 'none' : 'block';
  stopButton.style.display = state.isRunning ? 'block' : 'none';
}

// 타이머 제어 함수
function startTimer() {
  chrome.runtime.sendMessage({ type: 'START_TIMER' });
}

function stopTimer() {
  chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
}

function resetTimer() {
  chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
}

function nextSession() {
  chrome.runtime.sendMessage({ type: 'NEXT_SESSION' });
}

// 이벤트 리스너
startButton.addEventListener('click', startTimer);
stopButton.addEventListener('click', stopTimer);
resetButton.addEventListener('click', resetTimer);
nextButton.addEventListener('click', nextSession);
settingsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// 메시지 리스너
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TIMER_UPDATE') {
    updateTimerDisplay(message.state);
  }
});

// 초기 상태 가져오기
chrome.runtime.sendMessage({ type: 'GET_STATE' }, (state) => {
  if (state) {
    updateTimerDisplay(state);
  }
});

// 초기화
async function initialize() {
  const settings = await getSettings();
  timerState.timeLeft = settings.focusTime * 60;
  timerState.totalTime = settings.focusTime * 60;
  updateTimerDisplay(timerState);

  // 현재 타이머 상태 확인
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    if (response) {
      timerState = response;
      updateTimerDisplay(timerState);
      if (timerState.isRunning) {
        startButton.style.display = 'none';
        stopButton.style.display = 'block';
      }
    }
  });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);
