'use client';

import {
  ELEMENT_NAMES,
  getElementReaction,
  getRandomElement,
} from '@/lib/element-system';
import { PhysicsEngine } from '@/lib/physics-engine';
import { useGameStore } from '@/store/game-store';
import { ElementInstance } from '@/types/game';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const GameContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #2c1810 0%, #5d4037 100%);
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20px;
  padding: 20px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }
`;

const SidePanel = styled.div`
  background: rgba(139, 69, 19, 0.2);
  border: 2px solid #8b4513;
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
`;

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Timer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.3);
  padding: 10px 20px;
  border-radius: 12px;
`;

const CanvasContainer = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 3px solid #8b4513;
  border-radius: 20px;
  padding: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const GameCanvas = styled.canvas`
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
`;

const SectionTitle = styled.h3`
  color: #ffd700;
  font-size: 18px;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const StatusItem = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  color: white;
`;

const RankingItem = styled.div<{ $rank: number }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${(props) =>
    props.$rank === 1
      ? 'linear-gradient(135deg, #ffd700, #ffed4a)'
      : props.$rank === 2
      ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)'
      : props.$rank === 3
      ? 'linear-gradient(135deg, #cd7f32, #daa520)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${(props) => (props.$rank <= 3 ? '#000' : '#fff')};
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-weight: ${(props) => (props.$rank === 1 ? 'bold' : 'normal')};
`;

const EventLog = styled.div`
  max-height: 300px;
  overflow-y: auto;
`;

const EventItem = styled.div<{ $type: 'synergy' | 'conflict' | 'system' }>`
  background: ${(props) =>
    props.$type === 'synergy'
      ? 'rgba(76, 175, 80, 0.2)'
      : props.$type === 'conflict'
      ? 'rgba(244, 67, 54, 0.2)'
      : 'rgba(96, 125, 139, 0.2)'};
  border-left: 4px solid
    ${(props) =>
      props.$type === 'synergy'
        ? '#4CAF50'
        : props.$type === 'conflict'
        ? '#F44336'
        : '#607D8B'};
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(139, 69, 19, 0.8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 15px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(139, 69, 19, 1);
    transform: translateY(-2px);
  }
`;

export default function GamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsEngineRef = useRef<PhysicsEngine | null>(null);
  const gameLoopRef = useRef<number | null>(null);
  const lastNeutralSpawnRef = useRef<number>(0);

  const {
    players,
    elements,
    phase,
    startTime,
    duration,
    addElement,
    updateElement,
    removeElement,
    addReaction,
    endGame,
    getVictoryConditions,
  } = useGameStore();

  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(duration);
  const [events, setEvents] = useState<
    Array<{ id: string; type: string; message: string; timestamp: number }>
  >([]);

  // 게임 초기화
  useEffect(() => {
    if (phase !== 'playing' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new PhysicsEngine();
    physicsEngineRef.current = engine;

    engine.initializeCanvas(canvas);
    engine.start();

    // 플레이어 원소들을 순차적으로 투입
    players.forEach((player, index) => {
      setTimeout(() => {
        const elementInstance: ElementInstance = {
          id: `player-${player.id}`,
          playerId: player.id,
          element: player.element,
          x: 300 + (Math.random() - 0.5) * 100,
          y: 50,
          health: 100,
          maxHealth: 100,
          isNeutral: false,
          reactionCount: 0,
          alchemyPoints: 0,
        };

        addElement(elementInstance);
        engine.addElement(elementInstance);

        setEvents((prev) => [
          ...prev,
          {
            id: `spawn-${Date.now()}`,
            type: 'system',
            message: `${player.name}의 ${
              ELEMENT_NAMES[player.element]
            } 원소가 투입되었습니다!`,
            timestamp: Date.now(),
          },
        ]);
      }, index * 1000);
    });

    return () => {
      engine.stop();
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [phase, players]);

  // 게임 루프
  useEffect(() => {
    if (phase !== 'playing' || !startTime) return;

    const gameLoop = () => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      const remaining = Math.max(0, duration - elapsed);

      setTimeLeft(remaining);

      // 게임 종료 조건 확인
      if (remaining <= 0) {
        endGame();
        router.push('/result');
        return;
      }

      // 중립 원소 보충 (20초마다)
      if (now - lastNeutralSpawnRef.current > 20000) {
        spawnNeutralElement();
        lastNeutralSpawnRef.current = now;
      }

      // 충돌 검사 및 반응 처리
      if (physicsEngineRef.current) {
        const collisions = physicsEngineRef.current.checkCollisions();
        collisions.forEach((collision) => {
          handleElementCollision(collision.element1Id, collision.element2Id);
        });
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [phase, startTime, duration]);

  const spawnNeutralElement = () => {
    if (!physicsEngineRef.current) return;

    const neutralElement = getRandomElement();
    const elementInstance: ElementInstance = {
      id: `neutral-${Date.now()}`,
      playerId: 'system',
      element: neutralElement,
      x: 300,
      y: 50,
      health: 100,
      maxHealth: 100,
      isNeutral: true,
      reactionCount: 0,
      alchemyPoints: 0,
    };

    addElement(elementInstance);
    physicsEngineRef.current.addElement(elementInstance);

    setEvents((prev) => [
      ...prev,
      {
        id: `neutral-${Date.now()}`,
        type: 'system',
        message: `중립 ${ELEMENT_NAMES[neutralElement]} 원소가 추가되었습니다`,
        timestamp: Date.now(),
      },
    ]);
  };

  const handleElementCollision = (element1Id: string, element2Id: string) => {
    const element1 = elements.find((e) => e.id === element1Id);
    const element2 = elements.find((e) => e.id === element2Id);

    if (!element1 || !element2) return;

    const reaction = getElementReaction(element1.element, element2.element);
    if (!reaction) return;

    // 반응 처리
    switch (reaction.effect) {
      case 'destroy':
        if (reaction.from === element1.element) {
          removeElement(element2.id);
          physicsEngineRef.current?.removeElement(element2.id);
          updateElement(element1.id, {
            alchemyPoints: element1.alchemyPoints + reaction.points,
            reactionCount: element1.reactionCount + 1,
          });
        } else {
          removeElement(element1.id);
          physicsEngineRef.current?.removeElement(element1.id);
          updateElement(element2.id, {
            alchemyPoints: element2.alchemyPoints + reaction.points,
            reactionCount: element2.reactionCount + 1,
          });
        }
        break;

      case 'weaken':
        const targetElement =
          reaction.from === element1.element ? element2 : element1;
        const sourceElement =
          reaction.from === element1.element ? element1 : element2;

        updateElement(targetElement.id, {
          health: Math.max(0, targetElement.health - 30),
          reactionCount: targetElement.reactionCount + 1,
        });
        updateElement(sourceElement.id, {
          alchemyPoints: sourceElement.alchemyPoints + reaction.points,
          reactionCount: sourceElement.reactionCount + 1,
        });
        break;

      case 'strengthen':
        const enhancedElement =
          reaction.to === element1.element ? element1 : element2;
        const enhancerElement =
          reaction.from === element1.element ? element1 : element2;

        updateElement(enhancedElement.id, {
          health: Math.min(
            enhancedElement.maxHealth,
            enhancedElement.health + 20
          ),
          reactionCount: enhancedElement.reactionCount + 1,
        });
        updateElement(enhancerElement.id, {
          alchemyPoints: enhancerElement.alchemyPoints + reaction.points,
          reactionCount: enhancerElement.reactionCount + 1,
        });
        break;

      case 'combine':
        // 증기화 반응
        if (physicsEngineRef.current) {
          const midX = (element1.x + element2.x) / 2;
          const midY = (element1.y + element2.y) / 2;
          physicsEngineRef.current.createExplosion(midX, midY, 0.03);

          // 바람 원소 생성
          const windElement: ElementInstance = {
            id: `wind-${Date.now()}`,
            playerId: 'system',
            element: 'wind',
            x: midX,
            y: midY,
            health: 100,
            maxHealth: 100,
            isNeutral: true,
            reactionCount: 0,
            alchemyPoints: 0,
          };

          addElement(windElement);
          physicsEngineRef.current.addElement(windElement);
        }

        removeElement(element1.id);
        removeElement(element2.id);
        physicsEngineRef.current?.removeElement(element1.id);
        physicsEngineRef.current?.removeElement(element2.id);
        break;
    }

    // 이벤트 로그 추가
    addReaction({ reaction, elementIds: [element1Id, element2Id] });
    setEvents((prev) => [
      ...prev,
      {
        id: `reaction-${Date.now()}`,
        type: reaction.effect === 'strengthen' ? 'synergy' : 'conflict',
        message: `${ELEMENT_NAMES[element1.element]}과 ${
          ELEMENT_NAMES[element2.element]
        }이 ${reaction.type} 반응!`,
        timestamp: Date.now(),
      },
    ]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 순위 계산
  const rankings = players
    .map((player) => {
      const playerElements = elements.filter((e) => e.playerId === player.id);
      const totalPoints = playerElements.reduce(
        (sum, e) => sum + e.alchemyPoints,
        0
      );
      return { player, points: totalPoints };
    })
    .sort((a, b) => b.points - a.points);

  const survivorCount = elements.filter((e) => !e.isNeutral).length;
  const { philosophersStone } = getVictoryConditions();

  if (phase !== 'playing') {
    router.push('/');
    return null;
  }

  return (
    <GameContainer>
      <BackButton onClick={() => router.push('/')}>← 대기실로</BackButton>

      <SidePanel>
        <SectionTitle>실시간 전황판</SectionTitle>

        <StatusItem>
          <strong>생존자: {survivorCount}명</strong>
        </StatusItem>

        <SectionTitle>최고의 연금술사</SectionTitle>
        {rankings.slice(0, 3).map((ranking, index) => (
          <RankingItem key={ranking.player.id} $rank={index + 1}>
            <span>{ranking.player.name}</span>
            <span>{ranking.points}점</span>
          </RankingItem>
        ))}

        {philosophersStone && (
          <div>
            <SectionTitle>현자의 돌 후보</SectionTitle>
            <StatusItem>
              {philosophersStone.name} (
              {ELEMENT_NAMES[philosophersStone.element]})
            </StatusItem>
          </div>
        )}
      </SidePanel>

      <MainArea>
        <Timer>{formatTime(timeLeft)}</Timer>

        <CanvasContainer>
          <GameCanvas ref={canvasRef} width={600} height={800} />
        </CanvasContainer>
      </MainArea>

      <SidePanel>
        <SectionTitle>이벤트 로그</SectionTitle>

        <EventLog>
          {events
            .slice(-20)
            .reverse()
            .map((event) => (
              <EventItem
                key={event.id}
                $type={event.type as 'synergy' | 'conflict' | 'system'}
              >
                {event.message}
              </EventItem>
            ))}
        </EventLog>
      </SidePanel>
    </GameContainer>
  );
}
