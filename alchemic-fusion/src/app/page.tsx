'use client';

import { Participant, useGameStore } from '@/lib/game-store';
import { ElementType } from '@/styles/theme';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styled from 'styled-components';

// 메인 컨테이너
const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.gradients.background};
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 50%,
        rgba(139, 92, 246, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 20%,
        rgba(6, 182, 212, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 40% 80%,
        rgba(245, 158, 11, 0.1) 0%,
        transparent 50%
      );
    pointer-events: none;
  }
`;

// 헤더
const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
`;

const Title = styled(motion.h1)`
  font-size: 3.5rem;
  font-weight: bold;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(139, 92, 246, 0.5);

  @media (max-width: ${(props) => props.theme.breakpoints.tablet}) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: ${(props) => props.theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

// 게임 영역
const GameArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
  flex: 1;
  position: relative;
  z-index: 1;

  @media (max-width: ${(props) => props.theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

// 왼쪽 패널 - 참가자 등록
const LeftPanel = styled(motion.div)`
  background: ${(props) => props.theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  height: fit-content;
`;

const PanelTitle = styled.h3`
  font-size: 1.5rem;
  color: ${(props) => props.theme.colors.text.primary};
  margin-bottom: 1.5rem;
  text-align: center;
`;

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  color: ${(props) => props.theme.colors.text.primary};
  font-size: 1rem;
  margin-bottom: 1.5rem;
  transition: ${(props) => props.theme.animations.transition};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.text.secondary};
  }
`;

// 원소 선택
const ElementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const ElementButton = styled(motion.button)<{
  element: ElementType;
  selected: boolean;
}>`
  aspect-ratio: 1;
  border: 2px solid
    ${(props) =>
      props.selected
        ? props.theme.colors.elements[props.element]
        : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 50%;
  background: ${(props) =>
    props.selected
      ? props.theme.gradients[props.element]
      : 'rgba(0, 0, 0, 0.3)'};
  color: ${(props) => props.theme.colors.text.primary};
  font-weight: bold;
  cursor: pointer;
  transition: ${(props) => props.theme.animations.transition};
  position: relative;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${(props) => props.theme.shadows.glow[props.element]};
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 24px;
    height: 24px;
    background: ${(props) => props.theme.colors.elements[props.element]};
    border-radius: 50%;
    opacity: ${(props) => (props.selected ? 1 : 0.7)};
  }
`;

const ActionButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: ${(props) =>
    props.disabled ? 'rgba(107, 114, 128, 0.5)' : props.theme.colors.primary};
  color: ${(props) => props.theme.colors.text.primary};
  font-weight: bold;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: ${(props) => props.theme.animations.transition};
  margin-bottom: 1rem;

  &:hover:not(:disabled) {
    background: ${(props) => props.theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: ${(props) => props.theme.shadows.medium};
  }
`;

const RandomCheckbox = styled.label`
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.colors.text.secondary};
  cursor: pointer;

  input {
    margin-right: 0.5rem;
  }
`;

// 중앙 - 연금술 플라스크
const CenterArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const AlchemyFlask = styled(motion.div)`
  width: 300px;
  height: 400px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  backdrop-filter: blur(10px);

  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 30px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.5rem 0.5rem 0 0;
  }

  &::after {
    content: '⚗️';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    opacity: 0.3;
  }
`;

// 우측 패널 - 참가자 목록
const RightPanel = styled(motion.div)`
  background: ${(props) => props.theme.gradients.glass};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 2rem;
  height: fit-content;
`;

const ParticipantsList = styled.div`
  min-height: 200px;
`;

const ParticipantItem = styled(motion.div)<{ element: ElementType }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  border-left: 3px solid
    ${(props) => props.theme.colors.elements[props.element]};
`;

const ParticipantName = styled.span`
  color: ${(props) => props.theme.colors.text.primary};
  font-weight: 500;
  margin-left: 0.5rem;
`;

const StartButton = styled(motion.button)<{ disabled?: boolean }>`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 0.75rem;
  background: ${(props) =>
    props.disabled
      ? 'rgba(107, 114, 128, 0.5)'
      : 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)'};
  color: ${(props) => props.theme.colors.text.primary};
  font-size: 1.25rem;
  font-weight: bold;
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  transition: ${(props) => props.theme.animations.transition};
  margin-top: 2rem;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(139, 92, 246, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: ${(props) => props.theme.animations.transition};
  }

  &:hover:not(:disabled)::before {
    left: 100%;
  }
`;

// 타입 정의
const elements: { key: ElementType; symbol: string; name: string }[] = [
  { key: 'fire', symbol: '🔥', name: '불' },
  { key: 'water', symbol: '💧', name: '물' },
  { key: 'wood', symbol: '🌱', name: '나무' },
  { key: 'metal', symbol: '⚔️', name: '쇠' },
  { key: 'earth', symbol: '🗿', name: '흙' },
  { key: 'wind', symbol: '💨', name: '바람' },
];

export default function Home() {
  const router = useRouter();
  const { participants, setParticipants, resetGame } = useGameStore();

  const [playerName, setPlayerName] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType>('fire');
  const [useRandom, setUseRandom] = useState(false);

  const handleAddParticipant = () => {
    if (!playerName.trim()) return;

    const element = useRandom
      ? elements[Math.floor(Math.random() * elements.length)].key
      : selectedElement;

    const newParticipant: Participant = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: playerName.trim(),
      element,
    };

    const newParticipants = [...participants, newParticipant];
    setParticipants(newParticipants);
    setPlayerName('');
  };

  const handleStartGame = () => {
    if (participants.length < 2) return;

    // 게임 페이지로 이동
    router.push('/game');
  };

  const handleResetGame = () => {
    resetGame();
  };

  return (
    <MainContainer>
      <Header>
        <Title
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          알케믹 퓨전
        </Title>
        <Subtitle>
          연금술사가 되어 원소들의 신비로운 상호작용을 지켜보세요
        </Subtitle>
      </Header>

      <GameArea>
        {/* 왼쪽 패널 - 참가자 등록 */}
        <LeftPanel
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <PanelTitle>🧙‍♂️ 연금술사 등록</PanelTitle>

          <InputField
            type="text"
            placeholder="연금술사의 이름을 입력하세요"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
          />

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ marginBottom: '1rem', color: '#9ca3af' }}>원소 선택:</p>
            <ElementGrid>
              {elements.map((element) => (
                <ElementButton
                  key={element.key}
                  element={element.key}
                  selected={selectedElement === element.key}
                  onClick={() => setSelectedElement(element.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title={`${element.symbol} ${element.name}`}
                />
              ))}
            </ElementGrid>
          </div>

          <RandomCheckbox>
            <input
              type="checkbox"
              checked={useRandom}
              onChange={(e) => setUseRandom(e.target.checked)}
            />
            무작위 원소 선택
          </RandomCheckbox>

          <ActionButton
            onClick={handleAddParticipant}
            disabled={!playerName.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            참가하기
          </ActionButton>

          {participants.length > 0 && (
            <ActionButton
              onClick={handleResetGame}
              style={{
                background: 'rgba(239, 68, 68, 0.8)',
                marginTop: '0.5rem',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              모두 초기화
            </ActionButton>
          )}
        </LeftPanel>

        {/* 중앙 - 연금술 플라스크 */}
        <CenterArea>
          <AlchemyFlask
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
        </CenterArea>

        {/* 우측 패널 - 참가자 목록 */}
        <RightPanel
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <PanelTitle>📜 참가자 명단</PanelTitle>

          <ParticipantsList>
            {participants.length === 0 ? (
              <p
                style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontStyle: 'italic',
                }}
              >
                아직 참가자가 없습니다
              </p>
            ) : (
              participants.map((participant) => {
                const elementInfo = elements.find(
                  (e) => e.key === participant.element
                );
                return (
                  <ParticipantItem
                    key={participant.id}
                    element={participant.element}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {elementInfo?.symbol}
                    </span>
                    <ParticipantName>{participant.name}</ParticipantName>
                  </ParticipantItem>
                );
              })
            )}
          </ParticipantsList>

          <StartButton
            onClick={handleStartGame}
            disabled={participants.length < 2}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {participants.length < 2
              ? `최소 2명 필요 (${participants.length}/2)`
              : '🧪 실험 시작!'}
          </StartButton>
        </RightPanel>
      </GameArea>
    </MainContainer>
  );
}
