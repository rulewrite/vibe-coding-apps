// 원소 타입 정의
export type ElementType =
  | 'fire'
  | 'water'
  | 'wood'
  | 'metal'
  | 'earth'
  | 'wind';

// 반응 타입 정의
export type ReactionType =
  | 'growth'
  | 'amplify'
  | 'harden'
  | 'refine'
  | 'generate'
  | 'seed'
  | 'extinguish'
  | 'melt'
  | 'cut'
  | 'slash'
  | 'crack'
  | 'weathering'
  | 'steam'; // 조합 반응

// 게임 단계 정의
export type GamePhase = 'waiting' | 'playing' | 'finished';

// 플레이어 정의
export interface Player {
  id: string;
  name: string;
  element: ElementType;
  isReady: boolean;
}

// 원소 물리 특성
export interface ElementPhysics {
  mass: number;
  friction: number;
  restitution: number;
  density: number;
}

// 게임 내 원소 인스턴스
export interface GameElement {
  id: string;
  type: ElementType;
  playerId?: string; // 플레이어 원소인 경우
  isNeutral: boolean; // 중립 원소 여부
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  health: number;
  maxHealth: number;
  physics: ElementPhysics;
  reactions: string[]; // 참여한 반응 ID 목록
}

// 반응 정보
export interface Reaction {
  id: string;
  type: ReactionType;
  elements: string[]; // 참여한 원소 ID들
  timestamp: number;
  position: { x: number; y: number };
  description: string;
}

// 점수 정보
export interface Score {
  playerId: string;
  alchemyPoints: number; // 연금 점수 (반응 참여도)
  reactionCount: number; // 반응 횟수
  survivalTime: number; // 생존 시간
  isLastSurvivor: boolean;
  isPhilosopherStone: boolean; // 현자의 돌 (최소 반응)
  isMasterAlchemist: boolean; // 최고의 연금술사 (최고 점수)
}

// 게임 상태
export interface GameState {
  phase: GamePhase;
  players: Player[];
  elements: GameElement[];
  reactions: Reaction[];
  scores: Score[];
  startTime?: number;
  endTime?: number;
  winner?: {
    lastSurvivor?: string;
    masterAlchemist?: string;
    philosopherStone?: string;
  };
}

// 원소별 특성 정의
export const ELEMENT_CONFIG: Record<
  ElementType,
  {
    name: string;
    emoji: string;
    color: string;
    physics: ElementPhysics;
    description: string;
  }
> = {
  fire: {
    name: '불',
    emoji: '🔥',
    color: '#ef4444',
    physics: { mass: 0.8, friction: 0.1, restitution: 0.7, density: 0.8 },
    description:
      '공격적이며 파괴적. 연쇄 반응의 기점이 될 수 있는 잠재력을 가짐.',
  },
  water: {
    name: '물',
    emoji: '💧',
    color: '#3b82f6',
    physics: { mass: 1.0, friction: 0.05, restitution: 0.3, density: 1.0 },
    description:
      '방어적이며 유동적. 다른 원소의 힘을 중화시키거나 새로운 반응을 유도함.',
  },
  wood: {
    name: '나무',
    emoji: '🌲',
    color: '#22c55e',
    physics: { mass: 0.9, friction: 0.8, restitution: 0.4, density: 0.6 },
    description:
      '성장하며 끈질김. 다른 원소의 도움을 받아 강해지는 대기만성형.',
  },
  metal: {
    name: '쇠',
    emoji: '⚔️',
    color: '#6b7280',
    physics: { mass: 1.5, friction: 0.7, restitution: 0.8, density: 1.8 },
    description:
      '날카롭고 단단함. 특정 원소에 대한 확실한 카운터 역할을 수행함.',
  },
  earth: {
    name: '흙',
    emoji: '🗻',
    color: '#a3a3a3',
    physics: { mass: 2.0, friction: 0.9, restitution: 0.2, density: 2.0 },
    description:
      '묵직하고 견고함. 필드를 제어하고 다른 원소의 움직임을 방해하는 데 특화됨.',
  },
  wind: {
    name: '바람',
    emoji: '💨',
    color: '#e5e7eb',
    physics: { mass: 0.3, friction: 0.01, restitution: 0.9, density: 0.1 },
    description:
      '자유롭고 예측 불가능함. 다른 원소와 만나 그 힘을 증폭시키는 촉매 역할.',
  },
};

// 상성 관계 정의
export const ELEMENT_REACTIONS: Record<
  string,
  {
    type: ReactionType;
    effect: 'strengthen' | 'weaken' | 'destroy' | 'combine';
    pointsA: number; // 첫 번째 원소가 받는 점수
    pointsB: number; // 두 번째 원소가 받는 점수
    description: string;
  }
> = {
  // 상생 관계
  'water-wood': {
    type: 'growth',
    effect: 'strengthen',
    pointsA: 1,
    pointsB: 1,
    description: '물이 나무를 성장시킵니다',
  },
  'wood-fire': {
    type: 'amplify',
    effect: 'strengthen',
    pointsA: 1,
    pointsB: 1,
    description: '나무가 불의 화력을 증폭시킵니다',
  },
  'fire-earth': {
    type: 'harden',
    effect: 'strengthen',
    pointsA: 1,
    pointsB: 1,
    description: '불이 흙을 경화시킵니다',
  },
  'earth-metal': {
    type: 'refine',
    effect: 'strengthen',
    pointsA: 1,
    pointsB: 1,
    description: '흙이 쇠를 제련합니다',
  },
  'metal-water': {
    type: 'generate',
    effect: 'strengthen',
    pointsA: 1,
    pointsB: 1,
    description: '쇠가 수원을 생성합니다',
  },
  'wind-wood': {
    type: 'seed',
    effect: 'strengthen',
    pointsA: 1,
    pointsB: 1,
    description: '바람이 나무의 씨앗을 퍼뜨립니다',
  },

  // 상극 관계
  'water-fire': {
    type: 'extinguish',
    effect: 'destroy',
    pointsA: 5,
    pointsB: 5,
    description: '물이 불을 소화시킵니다',
  },
  'fire-metal': {
    type: 'melt',
    effect: 'destroy',
    pointsA: 5,
    pointsB: 5,
    description: '불이 쇠를 용해시킵니다',
  },
  'metal-wood': {
    type: 'cut',
    effect: 'destroy',
    pointsA: 5,
    pointsB: 5,
    description: '쇠가 나무를 벌목합니다',
  },
  'metal-wind': {
    type: 'slash',
    effect: 'weaken',
    pointsA: 3,
    pointsB: 3,
    description: '쇠가 바람을 절삭합니다',
  },
  'wood-earth': {
    type: 'crack',
    effect: 'weaken',
    pointsA: 3,
    pointsB: 3,
    description: '나무가 흙에 균열을 만듭니다',
  },
  'earth-wind': {
    type: 'weathering',
    effect: 'weaken',
    pointsA: 2,
    pointsB: 2,
    description: '흙과 바람이 서로 풍화시킵니다',
  },
  'wind-earth': {
    type: 'weathering',
    effect: 'weaken',
    pointsA: 2,
    pointsB: 2,
    description: '바람과 흙이 서로 풍화시킵니다',
  },

  // 조합 반응
  'fire-water': {
    type: 'steam',
    effect: 'combine',
    pointsA: 10,
    pointsB: 10,
    description: '불과 물이 결합하여 증기가 됩니다',
  },
};
