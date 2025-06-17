'use client';

import { useGameStore } from '@/lib/game-store';
import { PhysicsEngine, ReactionResult } from '@/lib/physics-engine';
import { ElementType } from '@/styles/theme';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

// 메인 컨테이너
const GameContainer = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 1rem;
  background: ${(props) => props.theme.gradients.background};
  padding: 1rem;
  position: relative;
  overflow: hidden;

  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
`;

// 좌측 패널 - 실시간 전황판
const StatsPanel = styled(motion.div)`
  background: ${(props) => props.theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
`;

const StatsItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  font-size: 0.9rem;
`;

const RankingItem = styled(motion.div)<{ element: ElementType; rank: number }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: ${(props) =>
    props.rank === 1
      ? 'rgba(245, 158, 11, 0.2)'
      : props.rank === 2
      ? 'rgba(156, 163, 175, 0.2)'
      : props.rank === 3
      ? 'rgba(180, 83, 9, 0.2)'
      : 'rgba(0, 0, 0, 0.2)'};
  border-radius: 0.5rem;
  border-left: 3px solid
    ${(props) => props.theme.colors.elements[props.element]};
`;

// 중앙 - 게임 플레이 영역
const GamePlayArea = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const GameHeader = styled.div`
  text-align: center;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const GameTitle = styled.h1`
  font-size: 2rem;
  color: ${(props) => props.theme.colors.text.primary};
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  margin-bottom: 0.5rem;
`;

const GameTimer = styled.div`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.text.accent};
  font-weight: bold;
`;

const PhysicsCanvas = styled.canvas`
  width: 100%;
  height: 500px;
  background: ${(props) => props.theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  position: relative;
`;

const GameControls = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const ControlButton = styled(motion.button)<{ variant?: 'primary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background: ${(props) =>
    props.variant === 'danger'
      ? props.theme.colors.danger
      : props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text.primary};
  font-weight: bold;
  cursor: pointer;
  transition: ${(props) => props.theme.animations.transition};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.medium};
  }
`;

// 우측 패널 - 이벤트 로그
const EventPanel = styled(motion.div)`
  background: ${(props) => props.theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
`;

const EventLog = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const EventItem = styled(motion.div)<{
  type: 'synergy' | 'conflict' | 'system' | 'combination';
}>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  border-left: 3px solid
    ${(props) =>
      props.type === 'synergy'
        ? props.theme.colors.reactions.synergy
        : props.type === 'conflict'
        ? props.theme.colors.reactions.conflict
        : props.type === 'combination'
        ? props.theme.colors.reactions.combination
        : props.theme.colors.reactions.neutral};
  font-size: 0.9rem;
`;

const EventTime = styled.span`
  color: ${(props) => props.theme.colors.text.secondary};
  font-size: 0.8rem;
  margin-right: 0.5rem;
  min-width: 60px;
`;

const BackButton = styled(motion.button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  color: ${(props) => props.theme.colors.text.primary};
  cursor: pointer;
  transition: ${(props) => props.theme.animations.transition};
  z-index: 100;

  &:hover {
    background: rgba(0, 0, 0, 0.5);
    transform: scale(1.05);
  }
`;

// 게임 이벤트 타입
interface GameEvent {
  id: string;
  type: 'synergy' | 'conflict' | 'system' | 'combination';
  message: string;
  timestamp: number;
  participants?: string[];
}

const elements = [
  { key: 'fire' as ElementType, symbol: '🔥', name: '불' },
  { key: 'water' as ElementType, symbol: '💧', name: '물' },
  { key: 'wood' as ElementType, symbol: '🌱', name: '나무' },
  { key: 'metal' as ElementType, symbol: '⚔️', name: '쇠' },
  { key: 'earth' as ElementType, symbol: '🗿', name: '흙' },
  { key: 'wind' as ElementType, symbol: '💨', name: '바람' },
];

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const minorityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    participants,
    gameStats,
    isGameStarted,
    gameStartTime,
    startGame,
    endGame,
    updateGameStats,
  } = useGameStore();

  const [gameTime, setGameTime] = useState(0);
  const [events, setEvents] = useState<GameEvent[]>([]);

  // 반응 이벤트 처리
  const handleReaction = useCallback(
    (reaction: ReactionResult) => {
      // 이벤트 로그에 추가
      const newEvent: GameEvent = {
        id: `event-${Date.now()}-${Math.random()}`,
        type: reaction.type,
        message: reaction.message,
        timestamp: Date.now(),
        participants: reaction.participants,
      };

      setEvents((prev) => [newEvent, ...prev].slice(0, 20)); // 최대 20개만 유지

      // 게임 스탯 업데이트
      Object.entries(reaction.scoreChanges).forEach(
        ([participantId, score]) => {
          updateGameStats(participantId, {
            alchemyScore: (gameStats[participantId]?.alchemyScore || 0) + score,
          });
        }
      );
    },
    [gameStats, updateGameStats]
  );

  // 게임 참가자가 없으면 메인으로 리다이렉트
  useEffect(() => {
    if (participants.length === 0) {
      router.push('/');
      return;
    }

    // 게임이 시작되지 않았으면 자동 시작
    if (!isGameStarted) {
      startGame();
    }
  }, [participants, isGameStarted, router, startGame]);

  // 물리 엔진 초기화
  useEffect(() => {
    if (!canvasRef.current || !isGameStarted || physicsEngineRef.current)
      return;

    const engine = new PhysicsEngine(canvasRef.current, handleReaction);
    physicsEngineRef.current = engine;

    // 참가자들의 원소 추가
    engine.addParticipants(participants);

    // 게임 시작
    engine.start();

    // 게임 시작 이벤트
    setEvents([
      {
        id: 'start',
        type: 'system',
        message: '🧪 연금술 실험이 시작되었습니다!',
        timestamp: Date.now(),
      },
    ]);

    // 원소 투입 완료 이벤트
    setTimeout(() => {
      setEvents((prev) => [
        {
          id: 'elements-added',
          type: 'system',
          message: `✨ ${participants.length}개의 원소가 플라스크에 투입되었습니다!`,
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }, 2000);

    return () => {
      if (physicsEngineRef.current) {
        physicsEngineRef.current.stop();
        physicsEngineRef.current = null;
      }
    };
  }, [canvasRef, isGameStarted, participants, handleReaction]);

  // 게임 루프 (통계 업데이트)
  useEffect(() => {
    if (!physicsEngineRef.current || !isGameStarted) return;

    gameLoopRef.current = setInterval(() => {
      const engine = physicsEngineRef.current;
      if (!engine) return;

      // 물리 엔진에서 최신 통계 가져오기
      const latestStats = engine.getElementStats();

      // 게임 스토어 업데이트
      Object.entries(latestStats).forEach(([participantId, stats]) => {
        updateGameStats(participantId, stats);
      });

      // 생존자 확인
      const aliveParticipants = engine.getAliveParticipants();

      // 승리 조건 확인 (1명만 남았거나 3분 경과)
      const gameElapsed = Date.now() - (gameStartTime || 0);
      if (aliveParticipants.length <= 1 || gameElapsed > 180000) {
        // 3분
        handleEndGame();
      }
    }, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isGameStarted, gameStartTime, updateGameStats]);

  // 20초마다 소수 원소 보충
  useEffect(() => {
    if (!physicsEngineRef.current || !isGameStarted) return;

    minorityTimerRef.current = setInterval(() => {
      const engine = physicsEngineRef.current;
      if (!engine) return;

      engine.addMinorityElements();

      setEvents((prev) => [
        {
          id: `minority-${Date.now()}`,
          type: 'system',
          message: '🌀 소수 원소들이 플라스크에 보충되었습니다!',
          timestamp: Date.now(),
        },
        ...prev,
      ]);
    }, 20000);

    return () => {
      if (minorityTimerRef.current) {
        clearInterval(minorityTimerRef.current);
      }
    };
  }, [isGameStarted]);

  // 게임 타이머
  useEffect(() => {
    if (!gameStartTime) return;

    const interval = setInterval(() => {
      setGameTime(Math.floor((Date.now() - gameStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStartTime]);

  // 게임 통계 계산
  const aliveParticipants = participants.filter(
    (p) => gameStats[p.id]?.isAlive !== false
  );
  const topAlchemists = participants
    .map((p) => ({
      ...p,
      score: gameStats[p.id]?.alchemyScore || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const philosophersStone = participants
    .map((p) => ({
      ...p,
      reactions: gameStats[p.id]?.reactionCount || 0,
    }))
    .sort((a, b) => a.reactions - b.reactions)
    .slice(0, 2);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndGame = () => {
    // 물리 엔진 정리
    if (physicsEngineRef.current) {
      physicsEngineRef.current.stop();
      physicsEngineRef.current = null;
    }

    // 타이머 정리
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    if (minorityTimerRef.current) {
      clearInterval(minorityTimerRef.current);
    }

    endGame();
    router.push('/result');
  };

  const handleBackToLobby = () => {
    // 물리 엔진 정리
    if (physicsEngineRef.current) {
      physicsEngineRef.current.stop();
      physicsEngineRef.current = null;
    }

    router.push('/');
  };

  return (
    <GameContainer>
      <BackButton
        onClick={handleBackToLobby}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← 대기실로
      </BackButton>

      {/* 좌측 패널 - 실시간 전황 */}
      <StatsPanel
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle>📊 실시간 전황</SectionTitle>

        <StatsItem>
          <span>생존자</span>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}>
            {aliveParticipants.length} / {participants.length}
          </span>
        </StatsItem>

        <div style={{ marginTop: '1.5rem' }}>
          <SectionTitle>🏆 최고의 연금술사</SectionTitle>
          {topAlchemists.map((participant, index) => {
            const elementInfo = elements.find(
              (e) => e.key === participant.element
            );
            return (
              <RankingItem
                key={participant.id}
                element={participant.element}
                rank={index + 1}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </span>
                <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                  {elementInfo?.symbol}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{participant.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {participant.score}점
                  </div>
                </div>
              </RankingItem>
            );
          })}
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <SectionTitle>💎 현자의 돌 후보</SectionTitle>
          {philosophersStone.map((participant) => {
            const elementInfo = elements.find(
              (e) => e.key === participant.element
            );
            return (
              <StatsItem key={participant.id}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                    {elementInfo?.symbol}
                  </span>
                  <span>{participant.name}</span>
                </div>
                <span style={{ color: '#06b6d4' }}>
                  {participant.reactions}회
                </span>
              </StatsItem>
            );
          })}
        </div>
      </StatsPanel>

      {/* 중앙 - 게임 플레이 영역 */}
      <GamePlayArea>
        <GameHeader>
          <GameTitle>연금술의 향연</GameTitle>
          <GameTimer>⏱️ {formatTime(gameTime)}</GameTimer>
          <div
            style={{
              fontSize: '0.9rem',
              color: '#9ca3af',
              marginTop: '0.5rem',
            }}
          >
            원소들이 충돌하며 신비로운 반응을 일으킵니다
          </div>
        </GameHeader>

        <PhysicsCanvas ref={canvasRef} width={800} height={500} />

        <GameControls>
          <ControlButton
            onClick={handleEndGame}
            variant="danger"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            실험 종료
          </ControlButton>
        </GameControls>
      </GamePlayArea>

      {/* 우측 패널 - 이벤트 로그 */}
      <EventPanel
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <SectionTitle>📜 이벤트 로그</SectionTitle>

        <EventLog>
          {events.map((event) => (
            <EventItem
              key={event.id}
              type={event.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EventTime>
                {new Date(event.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </EventTime>
              <span>{event.message}</span>
            </EventItem>
          ))}
        </EventLog>
      </EventPanel>
    </GameContainer>
  );
}
