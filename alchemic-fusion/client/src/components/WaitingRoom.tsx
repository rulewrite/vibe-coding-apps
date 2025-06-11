import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ELEMENT_CONFIG, ElementType } from '../types/game';

export const WaitingRoom: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(
    null
  );
  const [useRandom, setUseRandom] = useState(false);

  const { players, addPlayer, startGame } = useGameStore();

  const handleAddPlayer = () => {
    if (!playerName.trim()) return;

    const element = useRandom ? getRandomElement() : selectedElement;

    if (!element) return;

    addPlayer(playerName.trim(), element);
    setPlayerName('');
    setSelectedElement(null);
    setUseRandom(false);
  };

  const getRandomElement = (): ElementType => {
    const elements: ElementType[] = [
      'fire',
      'water',
      'wood',
      'metal',
      'earth',
      'wind',
    ];
    return elements[Math.floor(Math.random() * elements.length)];
  };

  const canStartGame = players.length >= 2;

  return (
    <div className="min-h-screen mystical-bg flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* 헤더 */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-medieval font-bold text-mystic-300 mb-4 animate-glow">
            ⚗️ 알케믹 퓨전 ⚗️
          </h1>
          <p className="text-xl text-mystic-200 font-medium">
            신비로운 연금술사의 실험실에 오신 것을 환영합니다
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 중앙 플라스크 */}
          <motion.div
            className="lg:col-start-2 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="flask w-64 h-80 relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-mystic-500/10 to-mystic-600/20 rounded-full opacity-50"></div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-4xl">
                ⚗️
              </div>
              {players.length > 0 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs text-mystic-300">
                  실험 준비 중...
                </div>
              )}
            </div>
          </motion.div>

          {/* 좌측 패널 - 플레이어 등록 */}
          <motion.div
            className="parchment p-6 rounded-lg lg:col-start-1 lg:row-start-1"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-2xl font-medieval font-bold text-alchemy-800 mb-6 text-center">
              🧙‍♂️ 연금술사 등록
            </h2>

            {/* 이름 입력 */}
            <div className="mb-6">
              <label className="block text-alchemy-700 font-semibold mb-2">
                연금술사 이름
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border-2 border-alchemy-400 rounded-lg focus:border-alchemy-600 focus:outline-none bg-alchemy-50"
                placeholder="이름을 입력하세요"
                maxLength={20}
              />
            </div>

            {/* 랜덤 선택 체크박스 */}
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRandom}
                  onChange={(e) => setUseRandom(e.target.checked)}
                  className="w-4 h-4 text-mystic-600 rounded focus:ring-mystic-500"
                />
                <span className="text-alchemy-700 font-medium">
                  🎲 무작위 원소 선택
                </span>
              </label>
            </div>

            {/* 원소 선택 */}
            {!useRandom && (
              <div className="mb-6">
                <label className="block text-alchemy-700 font-semibold mb-3">
                  원소 선택
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(Object.keys(ELEMENT_CONFIG) as ElementType[]).map(
                    (elementType) => {
                      const element = ELEMENT_CONFIG[elementType];
                      const isSelected = selectedElement === elementType;

                      return (
                        <motion.button
                          key={elementType}
                          onClick={() => setSelectedElement(elementType)}
                          className={`rune-icon p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-mystic-500 bg-mystic-100 shadow-lg'
                              : 'border-alchemy-300 bg-white hover:border-mystic-400'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl mb-1">{element.emoji}</div>
                          <div className="text-xs font-semibold text-alchemy-800">
                            {element.name}
                          </div>
                        </motion.button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* 참가 버튼 */}
            <motion.button
              onClick={handleAddPlayer}
              disabled={!playerName.trim() || (!useRandom && !selectedElement)}
              className="w-full py-3 bg-mystic-600 text-white font-bold rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-mystic-700 transition-colors"
              whileHover={{
                scale:
                  !playerName.trim() || (!useRandom && !selectedElement)
                    ? 1
                    : 1.02,
              }}
              whileTap={{ scale: 0.98 }}
            >
              🧪 실험에 참가하기
            </motion.button>
          </motion.div>

          {/* 우측 패널 - 참가자 목록 */}
          <motion.div
            className="parchment p-6 rounded-lg lg:col-start-3 lg:row-start-1"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <h2 className="text-2xl font-medieval font-bold text-alchemy-800 mb-6 text-center">
              📜 참가자 목록
            </h2>

            <div className="space-y-3 mb-6">
              {players.length === 0 ? (
                <div className="text-center text-alchemy-600 italic py-8">
                  아직 참가자가 없습니다
                </div>
              ) : (
                players.map((player, index) => {
                  const element = ELEMENT_CONFIG[player.element];
                  return (
                    <motion.div
                      key={player.id}
                      className="flex items-center space-x-3 p-3 bg-alchemy-100 rounded-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <span className="text-2xl">{element.emoji}</span>
                      <div className="flex-1">
                        <div className="font-semibold text-alchemy-800">
                          {player.name}
                        </div>
                        <div className="text-sm text-alchemy-600">
                          {element.name} 원소
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">✓</div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* 게임 시작 버튼 */}
            {players.length > 0 && (
              <motion.button
                onClick={startGame}
                disabled={!canStartGame}
                className={`w-full py-4 font-bold rounded-lg transition-all ${
                  canStartGame
                    ? 'bg-gradient-to-r from-alchemy-500 to-alchemy-600 text-white hover:from-alchemy-600 hover:to-alchemy-700 animate-glow'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
                whileHover={{ scale: canStartGame ? 1.02 : 1 }}
                whileTap={{ scale: canStartGame ? 0.98 : 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 }}
              >
                {canStartGame
                  ? '🔮 실험 시작!'
                  : `더 많은 연금술사가 필요합니다 (${players.length}/2+)`}
              </motion.button>
            )}
          </motion.div>
        </div>

        {/* 하단 설명 */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <p className="text-mystic-200 text-sm">
            💡 각 원소는 고유한 특성과 상성 관계를 가지고 있습니다.
            <br />
            현명한 선택으로 연금술의 승리를 쟁취하세요!
          </p>
        </motion.div>
      </div>
    </div>
  );
};
