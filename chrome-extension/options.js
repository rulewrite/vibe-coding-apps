// 설정 요소들
const focusTimeInput = document.getElementById('focusTime');
const shortBreakTimeInput = document.getElementById('shortBreakTime');
const longBreakTimeInput = document.getElementById('longBreakTime');
const sessionsBeforeLongBreakInput = document.getElementById(
  'sessionsBeforeLongBreak'
);
const saveButton = document.getElementById('saveButton');
const statusMessage = document.getElementById('status');

// 저장된 설정 불러오기
async function loadSettings() {
  const settings = await chrome.storage.sync.get({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
  });

  focusTimeInput.value = settings.focusTime;
  shortBreakTimeInput.value = settings.shortBreakTime;
  longBreakTimeInput.value = settings.longBreakTime;
  sessionsBeforeLongBreakInput.value = settings.sessionsBeforeLongBreak;
}

// 설정 저장
async function saveSettings() {
  const settings = {
    focusTime: parseInt(focusTimeInput.value),
    shortBreakTime: parseInt(shortBreakTimeInput.value),
    longBreakTime: parseInt(longBreakTimeInput.value),
    sessionsBeforeLongBreak: parseInt(sessionsBeforeLongBreakInput.value),
  };

  // 입력값 검증
  if (settings.focusTime < 1 || settings.focusTime > 60) {
    alert('집중 시간은 1-60분 사이여야 합니다.');
    return;
  }
  if (settings.shortBreakTime < 1 || settings.shortBreakTime > 30) {
    alert('짧은 휴식 시간은 1-30분 사이여야 합니다.');
    return;
  }
  if (settings.longBreakTime < 1 || settings.longBreakTime > 60) {
    alert('긴 휴식 시간은 1-60분 사이여야 합니다.');
    return;
  }
  if (
    settings.sessionsBeforeLongBreak < 1 ||
    settings.sessionsBeforeLongBreak > 10
  ) {
    alert('세션 수는 1-10 사이여야 합니다.');
    return;
  }

  // 설정 저장
  await chrome.storage.sync.set(settings);

  // 저장 완료 메시지 표시
  statusMessage.style.display = 'block';
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 2000);
}

// 이벤트 리스너 설정
saveButton.addEventListener('click', saveSettings);

// 페이지 로드 시 설정 불러오기
document.addEventListener('DOMContentLoaded', loadSettings);
