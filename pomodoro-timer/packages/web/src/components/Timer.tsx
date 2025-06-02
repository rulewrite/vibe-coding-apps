import React, { useEffect } from 'react';
import { FaForward, FaPause, FaPlay, FaRedo } from 'react-icons/fa';
import { useTimerStore } from '../store/timerStore';

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getSessionColor = (session: string): string => {
  switch (session) {
    case 'focus':
      return 'bg-primary';
    case 'shortBreak':
      return 'bg-secondary';
    case 'longBreak':
      return 'bg-secondary-dark';
    default:
      return 'bg-primary';
  }
};

export const Timer: React.FC = () => {
  const { state, initialize, start, stop, reset, nextSession } = useTimerStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!state) return null;

  const { isRunning, currentSession, timeRemaining, completedSessions } = state;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-light p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {currentSession === 'focus' ? '뽀모도로' : '휴식 시간'}
            </h2>
            <p className="text-gray-600">
              완료된 세션: {completedSessions}회
            </p>
          </div>

          <div className="relative mb-8">
            <div className={`w-full h-4 rounded-full overflow-hidden ${getSessionColor(currentSession)}`}>
              <div
                className="h-full bg-white bg-opacity-20 transition-all duration-1000"
                style={{
                  width: `${(timeRemaining / (state.settings[currentSession === 'focus' ? 'focusTime' : currentSession === 'longBreak' ? 'longBreakTime' : 'shortBreakTime'] * 60)) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-gray-800 mb-4">
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            {isRunning ? (
              <button
                onClick={stop}
                className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <FaPause className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={start}
                className="p-4 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                <FaPlay className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={reset}
              className="p-4 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-colors"
            >
              <FaRedo className="w-6 h-6" />
            </button>
            <button
              onClick={nextSession}
              className="p-4 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <FaForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 