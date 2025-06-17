'use client';

import { ELEMENT_COLORS, ELEMENT_NAMES } from '@/lib/element-system';
import { useGameStore } from '@/store/game-store';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const sparkle = keyframes`
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 0.8; }
`;

const ResultContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.5);
  margin-bottom: 40px;
  text-align: center;
  animation: ${fadeIn} 1s ease-out;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const WinnerSection = styled(motion.div)`
  background: rgba(255, 215, 0, 0.1);
  border: 3px solid #ffd700;
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 30px;
  text-align: center;
  min-width: 400px;
  position: relative;

  @media (max-width: 768px) {
    min-width: 300px;
    padding: 20px;
  }

  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: linear-gradient(45deg, #ffd700, transparent, #ffd700);
    border-radius: 25px;
    z-index: -1;
    animation: ${sparkle} 3s infinite;
  }
`;

const WinnerCategory = styled.h2`
  font-size: 24px;
  color: #ffd700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const WinnerName = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
`;

const WinnerElement = styled.div<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: ${(props) => props.$color}44;
  border: 2px solid ${(props) => props.$color};
  border-radius: 25px;
  padding: 8px 16px;
  color: white;
  font-weight: bold;
  margin: 0 auto;
`;

const ElementIcon = styled.div<{ $color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const StatsSection = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 30px;
  width: 100%;
  max-width: 800px;
`;

const StatsTitle = styled.h3`
  color: #ffd700;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
`;

const PlayerStatsGrid = styled.div`
  display: grid;
  gap: 16px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PlayerStatCard = styled.div<{ $rank: number }>`
  background: ${(props) =>
    props.$rank === 1
      ? 'linear-gradient(135deg, #ffd700, #ffed4a)'
      : props.$rank === 2
      ? 'linear-gradient(135deg, #c0c0c0, #e5e5e5)'
      : props.$rank === 3
      ? 'linear-gradient(135deg, #cd7f32, #daa520)'
      : 'rgba(255, 255, 255, 0.1)'};
  color: ${(props) => (props.$rank <= 3 ? '#000' : '#fff')};
  border-radius: 12px;
  padding: 16px;
  border: ${(props) =>
    props.$rank === 1
      ? '2px solid #ffd700'
      : '1px solid rgba(255,255,255,0.2)'};
`;

const PlayerStatName = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 14px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 16px 32px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${(props) =>
    props.$primary
      ? `
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
    color: white;
    box-shadow: 0 8px 24px rgba(255, 107, 107, 0.3);
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
    }
  `
      : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
  `}

  &:active {
    transform: translateY(0);
  }
`;

const Fireworks = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
`;

export default function ResultPage() {
  const { players, elements, phase, getVictoryConditions, reset } =
    useGameStore();

  const router = useRouter();
  const [showStats, setShowStats] = useState(false);
  const victoryConditions = getVictoryConditions();

  useEffect(() => {
    // 2초 후 통계 표시
    const timer = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (phase !== 'finished') {
    router.push('/');
    return null;
  }

  // 플레이어 통계 계산
  const playerStats = players
    .map((player) => {
      const playerElements = elements.filter((e) => e.playerId === player.id);
      const totalPoints = playerElements.reduce(
        (sum, e) => sum + e.alchemyPoints,
        0
      );
      const totalReactions = playerElements.reduce(
        (sum, e) => sum + e.reactionCount,
        0
      );
      const isAlive = playerElements.length > 0;

      const achievements = [];
      if (victoryConditions.lastSurvivor?.id === player.id)
        achievements.push('🏆 최후의 생존자');
      if (victoryConditions.masterAlchemist?.id === player.id)
        achievements.push('🧪 최고의 연금술사');
      if (victoryConditions.philosophersStone?.id === player.id)
        achievements.push('💎 현자의 돌');

      return {
        player,
        totalPoints,
        totalReactions,
        isAlive,
        achievements,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const handlePlayAgain = () => {
    reset();
    router.push('/');
  };

  return (
    <ResultContainer>
      <Fireworks>
        {/* 여기에 파티클 효과나 폭죽 애니메이션을 추가할 수 있음 */}
      </Fireworks>

      <Title>전설의 탄생</Title>

      <AnimatePresence>
        {victoryConditions.lastSurvivor && (
          <WinnerSection
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <WinnerCategory>🏆 최후의 생존자</WinnerCategory>
            <WinnerName>{victoryConditions.lastSurvivor.name}</WinnerName>
            <WinnerElement
              $color={ELEMENT_COLORS[victoryConditions.lastSurvivor.element]}
            >
              <ElementIcon
                $color={ELEMENT_COLORS[victoryConditions.lastSurvivor.element]}
              >
                {ELEMENT_NAMES[victoryConditions.lastSurvivor.element]}
              </ElementIcon>
              {ELEMENT_NAMES[victoryConditions.lastSurvivor.element]} 원소
            </WinnerElement>
          </WinnerSection>
        )}

        {victoryConditions.masterAlchemist && (
          <WinnerSection
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <WinnerCategory>🧪 최고의 연금술사</WinnerCategory>
            <WinnerName>{victoryConditions.masterAlchemist.name}</WinnerName>
            <WinnerElement
              $color={ELEMENT_COLORS[victoryConditions.masterAlchemist.element]}
            >
              <ElementIcon
                $color={
                  ELEMENT_COLORS[victoryConditions.masterAlchemist.element]
                }
              >
                {ELEMENT_NAMES[victoryConditions.masterAlchemist.element]}
              </ElementIcon>
              {ELEMENT_NAMES[victoryConditions.masterAlchemist.element]} 원소
            </WinnerElement>
          </WinnerSection>
        )}

        {victoryConditions.philosophersStone && (
          <WinnerSection
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.5 }}
          >
            <WinnerCategory>💎 현자의 돌</WinnerCategory>
            <WinnerName>{victoryConditions.philosophersStone.name}</WinnerName>
            <WinnerElement
              $color={
                ELEMENT_COLORS[victoryConditions.philosophersStone.element]
              }
            >
              <ElementIcon
                $color={
                  ELEMENT_COLORS[victoryConditions.philosophersStone.element]
                }
              >
                {ELEMENT_NAMES[victoryConditions.philosophersStone.element]}
              </ElementIcon>
              {ELEMENT_NAMES[victoryConditions.philosophersStone.element]} 원소
            </WinnerElement>
          </WinnerSection>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <StatsSection>
              <StatsTitle>상세 결과</StatsTitle>
              <PlayerStatsGrid>
                {playerStats.map((stat, index) => (
                  <PlayerStatCard key={stat.player.id} $rank={index + 1}>
                    <PlayerStatName>
                      <ElementIcon $color={ELEMENT_COLORS[stat.player.element]}>
                        {ELEMENT_NAMES[stat.player.element]}
                      </ElementIcon>
                      {stat.player.name}
                      {stat.player.isRandom && (
                        <span style={{ fontSize: '12px', opacity: 0.7 }}>
                          (랜덤)
                        </span>
                      )}
                    </PlayerStatName>

                    <StatRow>
                      <span>연금 점수:</span>
                      <strong>{stat.totalPoints}점</strong>
                    </StatRow>

                    <StatRow>
                      <span>반응 횟수:</span>
                      <span>{stat.totalReactions}회</span>
                    </StatRow>

                    <StatRow>
                      <span>생존 여부:</span>
                      <span>{stat.isAlive ? '✅ 생존' : '❌ 소멸'}</span>
                    </StatRow>

                    {stat.achievements.length > 0 && (
                      <div
                        style={{
                          marginTop: '8px',
                          paddingTop: '8px',
                          borderTop: '1px solid rgba(0,0,0,0.1)',
                        }}
                      >
                        {stat.achievements.map((achievement, i) => (
                          <div
                            key={i}
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                          >
                            {achievement}
                          </div>
                        ))}
                      </div>
                    )}
                  </PlayerStatCard>
                ))}
              </PlayerStatsGrid>
            </StatsSection>

            <ActionButtons>
              <ActionButton $primary onClick={handlePlayAgain}>
                다시 실험하기
              </ActionButton>
              <ActionButton onClick={() => window.location.reload()}>
                결과 공유하기
              </ActionButton>
            </ActionButtons>
          </motion.div>
        )}
      </AnimatePresence>
    </ResultContainer>
  );
}
