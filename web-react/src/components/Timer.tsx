import { PlayArrow, Refresh, SkipNext, Stop } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useTimer } from '../contexts/TimerContext';

export function Timer() {
  const { state, startTimer, stopTimer, resetTimer, nextSession } = useTimer();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const progress = ((state.totalTime - state.timeLeft) / state.totalTime) * 100;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {state.isBreak ? '휴식 시간' : '집중 시간'}
        </Typography>
        <Typography
          variant="h2"
          component="div"
          sx={{ fontFamily: 'monospace', my: 2 }}
        >
          {formatTime(state.timeLeft)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: state.isBreak ? 'warning.main' : 'success.main',
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
            onClick={stopTimer}
            size="large"
          >
            정지
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            startIcon={<PlayArrow />}
            onClick={startTimer}
            size="large"
          >
            시작
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          startIcon={<Refresh />}
          onClick={resetTimer}
          size="large"
        >
          리셋
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<SkipNext />}
          onClick={nextSession}
          size="large"
        >
          다음
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              완료된 세션
            </Typography>
            <Typography variant="h4" color="success.main">
              {state.completedSessions}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary">
              총 집중 시간
            </Typography>
            <Typography variant="h4" color="success.main">
              {Math.floor(state.totalFocusTime / 60)}분
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
