import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { PomodoroSettings } from '../../../pomodoro-core';
import { useTimer } from '../contexts/TimerContext';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { state, updateSettings } = useTimer();
  const [settings, setSettings] = useState<PomodoroSettings>({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
  });

  useEffect(() => {
    // 모달이 열릴 때마다 현재 설정값으로 초기화
    const savedSettings = localStorage.getItem('pomodoroSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [open]);

  const handleChange =
    (field: keyof PomodoroSettings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(
        1,
        Math.min(60, parseInt(event.target.value) || 1)
      );
      setSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSave = () => {
    updateSettings(settings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>뽀모도로 타이머 설정</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="집중 시간 (분)"
            type="number"
            value={settings.focusTime}
            onChange={handleChange('focusTime')}
            inputProps={{ min: 1, max: 60 }}
            fullWidth
          />
          <TextField
            label="짧은 휴식 시간 (분)"
            type="number"
            value={settings.shortBreakTime}
            onChange={handleChange('shortBreakTime')}
            inputProps={{ min: 1, max: 60 }}
            fullWidth
          />
          <TextField
            label="긴 휴식 시간 (분)"
            type="number"
            value={settings.longBreakTime}
            onChange={handleChange('longBreakTime')}
            inputProps={{ min: 1, max: 60 }}
            fullWidth
          />
          <TextField
            label="긴 휴식 전 세션 수"
            type="number"
            value={settings.sessionsBeforeLongBreak}
            onChange={handleChange('sessionsBeforeLongBreak')}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}
