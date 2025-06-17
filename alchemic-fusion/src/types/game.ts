export type ElementType =
  | 'fire'
  | 'water'
  | 'wood'
  | 'metal'
  | 'earth'
  | 'wind';

export interface Player {
  id: string;
  name: string;
  element: ElementType;
  isRandom: boolean;
}

export type ReactionType =
  | 'growth'
  | 'amplify'
  | 'harden'
  | 'refine'
  | 'source'
  | 'spread'
  | 'vaporize'
  | 'extinguish'
  | 'melt'
  | 'cut'
  | 'slice'
  | 'crack'
  | 'erosion'
  | 'barrier';

export interface Reaction {
  type: ReactionType;
  from: ElementType;
  to: ElementType | null;
  effect: 'strengthen' | 'weaken' | 'destroy' | 'mutual_weaken' | 'combine';
  points: number;
}

export interface ElementInstance {
  id: string;
  playerId: string;
  element: ElementType;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  isNeutral: boolean;
  reactionCount: number;
  alchemyPoints: number;
}

export interface GameState {
  phase: 'waiting' | 'playing' | 'finished';
  players: Player[];
  elements: ElementInstance[];
  reactions: Array<{
    timestamp: number;
    reaction: Reaction;
    elementIds: string[];
  }>;
  startTime: number | null;
  duration: number; // 3분 = 180초
}

export interface VictoryConditions {
  lastSurvivor: Player | null;
  masterAlchemist: Player | null;
  philosophersStone: Player | null;
}
