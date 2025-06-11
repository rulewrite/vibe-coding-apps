import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ELEMENT_CONFIG } from '../types/game';

export const ResultScreen: React.FC = () => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [showFinalResults, setShowFinalResults] = useState(false);

  const { players, scores, winner, reactions, resetGame } = useGameStore();

  // 승리자 발표 시퀀스
  const announcements = [
    {
      title: '💎 현자의 돌',
      subtitle: '가장 순수함을 지킨 연금술사',
      winnerId: winner?.philosopherStone,
      description:
        '다른 원소와 가장 적게 상호작용하며 자신의 순수함을 지켰습니다',
    },
    {
      title: '🏆 최고의 연금술사',
      subtitle: '가장 많은 연금 점수를 획득한 연금술사',
      winnerId: winner?.masterAlchemist,
      description: '뛰어난 반응 능력으로 가장 높은 연금 점수를 달성했습니다',
    },
    {
      title: '👑 최후의 생존자',
      subtitle: '마지막까지 살아남은 연금술사',
      winnerId: winner?.lastSurvivor,
      description: '모든 시련을 견디고 마지막까지 생존한 진정한 승리자입니다',
    },
  ];

  useEffect(() => {
    // 승리자 발표 시퀀스 진행
    const timer = setTimeout(() => {
      if (currentAnnouncement < announcements.length - 1) {
        setCurrentAnnouncement((prev) => prev + 1);
      } else {
        // 모든 발표가 끝나면 최종 결과 표시
        setTimeout(() => {
          setShowFinalResults(true);
        }, 2000);
      }
    }, 3000); // 각 발표는 3초간 지속

    return () => clearTimeout(timer);
  }, [currentAnnouncement, announcements.length]);

  const getPlayerInfo = (playerId?: string) => {
    if (!playerId) return null;
    const player = players.find((p) => p.id === playerId);
    const score = scores.find((s) => s.playerId === playerId);
    return { player, score };
  };

  const handleRestart = () => {
    resetGame();
  };

  const handleShare = () => {
    // 결과 공유 기능 (추후 구현)
    const shareText =
      `🧪 알케믹 퓨전 결과 🧪\n\n` +
      `👑 최후의 생존자: ${
        getPlayerInfo(winner?.lastSurvivor)?.player?.name || '없음'
      }\n` +
      `🏆 최고의 연금술사: ${
        getPlayerInfo(winner?.masterAlchemist)?.player?.name || '없음'
      }\n` +
      `💎 현자의 돌: ${
        getPlayerInfo(winner?.philosopherStone)?.player?.name || '없음'
      }\n\n` +
      `총 ${reactions.length}번의 반응이 일어났습니다!`;

    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('결과가 클립보드에 복사되었습니다!');
    }
  };

  if (!showFinalResults) {
    // 승리자 발표 연출
    const announcement = announcements[currentAnnouncement];
    const winnerInfo = getPlayerInfo(announcement.winnerId);

    return (
      <div className="min-h-screen mystical-bg flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAnnouncement}
            className="text-center max-w-2xl mx-auto px-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* 스포트라이트 효과 */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-transparent via-mystic-900/50 to-mystic-900/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            />

            <div className="relative z-10">
              {/* 제목 */}
              <motion.h1
                className="text-6xl font-medieval font-bold text-mystic-300 mb-4"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {announcement.title}
              </motion.h1>

              <motion.p
                className="text-xl text-mystic-200 mb-8"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                {announcement.subtitle}
              </motion.p>

              {winnerInfo?.player ? (
                <motion.div
                  className="mb-8"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, type: 'spring' }}
                >
                  {/* 승리자 정보 */}
                  <div className="inline-block parchment p-8 rounded-xl">
                    <div className="text-6xl mb-4">
                      {ELEMENT_CONFIG[winnerInfo.player.element].emoji}
                    </div>
                    <h2 className="text-3xl font-bold text-alchemy-800 mb-2">
                      {winnerInfo.player.name}
                    </h2>
                    <p className="text-lg text-alchemy-600 mb-4">
                      {ELEMENT_CONFIG[winnerInfo.player.element].name} 원소
                    </p>

                    {/* 점수 정보 */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-mystic-600">
                          {winnerInfo.score?.alchemyPoints || 0}
                        </div>
                        <div className="text-sm text-alchemy-600">
                          연금 점수
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">
                          {winnerInfo.score?.reactionCount || 0}
                        </div>
                        <div className="text-sm text-alchemy-600">
                          반응 횟수
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.floor(
                            (winnerInfo.score?.survivalTime || 0) / 1000
                          )}
                          s
                        </div>
                        <div className="text-sm text-alchemy-600">
                          생존 시간
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="mb-8 text-2xl text-mystic-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  해당 부문의 승리자가 없습니다
                </motion.div>
              )}

              <motion.p
                className="text-mystic-200 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
              >
                {announcement.description}
              </motion.p>

              {/* 진행 표시 */}
              <motion.div
                className="flex justify-center space-x-2 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                {announcements.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentAnnouncement
                        ? 'bg-mystic-400'
                        : 'bg-mystic-800'
                    }`}
                  />
                ))}
              </motion.div>
            </div>

            {/* 폭죽 효과 */}
            {winnerInfo?.player && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 1, duration: 2, repeat: 2 }}
              >
                <div className="text-6xl absolute top-10 left-10 animate-bounce">
                  🎉
                </div>
                <div className="text-6xl absolute top-20 right-10 animate-bounce delay-200">
                  🎊
                </div>
                <div className="text-6xl absolute bottom-20 left-20 animate-bounce delay-300">
                  ✨
                </div>
                <div className="text-6xl absolute bottom-10 right-20 animate-bounce delay-100">
                  🎆
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // 최종 결과 표시
  return (
    <div className="min-h-screen mystical-bg p-8">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-medieval font-bold text-mystic-300 mb-4">
            🏆 실험 결과 🏆
          </h1>
          <p className="text-xl text-mystic-200">
            총 {reactions.length}번의 반응이 일어났습니다
          </p>
        </div>

        {/* 승리자 요약 */}
        <div className="grid grid-cols-1 md-grid-cols-3 gap-6 mb-12">
          {announcements.map((announcement, index) => {
            const winnerInfo = getPlayerInfo(announcement.winnerId);

            return (
              <motion.div
                key={index}
                className="parchment p-6 rounded-lg text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-3xl mb-3">
                  {announcement.title.split(' ')[0]}
                </div>
                <h3 className="text-lg font-bold text-alchemy-800 mb-3">
                  {announcement.title.split(' ').slice(1).join(' ')}
                </h3>

                {winnerInfo?.player ? (
                  <div>
                    <div className="text-2xl mb-2">
                      {ELEMENT_CONFIG[winnerInfo.player.element].emoji}
                    </div>
                    <div className="font-semibold text-alchemy-700">
                      {winnerInfo.player.name}
                    </div>
                    <div className="text-sm text-alchemy-600">
                      {ELEMENT_CONFIG[winnerInfo.player.element].name}
                    </div>
                  </div>
                ) : (
                  <div className="text-alchemy-600 italic">승리자 없음</div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* 전체 결과표 */}
        <motion.div
          className="parchment p-6 rounded-lg mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-2xl font-bold text-alchemy-800 mb-6 text-center">
            📊 최종 결과표
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-alchemy-400">
                  <th className="text-left py-3 px-4">연금술사</th>
                  <th className="text-center py-3 px-4">원소</th>
                  <th className="text-center py-3 px-4">연금 점수</th>
                  <th className="text-center py-3 px-4">반응 횟수</th>
                  <th className="text-center py-3 px-4">생존 시간</th>
                  <th className="text-center py-3 px-4">상태</th>
                </tr>
              </thead>
              <tbody>
                {scores
                  .sort((a, b) => b.alchemyPoints - a.alchemyPoints)
                  .map((score, index) => {
                    const player = players.find((p) => p.id === score.playerId);
                    if (!player) return null;

                    const element = ELEMENT_CONFIG[player.element];
                    const isWinner =
                      score.playerId === winner?.lastSurvivor ||
                      score.playerId === winner?.masterAlchemist ||
                      score.playerId === winner?.philosopherStone;

                    return (
                      <motion.tr
                        key={score.playerId}
                        className={`border-b border-alchemy-200 ${
                          isWinner ? 'bg-yellow-50' : ''
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{element.emoji}</span>
                            <span className="font-semibold">{player.name}</span>
                            {isWinner && (
                              <span className="text-yellow-600">👑</span>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          {element.name}
                        </td>
                        <td className="text-center py-3 px-4 font-bold text-mystic-600">
                          {score.alchemyPoints}
                        </td>
                        <td className="text-center py-3 px-4">
                          {score.reactionCount}
                        </td>
                        <td className="text-center py-3 px-4">
                          {Math.floor(score.survivalTime / 1000)}초
                        </td>
                        <td className="text-center py-3 px-4">
                          {score.isLastSurvivor ? (
                            <span className="text-green-600 font-bold">
                              생존
                            </span>
                          ) : (
                            <span className="text-red-600">소멸</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 액션 버튼 */}
        <motion.div
          className="flex justify-center space-x-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.button
            onClick={handleRestart}
            className="px-8 py-4 bg-mystic-600 text-white font-bold rounded-lg hover:bg-mystic-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔄 다시 실험하기
          </motion.button>

          <motion.button
            onClick={handleShare}
            className="px-8 py-4 bg-alchemy-600 text-white font-bold rounded-lg hover:bg-alchemy-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📤 결과 공유하기
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};
