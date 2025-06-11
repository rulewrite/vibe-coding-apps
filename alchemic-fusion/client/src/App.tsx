import './App.css';
import { GameArena } from './components/GameArena';
import { ResultScreen } from './components/ResultScreen';
import { WaitingRoom } from './components/WaitingRoom';
import { useGameStore } from './store/gameStore';

function App() {
  const { phase } = useGameStore();

  return (
    <div className="App">
      {phase === 'waiting' && <WaitingRoom />}
      {phase === 'playing' && <GameArena />}
      {phase === 'finished' && <ResultScreen />}
    </div>
  );
}

export default App;
