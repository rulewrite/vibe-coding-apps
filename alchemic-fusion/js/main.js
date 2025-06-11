/**
 * 알케믹 퓨전 - 메인 컨트롤러
 * 게임의 전체적인 흐름을 제어합니다.
 */

class AlchemicFusion {
  constructor() {
    this.currentScreen = 'waiting';
    this.players = [];
    this.gameState = 'waiting'; // waiting, playing, finished
    this.gameTimer = 180; // 3분 (180초)
    this.gameStartTime = null;
    this.timerInterval = null;

    this.init();
  }

  init() {
    this.initializeElements();
    this.bindEvents();
    this.showScreen('waiting');

    // 초기 UI 상태 설정
    this.updatePlayerList();
    this.updateStartButtonState();

    console.log('🔮 알케믹 퓨전 게임이 초기화되었습니다!');
  }

  initializeElements() {
    // 화면 요소들
    this.screens = {
      waiting: document.getElementById('waiting-screen'),
      game: document.getElementById('game-screen'),
      result: document.getElementById('result-screen'),
    };

    // 대기 화면 요소들
    this.playerNameInput = document.getElementById('player-name');
    this.randomElementCheckbox = document.getElementById('random-element');
    this.elementRunes = document.querySelectorAll('.rune');
    this.joinBtn = document.getElementById('join-btn');
    this.playerList = document.getElementById('player-list');
    this.startGameBtn = document.getElementById('start-game-btn');

    // 게임 화면 요소들
    this.gameCanvas = document.getElementById('game-canvas');
    this.survivorsCount = document.getElementById('survivors-count');
    this.topAlchemists = document.getElementById('top-alchemists');
    this.philosopherCandidates = document.getElementById(
      'philosopher-candidates'
    );
    this.eventLog = document.getElementById('event-log');
    this.gameTimerDisplay = document.getElementById('game-timer');
    this.pauseBtn = document.getElementById('pause-btn');
    this.resetBtn = document.getElementById('reset-btn');

    // 결과 화면 요소들
    this.playAgainBtn = document.getElementById('play-again-btn');
    this.shareResultBtn = document.getElementById('share-result-btn');
    this.finalRankings = document.getElementById('final-rankings');
  }

  bindEvents() {
    // 대기 화면 이벤트
    this.playerNameInput.addEventListener('input', () =>
      this.updateJoinButtonState()
    );
    this.randomElementCheckbox.addEventListener('change', () =>
      this.handleRandomElementToggle()
    );

    this.elementRunes.forEach((rune) => {
      rune.addEventListener('click', () => this.selectElement(rune));
    });

    this.joinBtn.addEventListener('click', () => this.addPlayer());
    this.startGameBtn.addEventListener('click', () => this.startGame());

    // 게임 화면 이벤트
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    this.resetBtn.addEventListener('click', () => this.resetGame());

    // 결과 화면 이벤트
    this.playAgainBtn.addEventListener('click', () => this.resetToWaiting());
    this.shareResultBtn.addEventListener('click', () => this.shareResults());

    // 키보드 이벤트
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  // 화면 전환
  showScreen(screenName) {
    Object.values(this.screens).forEach((screen) => {
      screen.classList.remove('active');
    });

    if (this.screens[screenName]) {
      this.screens[screenName].classList.add('active');
      this.currentScreen = screenName;
    }
  }

  // 원소 선택 처리
  selectElement(selectedRune) {
    if (this.randomElementCheckbox.checked) return;

    this.elementRunes.forEach((rune) => rune.classList.remove('selected'));
    selectedRune.classList.add('selected');
    this.updateJoinButtonState();
  }

  // 무작위 원소 토글
  handleRandomElementToggle() {
    if (this.randomElementCheckbox.checked) {
      this.elementRunes.forEach((rune) => rune.classList.remove('selected'));
    }
    this.updateJoinButtonState();
  }

  // 참가 버튼 상태 업데이트
  updateJoinButtonState() {
    const name = this.playerNameInput.value.trim();
    const hasSelectedElement =
      this.randomElementCheckbox.checked ||
      document.querySelector('.rune.selected');

    this.joinBtn.disabled = !name || !hasSelectedElement;
  }

  // 플레이어 추가
  addPlayer() {
    const name = this.playerNameInput.value.trim();
    if (!name) return;

    // 중복 이름 체크
    if (this.players.find((p) => p.name === name)) {
      alert('이미 존재하는 이름입니다!');
      return;
    }

    let element;
    if (this.randomElementCheckbox.checked) {
      const elements = ['fire', 'water', 'wood', 'metal', 'earth', 'wind'];
      element = elements[Math.floor(Math.random() * elements.length)];
    } else {
      const selectedRune = document.querySelector('.rune.selected');
      if (!selectedRune) return;
      element = selectedRune.dataset.element;
    }

    const player = {
      id: Date.now(),
      name: name,
      element: element,
      score: 0,
      reactions: 0,
      isAlive: true,
      joinedAt: Date.now(),
    };

    this.players.push(player);

    // 입력 필드 초기화
    this.playerNameInput.value = '';
    this.randomElementCheckbox.checked = false;
    this.elementRunes.forEach((rune) => rune.classList.remove('selected'));

    this.updatePlayerList();
    this.updateStartButtonState();
    this.updateJoinButtonState();

    console.log(`플레이어 추가: ${name} (${element})`);
  }

  // 플레이어 제거
  removePlayer(playerId) {
    this.players = this.players.filter((p) => p.id !== playerId);
    this.updatePlayerList();
    this.updateStartButtonState();
  }

  // 플레이어 목록 업데이트
  updatePlayerList() {
    if (this.players.length === 0) {
      this.playerList.innerHTML =
        '<div class="empty-list">아직 참가자가 없습니다</div>';
      return;
    }

    const elementEmojis = {
      fire: '🔥',
      water: '💧',
      wood: '🌳',
      metal: '⚔️',
      earth: '🪨',
      wind: '💨',
    };

    this.playerList.innerHTML = this.players
      .map(
        (player) => `
            <div class="player-item">
                <div class="player-element">${
                  elementEmojis[player.element]
                }</div>
                <div class="player-name">${player.name}</div>
                <button class="player-remove" onclick="game.removePlayer(${
                  player.id
                })">×</button>
            </div>
        `
      )
      .join('');
  }

  // 게임 시작 버튼 상태 업데이트
  updateStartButtonState() {
    this.startGameBtn.disabled = this.players.length < 2;
  }

  // 게임 시작
  startGame() {
    if (this.players.length < 2) {
      alert('최소 2명 이상의 플레이어가 필요합니다!');
      return;
    }

    console.log(`🎮 게임 시작! 참가자: ${this.players.length}명`);

    this.gameState = 'playing';
    this.gameStartTime = Date.now();
    this.showScreen('game');

    // 게임 엔진 초기화 및 시작
    if (window.PhysicsEngine) {
      window.PhysicsEngine.init(this.gameCanvas, this.players);
      window.PhysicsEngine.start();
    }

    // UI 초기화
    this.initializeGameUI();
    this.startGameTimer();

    this.addEventLog('system', '🔮 연금술 실험이 시작되었습니다!');
  }

  // 게임 UI 초기화
  initializeGameUI() {
    this.updateSurvivorsCount();
    this.updateTopAlchemists();
    this.updatePhilosopherCandidates();
  }

  // 게임 타이머 시작
  startGameTimer() {
    this.timerInterval = setInterval(() => {
      this.gameTimer--;
      this.updateTimerDisplay();

      if (this.gameTimer <= 0) {
        this.endGame('timeout');
      }
    }, 1000);
  }

  // 타이머 표시 업데이트
  updateTimerDisplay() {
    const minutes = Math.floor(this.gameTimer / 60);
    const seconds = this.gameTimer % 60;
    this.gameTimerDisplay.textContent = `${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // 생존자 수 업데이트
  updateSurvivorsCount() {
    const survivors = this.players.filter((p) => p.isAlive).length;
    const total = this.players.length;

    this.survivorsCount.querySelector('.count').textContent = survivors;
    this.survivorsCount.querySelector('.total').textContent = total;
  }

  // 최고 연금술사 순위 업데이트
  updateTopAlchemists() {
    const sortedByScore = [...this.players]
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const rankings = this.topAlchemists.querySelectorAll('.ranking-item');
    rankings.forEach((item, index) => {
      if (sortedByScore[index]) {
        const player = sortedByScore[index];
        item.querySelector('.name').textContent = player.name;
        item.querySelector('.score').textContent = `${player.score}점`;
      } else {
        item.querySelector('.name').textContent = '-';
        item.querySelector('.score').textContent = '0점';
      }
    });
  }

  // 현자의 돌 후보 업데이트
  updatePhilosopherCandidates() {
    const minReactions = Math.min(...this.players.map((p) => p.reactions));
    const candidates = this.players
      .filter((p) => p.reactions === minReactions && p.isAlive)
      .slice(0, 2);

    this.philosopherCandidates.innerHTML =
      candidates.length > 0
        ? candidates
            .map((p) => `<div class="candidate-item">${p.name}</div>`)
            .join('')
        : '<div class="candidate-item">-</div>';
  }

  // 이벤트 로그 추가
  addEventLog(type, message) {
    const timestamp = this.gameStartTime
      ? Math.floor((Date.now() - this.gameStartTime) / 1000)
      : 0;
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;

    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    logItem.innerHTML = `
            <span class="timestamp">${timeStr}</span>
            <span class="event">${message}</span>
        `;

    this.eventLog.insertBefore(logItem, this.eventLog.firstChild);

    // 로그 개수 제한 (최대 50개)
    while (this.eventLog.children.length > 50) {
      this.eventLog.removeChild(this.eventLog.lastChild);
    }
  }

  // 플레이어 점수 업데이트
  updatePlayerScore(playerId, scoreChange, reactionType) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    player.score += scoreChange;
    player.reactions++;

    this.updateTopAlchemists();
    this.updatePhilosopherCandidates();

    const reactionNames = {
      growth: '성장',
      amplify: '화력 증폭',
      harden: '경화',
      refine: '제련',
      spring: '수원 생성',
      seed: '파종',
      steam: '증기화',
      extinguish: '소화',
      melt: '용해',
      cut: '벌목',
      slice: '절삭',
      crack: '균열',
      weather: '풍화/방벽',
    };

    this.addEventLog(
      'reaction',
      `${player.name}이(가) ${
        reactionNames[reactionType] || reactionType
      } 반응을 일으켰습니다! (+${scoreChange}점)`
    );
  }

  // 플레이어 제거 (게임 중)
  eliminatePlayer(playerId, cause) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    player.isAlive = false;
    this.updateSurvivorsCount();
    this.updatePhilosopherCandidates();

    this.addEventLog(
      'elimination',
      `${player.name}의 원소가 ${cause}되었습니다!`
    );

    // 생존자가 1명 이하면 게임 종료
    const survivors = this.players.filter((p) => p.isAlive);
    if (survivors.length <= 1) {
      this.endGame('elimination');
    }
  }

  // 게임 일시정지/재개
  togglePause() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.pauseBtn.textContent = '▶️ 재개';
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      if (window.PhysicsEngine) {
        window.PhysicsEngine.pause();
      }
    } else if (this.gameState === 'paused') {
      this.gameState = 'playing';
      this.pauseBtn.textContent = '⏸️ 일시정지';
      this.startGameTimer();
      if (window.PhysicsEngine) {
        window.PhysicsEngine.resume();
      }
    }
  }

  // 게임 초기화
  resetGame() {
    if (confirm('정말로 게임을 초기화하시겠습니까?')) {
      this.endGame('reset');
    }
  }

  // 게임 종료
  endGame(reason) {
    console.log(`🏁 게임 종료: ${reason}`);

    this.gameState = 'finished';

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (window.PhysicsEngine) {
      window.PhysicsEngine.stop();
    }

    // 결과 계산 및 표시
    this.calculateResults();
    this.showResults();
  }

  // 결과 계산
  calculateResults() {
    // 최후의 생존자
    const survivors = this.players.filter((p) => p.isAlive);
    this.lastSurvivor = survivors.length === 1 ? survivors[0] : null;

    // 최고의 연금술사
    this.topAlchemist = [...this.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.joinedAt - b.joinedAt; // 동점시 먼저 참가한 사람
    })[0];

    // 현자의 돌
    const minReactions = Math.min(...this.players.map((p) => p.reactions));
    const philosopherCandidates = this.players.filter(
      (p) => p.reactions === minReactions
    );
    this.philosopher = philosopherCandidates.sort(
      (a, b) => a.joinedAt - b.joinedAt
    )[0];
  }

  // 결과 표시
  showResults() {
    this.showScreen('result');

    const elementEmojis = {
      fire: '🔥',
      water: '💧',
      wood: '🌳',
      metal: '⚔️',
      earth: '🪨',
      wind: '💨',
    };

    // 승자 카드 업데이트
    const updateWinnerCard = (cardId, winner) => {
      const card = document.getElementById(cardId);
      if (winner) {
        card.querySelector('.winner-name').textContent = winner.name;
        card.querySelector('.winner-element').textContent =
          elementEmojis[winner.element];
        if (card.querySelector('.winner-score')) {
          card.querySelector('.winner-score').textContent = `${winner.score}점`;
        }
      }
    };

    updateWinnerCard('philosopher-winner', this.philosopher);
    updateWinnerCard('alchemist-winner', this.topAlchemist);
    updateWinnerCard('survivor-winner', this.lastSurvivor);

    // 최종 순위표 생성
    this.generateFinalRankings();
  }

  // 최종 순위표 생성
  generateFinalRankings() {
    const sortedPlayers = [...this.players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.reactions !== a.reactions) return a.reactions - b.reactions;
      return a.joinedAt - b.joinedAt;
    });

    const elementEmojis = {
      fire: '🔥',
      water: '💧',
      wood: '🌳',
      metal: '⚔️',
      earth: '🪨',
      wind: '💨',
    };

    this.finalRankings.innerHTML = sortedPlayers
      .map(
        (player, index) => `
            <div class="ranking-row">
                <div class="ranking-position">${index + 1}</div>
                <div class="ranking-player">
                    <span class="ranking-element">${
                      elementEmojis[player.element]
                    }</span>
                    <span class="ranking-name">${player.name}</span>
                </div>
                <div class="ranking-reactions">${player.reactions}회</div>
                <div class="ranking-score">${player.score}점</div>
            </div>
        `
      )
      .join('');
  }

  // 대기 화면으로 돌아가기
  resetToWaiting() {
    this.gameState = 'waiting';
    this.gameTimer = 180;
    this.gameStartTime = null;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    // 플레이어 상태 초기화
    this.players.forEach((player) => {
      player.score = 0;
      player.reactions = 0;
      player.isAlive = true;
    });

    this.showScreen('waiting');
    this.updateTimerDisplay();

    console.log('🔄 게임이 초기화되었습니다.');
  }

  // 결과 공유
  shareResults() {
    const results =
      `🔮 알케믹 퓨전 결과 🔮\n\n` +
      `💎 현자의 돌: ${this.philosopher?.name || '없음'}\n` +
      `🏆 최고의 연금술사: ${this.topAlchemist?.name || '없음'} (${
        this.topAlchemist?.score || 0
      }점)\n` +
      `⚔️ 최후의 생존자: ${this.lastSurvivor?.name || '없음'}\n\n` +
      `참가자: ${this.players.length}명`;

    if (navigator.share) {
      navigator.share({
        title: '알케믹 퓨전 결과',
        text: results,
      });
    } else {
      navigator.clipboard.writeText(results).then(() => {
        alert('결과가 클립보드에 복사되었습니다!');
      });
    }
  }

  // 키보드 이벤트 처리
  handleKeyPress(e) {
    switch (e.key) {
      case 'Enter':
        if (this.currentScreen === 'waiting' && !this.joinBtn.disabled) {
          this.addPlayer();
        }
        break;
      case ' ':
        if (this.currentScreen === 'game') {
          e.preventDefault();
          this.togglePause();
        }
        break;
      case 'Escape':
        if (this.currentScreen === 'game') {
          this.togglePause();
        }
        break;
    }
  }
}

// 게임 인스턴스 생성
let game;

document.addEventListener('DOMContentLoaded', () => {
  game = new AlchemicFusion();
});

// 전역 접근을 위한 window 객체에 등록
window.AlchemicFusion = AlchemicFusion;
