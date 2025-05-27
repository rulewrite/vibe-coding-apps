import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from '@mui/material';
import React, { useState } from 'react';
import { useTimer } from '../contexts/TimerContext';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useTimer();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange =
    (field: keyof typeof settings) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        event.target.type === 'checkbox'
          ? event.target.checked
          : Math.max(1, Math.min(60, parseInt(event.target.value) || 1));

      setLocalSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>설정</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="집중 시간 (분)"
            type="number"
            value={localSettings.focusTime}
            onChange={handleChange('focusTime')}
            inputProps={{ min: 1, max: 60 }}
            fullWidth
          />
          <TextField
            label="짧은 휴식 시간 (분)"
            type="number"
            value={localSettings.shortBreakTime}
            onChange={handleChange('shortBreakTime')}
            inputProps={{ min: 1, max: 30 }}
            fullWidth
          />
          <TextField
            label="긴 휴식 시간 (분)"
            type="number"
            value={localSettings.longBreakTime}
            onChange={handleChange('longBreakTime')}
            inputProps={{ min: 1, max: 60 }}
            fullWidth
          />
          <TextField
            label="긴 휴식 전 필요한 집중 세션 수"
            type="number"
            value={localSettings.sessionsBeforeLongBreak}
            onChange={handleChange('sessionsBeforeLongBreak')}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={localSettings.soundEnabled}
                onChange={handleChange('soundEnabled')}
              />
            }
            label="알림음"
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
