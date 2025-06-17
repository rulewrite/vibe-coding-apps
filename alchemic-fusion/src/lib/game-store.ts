import { ElementType } from '@/styles/theme';
import { create } from 'zustand';

export interface Participant {
  name: string;
  element: ElementType;
  id: string;
}

export interface GameStats {
  alchemyScore: number; // 연금 점수
  reactionCount: number; // 반응 횟수
  isAlive: boolean; // 생존 여부
}

export interface GameState {
  // 게임 설정
  participants: Participant[];
  gameStats: Record<string, GameStats>;

  // 게임 진행 상태
  isGameStarted: boolean;
  gameStartTime: number | null;
  gameEndTime: number | null;

  // 액션들
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (id: string) => void;
  startGame: () => void;
  endGame: () => void;
  updateGameStats: (participantId: string, stats: Partial<GameStats>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // 초기 상태
  participants: [],
  gameStats: {},
  isGameStarted: false,
  gameStartTime: null,
  gameEndTime: null,

  // 참가자 관리
  setParticipants: (participants) => {
    const gameStats: Record<string, GameStats> = {};
    participants.forEach((p) => {
      gameStats[p.id] = {
        alchemyScore: 0,
        reactionCount: 0,
        isAlive: true,
      };
    });

    set({ participants, gameStats });
  },

  addParticipant: (participant) => {
    const currentParticipants = get().participants;
    const newParticipants = [...currentParticipants, participant];
    const gameStats = { ...get().gameStats };

    gameStats[participant.id] = {
      alchemyScore: 0,
      reactionCount: 0,
      isAlive: true,
    };

    set({ participants: newParticipants, gameStats });
  },

  removeParticipant: (id) => {
    const currentParticipants = get().participants;
    const newParticipants = currentParticipants.filter((p) => p.id !== id);
    const gameStats = { ...get().gameStats };
    delete gameStats[id];

    set({ participants: newParticipants, gameStats });
  },

  // 게임 진행
  startGame: () => {
    set({
      isGameStarted: true,
      gameStartTime: Date.now(),
      gameEndTime: null,
    });
  },

  endGame: () => {
    set({
      isGameStarted: false,
      gameEndTime: Date.now(),
    });
  },

  updateGameStats: (participantId, stats) => {
    const currentStats = get().gameStats;
    set({
      gameStats: {
        ...currentStats,
        [participantId]: {
          ...currentStats[participantId],
          ...stats,
        },
      },
    });
  },

  resetGame: () => {
    set({
      participants: [],
      gameStats: {},
      isGameStarted: false,
      gameStartTime: null,
      gameEndTime: null,
    });
  },
}));
