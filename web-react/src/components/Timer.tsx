import { PlayArrow, Refresh, SkipNext, Stop } from '@mui/icons-material';
import { Box, Button, LinearProgress, Paper, Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useTimer } from '../contexts/TimerContext';

export function Timer() {
  const { state, start, stop, reset, nextSession } = useTimer();

  // 컴포넌트가 리렌더링될 때마다 상태 로깅
  useEffect(() => {
    console.log('Timer component state updated:', {
      timeRemaining: state.timeRemaining,
      isRunning: state.isRunning,
      currentSession: state.currentSession,
      timestamp: new Date().toISOString(),
    });
  }, [state]);

  const handleStart = useCallback(() => {
    console.log('Start button clicked');
    try {
      start();
    } catch (error) {
      console.error('Error in handleStart:', error);
    }
  }, [start]);

  const handleStop = useCallback(() => {
    console.log('Stop button clicked');
    try {
      stop();
    } catch (error) {
      console.error('Error in handleStop:', error);
    }
  }, [stop]);

  const handleReset = useCallback(() => {
    console.log('Reset button clicked');
    try {
      reset();
    } catch (error) {
      console.error('Error in handleReset:', error);
    }
  }, [reset]);

  const handleNextSession = useCallback(() => {
    console.log('Next session button clicked');
    try {
      nextSession();
    } catch (error) {
      console.error('Error in handleNextSession:', error);
    }
  }, [nextSession]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
    console.log('Formatting time:', { seconds, formatted });
    return formatted;
  };

  const getModeText = () => {
    switch (state.currentSession) {
      case 'focus':
        return '집중 시간';
      case 'shortBreak':
        return '짧은 휴식';
      case 'longBreak':
        return '긴 휴식';
    }
  };

  const progress =
    (state.timeRemaining /
      (state.currentSession === 'focus'
        ? state.settings.focusTime * 60
        : state.currentSession === 'shortBreak'
        ? state.settings.shortBreakTime * 60
        : state.settings.longBreakTime * 60)) *
    100;

  console.log('Timer component rendering with state:', {
    isRunning: state.isRunning,
    timeRemaining: state.timeRemaining,
    currentSession: state.currentSession,
  });

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {getModeText()}
        </Typography>
        <Typography
          variant="h2"
          component="div"
          sx={{ fontFamily: 'monospace', my: 2 }}
        >
          {formatTime(state.timeRemaining)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor:
                state.currentSession === 'focus'
                  ? 'success.main'
                  : 'warning.main',
            },
          }}
        />
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        {state.isRunning ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<Stop />}
            onClick={handleStop}
            size="large"
            data-testid="stop-button"
          >
            정지
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrow />}
            onClick={handleStart}
            size="large"
            data-testid="start-button"
          >
            시작
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={handleReset}
          size="large"
          data-testid="reset-button"
        >
          리셋
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<SkipNext />}
          onClick={handleNextSession}
          size="large"
          data-testid="next-button"
        >
          다음
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            완료된 세션
          </Typography>
          <Typography variant="h4" color="success.main">
            {state.completedSessions}
          </Typography>
        </Paper>
        <Paper elevation={2} sx={{ p: 2, textAlign: 'center', flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            총 집중 시간
          </Typography>
          <Typography variant="h4" color="success.main">
            {Math.floor(state.totalFocusTime / 60)}분
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
