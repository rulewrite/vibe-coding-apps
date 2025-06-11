import { motion } from 'framer-motion';
import Phaser from 'phaser';
import React, { useEffect, useRef } from 'react';
import { gameConfig } from '../game/GameConfig';
import { useGameStore } from '../store/gameStore';
import { ELEMENT_CONFIG } from '../types/game';

export const GameArena: React.FC = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);

  const { players, elements, reactions, scores, startTime } = useGameStore();

  useEffect(() => {
    if (gameRef.current && !phaserGameRef.current) {
      // Phaser 게임 초기화
      const config = {
        ...gameConfig,
        parent: gameRef.current,
      };
      phaserGameRef.current = new Phaser.Game(config);
    }

    return () => {
      // 게임 정리
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  // 현재 생존자 수 계산
  const survivingPlayers = elements.filter(
    (e) => !e.isNeutral && e.health > 0
  ).length;
  const totalPlayers = players.length;

  // 상위 3명의 연금술사 점수
  const topAlchemists = scores
    .sort((a, b) => b.alchemyPoints - a.alchemyPoints)
    .slice(0, 3);

  // 현자의 돌 후보 (반응 횟수가 적은 순)
  const philosopherCandidates = scores
    .sort((a, b) => a.reactionCount - b.reactionCount)
    .slice(0, 2);

  // 게임 경과 시간
  const getElapsedTime = () => {
    if (!startTime) return '00:00';
    const elapsed = Date.now() - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || '알 수 없음';
  };

  return (
    <div className="min-h-screen mystical-bg flex">
      {/* 좌측 패널 - 실시간 전황판 */}
      <motion.div
        className="w-80 parchment m-4 p-6 rounded-lg"
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-medieval font-bold text-alchemy-800 mb-6 text-center">
          📊 실시간 전황판
        </h2>

        {/* 게임 정보 */}
        <div className="mb-6 p-4 bg-alchemy-100 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-alchemy-700">경과 시간</span>
            <span className="font-mono text-lg text-alchemy-800">
              {getElapsedTime()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-alchemy-700">생존자</span>
            <span className="font-bold text-xl text-green-600">
              {survivingPlayers} / {totalPlayers}
            </span>
          </div>
        </div>

        {/* 최고의 연금술사 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-alchemy-800 mb-3 flex items-center">
            🏆 최고의 연금술사
          </h3>
          <div className="space-y-2">
            {topAlchemists.map((score, index) => {
              const player = players.find((p) => p.id === score.playerId);
              const element = player ? ELEMENT_CONFIG[player.element] : null;

              return (
                <motion.div
                  key={score.playerId}
                  className={`flex items-center space-x-3 p-2 rounded ${
                    index === 0
                      ? 'bg-yellow-100 border border-yellow-300'
                      : 'bg-alchemy-50'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-lg">{element?.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {getPlayerName(score.playerId)}
                    </div>
                    <div className="text-xs text-alchemy-600">
                      {score.alchemyPoints}점
                    </div>
                  </div>
                  {index === 0 && <span className="text-yellow-600">👑</span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 현자의 돌 후보 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-alchemy-800 mb-3 flex items-center">
            💎 현자의 돌 후보
          </h3>
          <div className="space-y-2">
            {philosopherCandidates.map((score, index) => {
              const player = players.find((p) => p.id === score.playerId);
              const element = player ? ELEMENT_CONFIG[player.element] : null;

              return (
                <motion.div
                  key={score.playerId}
                  className="flex items-center space-x-3 p-2 bg-blue-50 rounded"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-lg">{element?.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">
                      {getPlayerName(score.playerId)}
                    </div>
                    <div className="text-xs text-blue-600">
                      {score.reactionCount}회 반응
                    </div>
                  </div>
                  {index === 0 && <span className="text-blue-600">💎</span>}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* 중앙 게임 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 게임 캔버스 영역 */}
        <motion.div
          className="flex-1 m-4 flask relative overflow-hidden"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div
            ref={gameRef}
            id="game-container"
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          >
            {/* 임시 플레이스홀더 - Phaser 게임이 여기에 렌더링됩니다 */}
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-bounce">⚗️</div>
                <div className="text-2xl text-white font-bold mb-2">
                  연금술 진행 중...
                </div>
                <div className="text-lg text-mystic-200">
                  원소들이 서로 상호작용하고 있습니다
                </div>

                {/* 참가 원소들 표시 */}
                <div className="mt-8 flex justify-center space-x-4">
                  {players.map((player) => {
                    const element = ELEMENT_CONFIG[player.element];
                    const gameElement = elements.find(
                      (e) => e.playerId === player.id
                    );
                    const isAlive = gameElement && gameElement.health > 0;

                    return (
                      <motion.div
                        key={player.id}
                        className={`p-3 rounded-lg ${
                          isAlive ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}
                        animate={{
                          scale: isAlive ? [1, 1.1, 1] : 1,
                          opacity: isAlive ? 1 : 0.5,
                        }}
                        transition={{
                          repeat: isAlive ? Infinity : 0,
                          duration: 2,
                        }}
                      >
                        <div className="text-3xl">{element.emoji}</div>
                        <div className="text-xs text-white font-semibold mt-1">
                          {player.name}
                        </div>
                        <div className="text-xs text-mystic-200">
                          {isAlive ? `${gameElement?.health}%` : '소멸됨'}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 우측 패널 - 이벤트 로그 */}
      <motion.div
        className="w-80 parchment m-4 p-6 rounded-lg"
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <h2 className="text-2xl font-medieval font-bold text-alchemy-800 mb-6 text-center">
          📋 이벤트 로그
        </h2>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {reactions.length === 0 ? (
            <div className="text-center text-alchemy-600 italic py-8">
              아직 반응이 없습니다
            </div>
          ) : (
            reactions
              .slice()
              .reverse()
              .map((reaction, index) => {
                const getReactionIcon = (type: string) => {
                  switch (type) {
                    case 'growth':
                    case 'amplify':
                    case 'harden':
                    case 'refine':
                    case 'generate':
                    case 'seed':
                      return '🌟'; // 상생
                    case 'extinguish':
                    case 'melt':
                    case 'cut':
                      return '💥'; // 소멸
                    case 'slash':
                    case 'crack':
                    case 'weathering':
                      return '⚡'; // 약화
                    case 'steam':
                      return '🌪️'; // 조합
                    default:
                      return '✨';
                  }
                };

                const getReactionColor = (type: string) => {
                  switch (type) {
                    case 'growth':
                    case 'amplify':
                    case 'harden':
                    case 'refine':
                    case 'generate':
                    case 'seed':
                      return 'bg-green-100 border-green-300';
                    case 'extinguish':
                    case 'melt':
                    case 'cut':
                      return 'bg-red-100 border-red-300';
                    case 'slash':
                    case 'crack':
                    case 'weathering':
                      return 'bg-yellow-100 border-yellow-300';
                    case 'steam':
                      return 'bg-purple-100 border-purple-300';
                    default:
                      return 'bg-gray-100 border-gray-300';
                  }
                };

                return (
                  <motion.div
                    key={reaction.id}
                    className={`p-3 rounded-lg border ${getReactionColor(
                      reaction.type
                    )}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-lg">
                        {getReactionIcon(reaction.type)}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-alchemy-800">
                          {reaction.description}
                        </div>
                        <div className="text-xs text-alchemy-600 mt-1">
                          {new Date(reaction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
          )}
        </div>
      </motion.div>
    </div>
  );
};
