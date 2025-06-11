import { create } from 'zustand';
import {
  ELEMENT_CONFIG,
  ElementType,
  GameElement,
  GameState,
  Player,
  Reaction,
  Score,
} from '../types/game';

interface GameStore extends GameState {
  // Actions
  addPlayer: (name: string, element: ElementType) => void;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  addReaction: (reaction: Reaction) => void;
  updateElement: (elementId: string, updates: Partial<GameElement>) => void;
  updateScore: (playerId: string, updates: Partial<Score>) => void;
  addNeutralElement: (element: GameElement) => void;
  removeElement: (elementId: string) => void;
}

const initialState: GameState = {
  phase: 'waiting',
  players: [],
  elements: [],
  reactions: [],
  scores: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  addPlayer: (name: string, element: ElementType) => {
    const playerId = `player-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newPlayer: Player = {
      id: playerId,
      name,
      element,
      isReady: true,
    };

    const newScore: Score = {
      playerId,
      alchemyPoints: 0,
      reactionCount: 0,
      survivalTime: 0,
      isLastSurvivor: false,
      isPhilosopherStone: false,
      isMasterAlchemist: false,
    };

    set((state) => ({
      players: [...state.players, newPlayer],
      scores: [...state.scores, newScore],
    }));
  },

  removePlayer: (playerId: string) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
      scores: state.scores.filter((s) => s.playerId !== playerId),
      elements: state.elements.filter((e) => e.playerId !== playerId),
    }));
  },

  startGame: () => {
    const { players } = get();
    const startTime = Date.now();

    // 플레이어 원소들을 게임 필드에 추가
    const playerElements: GameElement[] = players.map((player, index) => ({
      id: `element-${player.id}`,
      type: player.element,
      playerId: player.id,
      isNeutral: false,
      position: { x: 400 + index * 50, y: 100 }, // 초기 위치 분산
      velocity: { x: 0, y: 0 },
      health: 100,
      maxHealth: 100,
      physics: getElementPhysics(player.element),
      reactions: [],
    }));

    set((state) => ({
      phase: 'playing',
      elements: [...state.elements, ...playerElements],
      startTime,
    }));
  },

  endGame: () => {
    const endTime = Date.now();
    const { elements, scores, startTime } = get();

    // 최종 점수 계산
    const finalScores = calculateFinalScores(
      elements,
      scores,
      startTime || 0,
      endTime
    );
    const winner = determineWinners(finalScores);

    set((state) => ({
      phase: 'finished',
      endTime,
      scores: finalScores,
      winner,
    }));
  },

  resetGame: () => {
    set(() => ({
      ...initialState,
    }));
  },

  addReaction: (reaction: Reaction) => {
    set((state) => ({
      reactions: [...state.reactions, reaction],
    }));
  },

  updateElement: (elementId: string, updates: Partial<GameElement>) => {
    set((state) => ({
      elements: state.elements.map((element) =>
        element.id === elementId ? { ...element, ...updates } : element
      ),
    }));
  },

  updateScore: (playerId: string, updates: Partial<Score>) => {
    set((state) => ({
      scores: state.scores.map((score) =>
        score.playerId === playerId ? { ...score, ...updates } : score
      ),
    }));
  },

  addNeutralElement: (element: GameElement) => {
    set((state) => ({
      elements: [...state.elements, element],
    }));
  },

  removeElement: (elementId: string) => {
    set((state) => ({
      elements: state.elements.filter((e) => e.id !== elementId),
    }));
  },
}));

// 헬퍼 함수들
function getElementPhysics(elementType: ElementType) {
  return ELEMENT_CONFIG[elementType].physics;
}

function calculateFinalScores(
  elements: GameElement[],
  scores: Score[],
  startTime: number,
  endTime: number
): Score[] {
  const gameDuration = endTime - startTime;
  const survivingElements = elements.filter(
    (e) => e.health > 0 && !e.isNeutral
  );

  return scores.map((score) => {
    const element = elements.find((e) => e.playerId === score.playerId);
    const isAlive = element && element.health > 0;

    return {
      ...score,
      survivalTime: isAlive
        ? gameDuration
        : (element?.reactions.length || 0) * 1000, // 대략적 계산
      isLastSurvivor: Boolean(isAlive && survivingElements.length === 1),
    };
  });
}

function determineWinners(scores: Score[]) {
  // 최후의 생존자
  const lastSurvivor = scores.find((s) => s.isLastSurvivor)?.playerId;

  // 최고의 연금술사 (가장 높은 연금 점수)
  const masterAlchemist = scores.reduce((prev, current) =>
    current.alchemyPoints > prev.alchemyPoints ? current : prev
  ).playerId;

  // 현자의 돌 (가장 적은 반응 횟수)
  const philosopherStone = scores.reduce((prev, current) =>
    current.reactionCount < prev.reactionCount ? current : prev
  ).playerId;

  return {
    lastSurvivor,
    masterAlchemist,
    philosopherStone,
  };
}
