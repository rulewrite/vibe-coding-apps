import { Settings as SettingsIcon } from '@mui/icons-material';
import {
  AppBar,
  Container,
  CssBaseline,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import { useState } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { Timer } from './components/Timer';
import { TimerProvider } from './contexts/TimerContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FF9800',
    },
  },
});

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TimerProvider>
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              뽀모도로 타이머
            </Typography>
            <IconButton onClick={() => setSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container>
          <Timer />
        </Container>
        <SettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      </TimerProvider>
    </ThemeProvider>
  );
}

export default App;
