'use client';

import { PlayerForm } from '@/components/ui/PlayerForm';
import { PlayerList } from '@/components/ui/PlayerList';
import { useGameStore } from '@/store/game-store';
import { ElementType } from '@/types/game';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';

const MainContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GameTitle = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  margin-bottom: 10px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const GameSubtitle = styled.p`
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 40px;
  max-width: 600px;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 30px;
  }
`;

const ContentContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 30px;
    max-width: 500px;
  }
`;

const FlaskContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const Flask = styled.div`
  width: 300px;
  height: 400px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    height: 60%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: flaskGlow 3s ease-in-out infinite;
  }

  @keyframes flaskGlow {
    0%,
    100% {
      opacity: 0.3;
    }
    50% {
      opacity: 0.7;
    }
  }
`;

const FlaskNeck = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 40px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
`;

const StartButton = styled.button<{ $disabled: boolean }>`
  grid-column: 1 / -1;
  justify-self: center;
  padding: 20px 40px;
  font-size: 24px;
  font-weight: bold;
  color: white;
  background: ${(props) =>
    props.$disabled
      ? 'linear-gradient(135deg, #999, #666)'
      : 'linear-gradient(135deg, #ff6b6b, #ee5a52)'};
  border: none;
  border-radius: 12px;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);

  ${(props) =>
    !props.$disabled &&
    `
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(255, 107, 107, 0.4);
    }
    
    &:active {
      transform: translateY(-2px);
    }
  `}

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 16px 32px;
  }
`;

export default function HomePage() {
  const { players, addPlayer, removePlayer, startGame } = useGameStore();

  const router = useRouter();

  const handleAddPlayer = (
    name: string,
    element: ElementType | null,
    isRandom: boolean
  ) => {
    addPlayer(name, element, isRandom);
  };

  const handleStartGame = () => {
    startGame();
    router.push('/game');
  };

  const canStartGame = players.length >= 2;

  return (
    <MainContainer>
      <GameTitle>알케믹 퓨전</GameTitle>
      <GameSubtitle>
        신비로운 연금술사의 실험실에서 펼쳐지는 원소들의 장대한 모험!
        <br />
        각자의 원소를 선택하고, 예측 불가능한 상호작용을 관찰하세요.
      </GameSubtitle>

      <FlaskContainer>
        <Flask>
          <FlaskNeck />
        </Flask>
      </FlaskContainer>

      <ContentContainer>
        <PlayerForm onSubmit={handleAddPlayer} />
        <PlayerList players={players} onRemovePlayer={removePlayer} />

        <StartButton $disabled={!canStartGame} onClick={handleStartGame}>
          {canStartGame ? '실험 시작!' : '최소 2명의 연금술사가 필요합니다'}
        </StartButton>
      </ContentContainer>
    </MainContainer>
  );
}
