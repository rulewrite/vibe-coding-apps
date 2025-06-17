'use client';

import { useGameStore } from '@/lib/game-store';
import { ElementType } from '@/styles/theme';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

// 메인 컨테이너
const ResultContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.gradients.background};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

// 스포트라이트 효과
const Spotlight = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at 50% 50%,
    transparent 200px,
    rgba(0, 0, 0, 0.8) 400px
  );
  pointer-events: none;
`;

// 결과 발표 영역
const AnnouncementArea = styled.div`
  text-align: center;
  z-index: 10;
  position: relative;
`;

const AnnouncementTitle = styled(motion.h1)`
  font-size: 3rem;
  color: ${(props) => props.theme.colors.text.primary};
  text-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
  margin-bottom: 2rem;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    font-size: 2rem;
  }
`;

const WinnerCard = styled(motion.div)<{
  category: 'philosopher' | 'alchemist' | 'survivor';
}>`
  background: ${(props) => {
    switch (props.category) {
      case 'philosopher':
        return 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(8, 145, 178, 0.3) 100%)';
      case 'alchemist':
        return 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.3) 100%)';
      case 'survivor':
        return 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(124, 58, 237, 0.3) 100%)';
      default:
        return 'rgba(0, 0, 0, 0.3)';
    }
  }};
  backdrop-filter: blur(20px);
  border: 2px solid
    ${(props) => {
      switch (props.category) {
        case 'philosopher':
          return props.theme.colors.secondary;
        case 'alchemist':
          return props.theme.colors.accent;
        case 'survivor':
          return props.theme.colors.primary;
        default:
          return 'rgba(255, 255, 255, 0.2)';
      }
    }};
  border-radius: 2rem;
  padding: 3rem;
  margin: 2rem;
  min-width: 400px;
  position: relative;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    min-width: 300px;
    padding: 2rem;
  }
`;

const CategoryTitle = styled.h2<{
  category: 'philosopher' | 'alchemist' | 'survivor';
}>`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${(props) => {
    switch (props.category) {
      case 'philosopher':
        return props.theme.colors.secondary;
      case 'alchemist':
        return props.theme.colors.accent;
      case 'survivor':
        return props.theme.colors.primary;
      default:
        return props.theme.colors.text.primary;
    }
  }};
`;

const WinnerInfo = styled.div`
  text-align: center;
`;

const WinnerElement = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const WinnerName = styled.h3`
  font-size: 2.5rem;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: 0.5rem;
  font-weight: bold;
`;

const WinnerStats = styled.p`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.text.secondary};
`;

// 상세 결과 테이블
const DetailedResults = styled(motion.div)`
  background: ${(props) => props.theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  margin-top: 2rem;
  max-width: 800px;
  width: 100%;
`;

const ResultsTable = styled.div`
  display: grid;
  grid-template-columns: 50px 60px 1fr 80px 80px 80px;
  gap: 1rem;
  align-items: center;
`;

const TableHeader = styled.div`
  font-weight: bold;
  color: ${(props) => props.theme.colors.text.primary};
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  font-size: 0.9rem;
`;

const TableRow = styled(motion.div)<{ element: ElementType }>`
  display: contents;

  & > div {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    text-align: center;
    color: ${(props) => props.theme.colors.text.primary};
  }

  & > div:first-child {
    color: ${(props) => props.theme.colors.elements[props.element]};
    font-weight: bold;
  }

  & > div:nth-child(3) {
    text-align: left;
  }
`;

// 액션 버튼들
const ActionButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 3rem;
  justify-content: center;

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled(motion.button)<{
  variant?: 'primary' | 'secondary';
}>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  background: ${(props) =>
    props.variant === 'secondary'
      ? 'rgba(156, 163, 175, 0.8)'
      : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'};
  color: ${(props) => props.theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: ${(props) => props.theme.animations.transition};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
  }
`;

// 폭죽 효과
const Firework = styled(motion.div)`
  position: absolute;
  width: 10px;
  height: 10px;
  background: radial-gradient(circle, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
`;

const elements = [
  { key: 'fire' as ElementType, symbol: '🔥', name: '불' },
  { key: 'water' as ElementType, symbol: '💧', name: '물' },
  { key: 'wood' as ElementType, symbol: '🌱', name: '나무' },
  { key: 'metal' as ElementType, symbol: '⚔️', name: '쇠' },
  { key: 'earth' as ElementType, symbol: '🗿', name: '흙' },
  { key: 'wind' as ElementType, symbol: '💨', name: '바람' },
];

export default function ResultPage() {
  const router = useRouter();
  const { participants, gameStats, resetGame } = useGameStore();

  const [currentWinner, setCurrentWinner] = useState<
    'philosopher' | 'alchemist' | 'survivor' | 'complete'
  >('philosopher');
  const [showFireworks, setShowFireworks] = useState(false);

  // 게임 데이터가 없으면 메인으로 리다이렉트
  useEffect(() => {
    if (participants.length === 0) {
      router.push('/');
      return;
    }
  }, [participants, router]);

  // 결과 발표 시퀀스
  useEffect(() => {
    const sequence = async () => {
      // 현자의 돌 발표 (3초)
      setTimeout(() => setCurrentWinner('alchemist'), 3000);
      // 최고의 연금술사 발표 (6초)
      setTimeout(() => setCurrentWinner('survivor'), 6000);
      // 최후의 생존자 발표 (9초)
      setTimeout(() => {
        setCurrentWinner('complete');
        setShowFireworks(true);
      }, 9000);
      // 폭죽 종료 (12초)
      setTimeout(() => setShowFireworks(false), 12000);
    };

    sequence();
  }, []);

  // 수상자 계산
  const philosophersStone = participants
    .map((p) => ({
      ...p,
      reactions: gameStats[p.id]?.reactionCount || 0,
    }))
    .sort((a, b) => a.reactions - b.reactions)[0];

  const topAlchemist = participants
    .map((p) => ({
      ...p,
      score: gameStats[p.id]?.alchemyScore || 0,
    }))
    .sort((a, b) => b.score - a.score)[0];

  const lastSurvivor = participants
    .filter((p) => gameStats[p.id]?.isAlive)
    .sort(
      (a, b) =>
        (gameStats[b.id]?.alchemyScore || 0) -
        (gameStats[a.id]?.alchemyScore || 0)
    )[0];

  // 상세 결과 데이터
  const detailedResults = participants
    .map((p) => ({
      ...p,
      score: gameStats[p.id]?.alchemyScore || 0,
      reactions: gameStats[p.id]?.reactionCount || 0,
      isAlive: gameStats[p.id]?.isAlive || false,
    }))
    .sort((a, b) => b.score - a.score);

  const handlePlayAgain = () => {
    resetGame();
    router.push('/');
  };

  const handleShareResults = () => {
    // TODO: 결과 공유 기능 구현
    const resultText = `알케믹 퓨전 결과!\n🏆 최고의 연금술사: ${topAlchemist?.name}\n💎 현자의 돌: ${philosophersStone?.name}\n👑 최후의 생존자: ${lastSurvivor?.name}`;

    if (navigator.share) {
      navigator.share({
        title: '알케믹 퓨전 결과',
        text: resultText,
      });
    } else {
      navigator.clipboard.writeText(resultText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <ResultContainer>
      <Spotlight
        initial={{ opacity: 0 }}
        animate={{ opacity: currentWinner !== 'complete' ? 1 : 0 }}
        transition={{ duration: 1 }}
      />

      <AnnouncementTitle
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        전설의 탄생
      </AnnouncementTitle>

      <AnnouncementArea>
        <AnimatePresence mode="wait">
          {currentWinner === 'philosopher' && philosophersStone && (
            <WinnerCard
              key="philosopher"
              category="philosopher"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              <CategoryTitle category="philosopher">💎 현자의 돌</CategoryTitle>
              <WinnerInfo>
                <WinnerElement>
                  {
                    elements.find((e) => e.key === philosophersStone.element)
                      ?.symbol
                  }
                </WinnerElement>
                <WinnerName>{philosophersStone.name}</WinnerName>
                <WinnerStats>
                  반응 횟수: {philosophersStone.reactions}회
                </WinnerStats>
              </WinnerInfo>
            </WinnerCard>
          )}

          {currentWinner === 'alchemist' && topAlchemist && (
            <WinnerCard
              key="alchemist"
              category="alchemist"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              <CategoryTitle category="alchemist">
                🏆 최고의 연금술사
              </CategoryTitle>
              <WinnerInfo>
                <WinnerElement>
                  {elements.find((e) => e.key === topAlchemist.element)?.symbol}
                </WinnerElement>
                <WinnerName>{topAlchemist.name}</WinnerName>
                <WinnerStats>연금 점수: {topAlchemist.score}점</WinnerStats>
              </WinnerInfo>
            </WinnerCard>
          )}

          {currentWinner === 'survivor' && lastSurvivor && (
            <WinnerCard
              key="survivor"
              category="survivor"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8 }}
            >
              <CategoryTitle category="survivor">
                👑 최후의 생존자
              </CategoryTitle>
              <WinnerInfo>
                <WinnerElement>
                  {elements.find((e) => e.key === lastSurvivor.element)?.symbol}
                </WinnerElement>
                <WinnerName>{lastSurvivor.name}</WinnerName>
                <WinnerStats>
                  최종 점수: {gameStats[lastSurvivor.id]?.alchemyScore || 0}점
                </WinnerStats>
              </WinnerInfo>
            </WinnerCard>
          )}
        </AnimatePresence>
      </AnnouncementArea>

      {/* 폭죽 효과 */}
      {showFireworks && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <Firework
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: window.innerHeight,
                opacity: 1,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight * 0.5,
                opacity: 0,
              }}
              transition={{
                duration: Math.random() * 2 + 1,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* 상세 결과 */}
      {currentWinner === 'complete' && (
        <DetailedResults
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <h3
            style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: '#e0e6ed',
              fontSize: '1.5rem',
            }}
          >
            📊 상세 결과
          </h3>

          <ResultsTable>
            <TableHeader>순위</TableHeader>
            <TableHeader>원소</TableHeader>
            <TableHeader>이름</TableHeader>
            <TableHeader>점수</TableHeader>
            <TableHeader>반응</TableHeader>
            <TableHeader>생존</TableHeader>

            {detailedResults.map((participant, index) => {
              const elementInfo = elements.find(
                (e) => e.key === participant.element
              );
              return (
                <TableRow
                  key={participant.id}
                  element={participant.element}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div>{index + 1}</div>
                  <div>{elementInfo?.symbol}</div>
                  <div>{participant.name}</div>
                  <div>{participant.score}</div>
                  <div>{participant.reactions}</div>
                  <div>{participant.isAlive ? '✅' : '❌'}</div>
                </TableRow>
              );
            })}
          </ResultsTable>
        </DetailedResults>
      )}

      {/* 액션 버튼들 */}
      {currentWinner === 'complete' && (
        <ActionButtons>
          <ActionButton
            onClick={handlePlayAgain}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 다시 실험하기
          </ActionButton>
          <ActionButton
            variant="secondary"
            onClick={handleShareResults}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 결과 공유하기
          </ActionButton>
        </ActionButtons>
      )}
    </ResultContainer>
  );
}
