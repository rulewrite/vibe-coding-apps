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
const progressBar = document.getElementById('progress-bar');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const nextBtn = document.getElementById('nextBtn');

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

// 타이머 업데이트
function updateTimerDisplay() {
  const minutes = Math.floor(timerState.timeLeft / 60);
  const seconds = timerState.timeLeft % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;

  // 진행률 업데이트
  const progress =
    ((timerState.totalTime - timerState.timeLeft) / timerState.totalTime) * 100;
  progressBar.style.width = `${progress}%`;

  // 모드 표시 업데이트
  modeDisplay.textContent = timerState.isBreak ? '휴식 시간' : '집중 시간';
}

// 타이머 시작
async function startTimer() {
  if (!timerState.isRunning) {
    timerState.isRunning = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';

    // 백그라운드에 타이머 시작 메시지 전송
    chrome.runtime.sendMessage({
      action: 'startTimer',
      timeLeft: timerState.timeLeft,
    });
  }
}

// 타이머 정지
function stopTimer() {
  if (timerState.isRunning) {
    timerState.isRunning = false;
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';

    // 백그라운드에 타이머 정지 메시지 전송
    chrome.runtime.sendMessage({ action: 'stopTimer' });
  }
}

// 타이머 리셋
async function resetTimer() {
  const settings = await getSettings();
  timerState.isBreak = false;
  timerState.timeLeft = settings.focusTime * 60;
  timerState.totalTime = settings.focusTime * 60;
  updateTimerDisplay();

  // 백그라운드에 타이머 리셋 메시지 전송
  chrome.runtime.sendMessage({ action: 'resetTimer' });
}

// 다음 세션으로 이동
async function nextSession() {
  const settings = await getSettings();
  timerState.isBreak = !timerState.isBreak;

  if (timerState.isBreak) {
    if (timerState.completedSessions % settings.sessionsBeforeLongBreak === 0) {
      timerState.timeLeft = settings.longBreakTime * 60;
      timerState.totalTime = settings.longBreakTime * 60;
    } else {
      timerState.timeLeft = settings.shortBreakTime * 60;
      timerState.totalTime = settings.shortBreakTime * 60;
    }
  } else {
    timerState.timeLeft = settings.focusTime * 60;
    timerState.totalTime = settings.focusTime * 60;
  }

  updateTimerDisplay();
  // 백그라운드에 다음 세션 메시지 전송
  chrome.runtime.sendMessage({
    action: 'nextSession',
    timeLeft: timerState.timeLeft,
  });
}

// 이벤트 리스너 설정
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
nextBtn.addEventListener('click', nextSession);

// 백그라운드로부터 타이머 업데이트 수신
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'timerUpdate') {
    timerState.timeLeft = message.timeLeft;
    updateTimerDisplay();
  } else if (message.action === 'timerComplete') {
    timerState.isRunning = false;
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';

    if (!timerState.isBreak) {
      timerState.completedSessions++;
    }

    // 알림 표시
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: timerState.isBreak ? '휴식 시간 종료' : '집중 시간 종료',
      message: timerState.isBreak
        ? '다시 집중 시간을 시작합니다!'
        : '휴식 시간을 시작합니다!',
    });

    nextSession();
  }
});

// 초기화
async function initialize() {
  const settings = await getSettings();
  timerState.timeLeft = settings.focusTime * 60;
  timerState.totalTime = settings.focusTime * 60;
  updateTimerDisplay();

  // 현재 타이머 상태 확인
  chrome.runtime.sendMessage({ action: 'getTimerState' }, (response) => {
    if (response) {
      timerState = response;
      updateTimerDisplay();
      if (timerState.isRunning) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'block';
      }
    }
  });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', initialize);
