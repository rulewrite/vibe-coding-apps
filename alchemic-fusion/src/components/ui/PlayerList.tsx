'use client';

import { ELEMENT_COLORS, ELEMENT_NAMES } from '@/lib/element-system';
import { Player } from '@/types/game';
import styled from 'styled-components';

interface PlayerListProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
}

const ListContainer = styled.div`
  background: rgba(139, 69, 19, 0.1);
  border: 2px solid #8b4513;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-height: 300px;
`;

const Title = styled.h3`
  color: #8b4513;
  font-size: 20px;
  margin-bottom: 20px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #8b4513;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ElementIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${(props) => props.$color}dd,
    ${(props) => props.$color}bb
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border: 2px solid #8b4513;
`;

const PlayerDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlayerName = styled.div`
  font-weight: bold;
  color: #8b4513;
  font-size: 16px;
`;

const ElementName = styled.div`
  color: #666;
  font-size: 12px;
`;

const RandomBadge = styled.span`
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 6px;
`;

const RemoveButton = styled.button`
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 40px 20px;

  &::before {
    content: '🧪';
    display: block;
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

export function PlayerList({ players, onRemovePlayer }: PlayerListProps) {
  return (
    <ListContainer>
      <Title>참가자 목록 ({players.length}명)</Title>

      {players.length === 0 ? (
        <EmptyState>
          아직 참가자가 없습니다.
          <br />첫 번째 연금술사가 되어보세요!
        </EmptyState>
      ) : (
        <div>
          {players.map((player) => (
            <PlayerItem key={player.id}>
              <PlayerInfo>
                <ElementIcon $color={ELEMENT_COLORS[player.element]}>
                  {ELEMENT_NAMES[player.element]}
                </ElementIcon>
                <PlayerDetails>
                  <PlayerName>
                    {player.name}
                    {player.isRandom && <RandomBadge>랜덤</RandomBadge>}
                  </PlayerName>
                  <ElementName>
                    {ELEMENT_NAMES[player.element]} 원소
                  </ElementName>
                </PlayerDetails>
              </PlayerInfo>

              <RemoveButton onClick={() => onRemovePlayer(player.id)}>
                제거
              </RemoveButton>
            </PlayerItem>
          ))}
        </div>
      )}
    </ListContainer>
  );
}
