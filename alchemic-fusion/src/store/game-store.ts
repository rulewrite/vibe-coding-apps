import { getRandomElement } from '@/lib/element-system';
import {
  ElementInstance,
  ElementType,
  GameState,
  Player,
  Reaction,
  VictoryConditions,
} from '@/types/game';
import { create } from 'zustand';

interface GameStore extends GameState {
  // Actions
  addPlayer: (
    name: string,
    element: ElementType | null,
    isRandom: boolean
  ) => void;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  endGame: () => void;
  addElement: (element: ElementInstance) => void;
  updateElement: (elementId: string, updates: Partial<ElementInstance>) => void;
  removeElement: (elementId: string) => void;
  addReaction: (reaction: { reaction: Reaction; elementIds: string[] }) => void;
  reset: () => void;
  getVictoryConditions: () => VictoryConditions;
}

const initialState: GameState = {
  phase: 'waiting',
  players: [],
  elements: [],
  reactions: [],
  startTime: null,
  duration: 180, // 3분
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  addPlayer: (name: string, element: ElementType | null, isRandom: boolean) => {
    const finalElement = element || getRandomElement();
    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random()}`,
      name,
      element: finalElement,
      isRandom,
    };

    set((state) => ({
      players: [...state.players, newPlayer],
    }));
  },

  removePlayer: (playerId: string) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    }));
  },

  startGame: () => {
    set({
      phase: 'playing',
      startTime: Date.now(),
      elements: [],
      reactions: [],
    });
  },

  endGame: () => {
    set({ phase: 'finished' });
  },

  addElement: (element: ElementInstance) => {
    set((state) => ({
      elements: [...state.elements, element],
    }));
  },

  updateElement: (elementId: string, updates: Partial<ElementInstance>) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    }));
  },

  removeElement: (elementId: string) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== elementId),
    }));
  },

  addReaction: (reaction: { reaction: Reaction; elementIds: string[] }) => {
    set((state) => ({
      reactions: [
        ...state.reactions,
        {
          timestamp: Date.now(),
          ...reaction,
        },
      ],
    }));
  },

  reset: () => {
    set(initialState);
  },

  getVictoryConditions: (): VictoryConditions => {
    const state = get();
    const playerElements = state.elements.filter((el) => !el.isNeutral);

    // 최후의 생존자
    let lastSurvivor: Player | null = null;
    if (playerElements.length === 1) {
      const survivorElement = playerElements[0];
      lastSurvivor =
        state.players.find((p) => p.id === survivorElement.playerId) || null;
    }

    // 최고의 연금술사 (연금 점수가 가장 높은 플레이어)
    let masterAlchemist: Player | null = null;
    let maxPoints = -1;
    for (const player of state.players) {
      const playerElementsData = state.elements.filter(
        (el) => el.playerId === player.id
      );
      const totalPoints = playerElementsData.reduce(
        (sum, el) => sum + el.alchemyPoints,
        0
      );
      if (totalPoints > maxPoints) {
        maxPoints = totalPoints;
        masterAlchemist = player;
      }
    }

    // 현자의 돌 (반응 횟수가 가장 적은 플레이어)
    let philosophersStone: Player | null = null;
    let minReactions = Infinity;
    for (const player of state.players) {
      const playerElementsData = state.elements.filter(
        (el) => el.playerId === player.id
      );
      const totalReactions = playerElementsData.reduce(
        (sum, el) => sum + el.reactionCount,
        0
      );
      if (totalReactions < minReactions && playerElementsData.length > 0) {
        minReactions = totalReactions;
        philosophersStone = player;
      }
    }

    return {
      lastSurvivor,
      masterAlchemist,
      philosophersStone,
    };
  },
}));
