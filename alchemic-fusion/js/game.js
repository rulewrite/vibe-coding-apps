/**
 * 알케믹 퓨전 - 게임 로직
 * 게임의 핵심 로직과 상태 관리를 담당합니다.
 */

class GameLogic {
  constructor() {
    this.gameState = 'idle'; // idle, running, paused, ended
    this.gameMode = 'normal'; // normal, tournament, practice
    this.difficulty = 'normal'; // easy, normal, hard

    // 게임 설정
    this.settings = {
      maxGameTime: 180, // 3분
      minPlayers: 2,
      maxPlayers: 8,
      neutralElementSpawnInterval: 20, // 20초
      reactionCooldown: 1000, // 1초
      eliminationDelay: 500, // 0.5초

      // 점수 시스템
      scoring: {
        symbiosis: 1, // 상생 반응
        conflict_weak: 3, // 약화 반응
        conflict_eliminate: 5, // 소멸 반응
        mutual_conflict: 2, // 상호 약화
        combination: 10, // 조합 반응
      },

      // 물리 설정
      physics: {
        gravity: 0.5,
        airResistance: 0.98,
        bounciness: 0.6,
        friction: 0.4,
      },
    };

    // 게임 상태
    this.statistics = {
      totalReactions: 0,
      reactionsByType: {},
      eliminationCount: 0,
      longestChainReaction: 0,
      gameStartTime: null,
      gameEndTime: null,
    };

    this.achievements = [];
    this.eventHandlers = new Map();

    this.init();
  }

  init() {
    this.setupEventHandlers();
    this.resetStatistics();

    console.log('🎯 게임 로직이 초기화되었습니다.');
  }

  setupEventHandlers() {
    // 물리 엔진과의 연동
    this.addEventListener('reaction', (data) => {
      this.handleReaction(data);
    });

    this.addEventListener('elimination', (data) => {
      this.handleElimination(data);
    });

    this.addEventListener('playerJoin', (data) => {
      this.handlePlayerJoin(data);
    });

    this.addEventListener('gameStart', () => {
      this.handleGameStart();
    });

    this.addEventListener('gameEnd', (data) => {
      this.handleGameEnd(data);
    });
  }

  // 이벤트 시스템
  addEventListener(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  dispatchEvent(event, data = null) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`이벤트 핸들러 오류 (${event}):`, error);
        }
      });
    }
  }

  // 게임 상태 관리
  startGame(players) {
    if (players.length < this.settings.minPlayers) {
      throw new Error(
        `최소 ${this.settings.minPlayers}명의 플레이어가 필요합니다.`
      );
    }

    if (players.length > this.settings.maxPlayers) {
      throw new Error(
        `최대 ${this.settings.maxPlayers}명까지만 참가할 수 있습니다.`
      );
    }

    this.gameState = 'running';
    this.statistics.gameStartTime = Date.now();
    this.resetStatistics();

    // 게임 시작 이벤트 발생
    this.dispatchEvent('gameStart', { players });

    // 배경음악 시작
    if (window.AudioSystem) {
      window.AudioSystem.playBackgroundMusic(true);
      window.AudioSystem.playUISound('start');
    }

    // 게임 시작 알림
    if (window.UIController) {
      window.UIController.showNotification(
        `🔮 ${players.length}명의 연금술사가 실험을 시작합니다!`,
        'info',
        3000
      );
    }

    console.log(`🎮 게임 시작! 참가자: ${players.length}명`);

    return true;
  }

  pauseGame() {
    if (this.gameState === 'running') {
      this.gameState = 'paused';
      this.dispatchEvent('gamePause');

      if (window.AudioSystem) {
        window.AudioSystem.setMusicVolume(0.2);
      }

      console.log('⏸️ 게임이 일시정지되었습니다.');
      return true;
    }
    return false;
  }

  resumeGame() {
    if (this.gameState === 'paused') {
      this.gameState = 'running';
      this.dispatchEvent('gameResume');

      if (window.AudioSystem) {
        window.AudioSystem.setMusicVolume(0.5);
      }

      console.log('▶️ 게임이 재개되었습니다.');
      return true;
    }
    return false;
  }

  endGame(reason = 'normal') {
    if (this.gameState === 'running' || this.gameState === 'paused') {
      this.gameState = 'ended';
      this.statistics.gameEndTime = Date.now();

      // 성취 확인
      this.checkAchievements();

      // 게임 종료 이벤트 발생
      this.dispatchEvent('gameEnd', { reason, statistics: this.statistics });

      // 배경음악 정지
      if (window.AudioSystem) {
        window.AudioSystem.stopBackgroundMusic();
        if (reason === 'victory') {
          window.AudioSystem.playUISound('victory');
        }
      }

      console.log(`🏁 게임 종료: ${reason}`);
      return true;
    }
    return false;
  }

  resetGame() {
    this.gameState = 'idle';
    this.resetStatistics();
    this.achievements = [];

    this.dispatchEvent('gameReset');

    console.log('🔄 게임이 초기화되었습니다.');
  }

  // 반응 처리
  handleReaction(reactionData) {
    if (this.gameState !== 'running') return;

    const { reaction, sourceElement, targetElement, position } = reactionData;

    // 통계 업데이트
    this.statistics.totalReactions++;
    if (!this.statistics.reactionsByType[reaction.type]) {
      this.statistics.reactionsByType[reaction.type] = 0;
    }
    this.statistics.reactionsByType[reaction.type]++;

    // 점수 계산
    const score = this.calculateReactionScore(reaction);

    // 연쇄 반응 감지
    this.detectChainReaction(reaction, position);

    // 시각/음향 효과
    if (window.UIController) {
      window.UIController.createReactionEffect(reaction, position);
    }

    if (window.AudioSystem) {
      window.AudioSystem.playReactionSound(reaction.type);
    }

    console.log(`⚡ 반응: ${reaction.name} (점수: ${score})`);

    return {
      reaction,
      score,
      position,
    };
  }

  handleElimination(eliminationData) {
    if (this.gameState !== 'running') return;

    const { elementId, cause, position } = eliminationData;

    this.statistics.eliminationCount++;

    // 제거 효과
    if (window.UIController) {
      window.UIController.createEliminationEffect(position, cause);
    }

    // 게임 종료 조건 확인
    this.checkEndConditions();

    console.log(`💀 원소 제거: ${cause}`);
  }

  handlePlayerJoin(playerData) {
    const { player } = playerData;

    if (window.AudioSystem) {
      window.AudioSystem.playUISound('join');
    }

    if (window.UIController) {
      window.UIController.showNotification(
        `${player.name}님이 ${
          window.ElementSystem.elements[player.element].emoji
        } ${
          window.ElementSystem.elements[player.element].name
        } 원소로 참가했습니다!`,
        'success',
        2000
      );
    }

    console.log(`👤 플레이어 참가: ${player.name} (${player.element})`);
  }

  handleGameStart() {
    // 게임 시작 시 특별 효과
    if (window.UIController) {
      window.UIController.createCelebrationEffect();
    }

    console.log('🚀 게임 시작 처리 완료');
  }

  handleGameEnd(endData) {
    const { reason } = endData;

    // 최종 결과 계산
    const results = this.calculateFinalResults();

    // 승리 애니메이션
    if (window.UIController && results.winners) {
      window.UIController.playVictoryAnimation(results.winners);
    }

    console.log('🎊 게임 종료 처리 완료');

    return results;
  }

  // 점수 계산
  calculateReactionScore(reaction) {
    const baseScore = this.settings.scoring[reaction.category] || 1;

    // 난이도 배수
    const difficultyMultiplier =
      {
        easy: 0.8,
        normal: 1.0,
        hard: 1.2,
      }[this.difficulty] || 1.0;

    // 시간 보너스 (게임 초반일수록 높은 점수)
    const gameTime = (Date.now() - this.statistics.gameStartTime) / 1000;
    const timeBonus = Math.max(
      0.5,
      1 - (gameTime / this.settings.maxGameTime) * 0.3
    );

    // 연쇄 반응 보너스
    const chainBonus = this.getChainReactionBonus();

    const finalScore = Math.round(
      baseScore * difficultyMultiplier * timeBonus * chainBonus
    );

    return Math.max(1, finalScore);
  }

  getChainReactionBonus() {
    // 최근 3초 내의 반응 횟수에 따른 보너스
    const recentReactions = this.getRecentReactionCount(3000);
    return 1 + (recentReactions - 1) * 0.2; // 연쇄반응마다 20% 보너스
  }

  getRecentReactionCount(timeWindow) {
    // 실제 구현에서는 최근 반응 기록을 추적해야 함
    return 1; // 임시값
  }

  // 연쇄 반응 감지
  detectChainReaction(reaction, position) {
    // 주변의 다른 원소들과의 추가 반응 가능성 확인
    // 실제 구현에서는 물리 엔진과 연동

    const chainLength = this.calculateChainLength(reaction, position);
    if (chainLength > this.statistics.longestChainReaction) {
      this.statistics.longestChainReaction = chainLength;

      if (chainLength >= 3) {
        this.triggerChainReactionEvent(chainLength);
      }
    }
  }

  calculateChainLength(reaction, position) {
    // 연쇄 반응 길이 계산 로직
    // 임시 구현
    return Math.random() > 0.7 ? 2 : 1;
  }

  triggerChainReactionEvent(chainLength) {
    if (window.UIController) {
      window.UIController.showNotification(
        `🔥 ${chainLength}단 연쇄 반응!`,
        'reaction',
        2000
      );
    }

    console.log(`🔗 연쇄 반응: ${chainLength}단`);
  }

  // 게임 종료 조건 확인
  checkEndConditions() {
    if (this.gameState !== 'running') return;

    // 생존자 수 확인
    if (window.PhysicsEngine) {
      const gameState = window.PhysicsEngine.getGameState();

      if (gameState.survivors.length <= 1) {
        this.endGame('elimination');
        return;
      }
    }

    // 시간 확인은 main.js에서 처리됨
  }

  // 최종 결과 계산
  calculateFinalResults() {
    if (!window.game || !window.game.players) {
      return null;
    }

    const players = window.game.players;

    // 최후의 생존자
    const survivors = players.filter((p) => p.isAlive);
    const lastSurvivor = survivors.length === 1 ? survivors[0] : null;

    // 최고의 연금술사 (점수순)
    const topAlchemist = [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.joinedAt - b.joinedAt; // 동점시 먼저 참가한 사람
    })[0];

    // 현자의 돌 (최소 반응 횟수)
    const minReactions = Math.min(...players.map((p) => p.reactions));
    const philosopherCandidates = players.filter(
      (p) => p.reactions === minReactions
    );
    const philosopher = philosopherCandidates.sort(
      (a, b) => a.joinedAt - b.joinedAt
    )[0];

    const winners = [
      {
        category: 'philosopher',
        title: '💎 현자의 돌',
        name: philosopher?.name || '없음',
        player: philosopher,
      },
      {
        category: 'alchemist',
        title: '🏆 최고의 연금술사',
        name: topAlchemist?.name || '없음',
        player: topAlchemist,
        score: topAlchemist?.score || 0,
      },
      {
        category: 'survivor',
        title: '⚔️ 최후의 생존자',
        name: lastSurvivor?.name || '없음',
        player: lastSurvivor,
      },
    ];

    return {
      winners,
      statistics: this.statistics,
      achievements: this.achievements,
      players: players.map((p) => ({
        ...p,
        finalRank: this.calculatePlayerRank(p, players),
      })),
    };
  }

  calculatePlayerRank(player, allPlayers) {
    // 플레이어 순위 계산 (점수 기준)
    const sortedPlayers = [...allPlayers].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.reactions !== a.reactions) return a.reactions - b.reactions;
      return a.joinedAt - b.joinedAt;
    });

    return sortedPlayers.findIndex((p) => p.id === player.id) + 1;
  }

  // 성취 시스템
  checkAchievements() {
    const achievements = [];

    // 반응 관련 성취
    if (this.statistics.totalReactions >= 50) {
      achievements.push({
        id: 'reaction_master',
        name: '반응의 대가',
        description: '50회 이상의 반응을 일으켰습니다',
        icon: '⚡',
      });
    }

    if (this.statistics.longestChainReaction >= 5) {
      achievements.push({
        id: 'chain_master',
        name: '연쇄의 달인',
        description: '5단 이상의 연쇄 반응을 일으켰습니다',
        icon: '🔗',
      });
    }

    // 시간 관련 성취
    const gameTime =
      (this.statistics.gameEndTime - this.statistics.gameStartTime) / 1000;
    if (gameTime < 60) {
      achievements.push({
        id: 'speed_demon',
        name: '신속한 연금술사',
        description: '1분 내에 게임을 완료했습니다',
        icon: '⚡',
      });
    }

    // 특별 반응 성취
    Object.entries(this.statistics.reactionsByType).forEach(([type, count]) => {
      if (count >= 10) {
        const reactionName = this.getReactionDisplayName(type);
        achievements.push({
          id: `reaction_${type}`,
          name: `${reactionName} 전문가`,
          description: `${reactionName} 반응을 10회 이상 일으켰습니다`,
          icon: this.getReactionIcon(type),
        });
      }
    });

    this.achievements = achievements;

    // 성취 알림
    achievements.forEach((achievement) => {
      if (window.UIController) {
        window.UIController.showNotification(
          `🏅 성취 달성: ${achievement.name}`,
          'success',
          4000
        );
      }
    });

    return achievements;
  }

  getReactionDisplayName(type) {
    const names = {
      growth: '성장',
      amplify: '증폭',
      harden: '경화',
      refine: '제련',
      spring: '수원',
      seed: '파종',
      steam: '증기화',
      extinguish: '소화',
      melt: '용해',
      cut: '벌목',
      slice: '절삭',
      crack: '균열',
      weather: '풍화',
    };
    return names[type] || type;
  }

  getReactionIcon(type) {
    const icons = {
      growth: '🌱',
      amplify: '🔥',
      harden: '🪨',
      refine: '⚒️',
      spring: '💧',
      seed: '🌰',
      steam: '💨',
      extinguish: '🧯',
      melt: '🫠',
      cut: '🪓',
      slice: '⚔️',
      crack: '💥',
      weather: '🌪️',
    };
    return icons[type] || '⚡';
  }

  // 통계 초기화
  resetStatistics() {
    this.statistics = {
      totalReactions: 0,
      reactionsByType: {},
      eliminationCount: 0,
      longestChainReaction: 0,
      gameStartTime: null,
      gameEndTime: null,
    };
  }

  // 게임 설정
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    console.log('⚙️ 게임 설정이 업데이트되었습니다.');
  }

  getSettings() {
    return { ...this.settings };
  }

  // 게임 상태 정보
  getGameState() {
    return {
      state: this.gameState,
      mode: this.gameMode,
      difficulty: this.difficulty,
      statistics: { ...this.statistics },
      achievements: [...this.achievements],
    };
  }

  // 디버그 모드
  enableDebugMode() {
    this.debugMode = true;
    console.log('🐛 디버그 모드가 활성화되었습니다.');
  }

  disableDebugMode() {
    this.debugMode = false;
    console.log('🐛 디버그 모드가 비활성화되었습니다.');
  }
}

// 전역 게임 로직 인스턴스 생성
window.GameLogic = new GameLogic();
