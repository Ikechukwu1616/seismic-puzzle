import { useCallback, useState } from 'react';
import LoadingScreen from './screens/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import MainMenu from './screens/MainMenu';
import LevelSelect from './screens/LevelSelect';
import PuzzleGame from './screens/PuzzleGame';
import CompletionScreen from './screens/CompletionScreen';
import GameOverScreen from './screens/GameOverScreen';
import Settings from './screens/Settings';
import HowToPlay from './screens/HowToPlay';
import Credits from './screens/Credits';
import ConfirmModal from './components/ConfirmModal';
import { useProgress } from './hooks/useProgress';
import { useAudio } from './hooks/useAudio';
import { getUsername, setUsername as saveUsername } from './utils/storage';
import { LEVELS, TOTAL_LEVELS } from './data/levels';

function getContinueLevelId(progress) {
  const firstIncomplete = LEVELS.find((l) => l.id <= progress.unlockedLevel && !progress.completed[l.id]);
  if (firstIncomplete) return firstIncomplete.id;
  return Math.min(progress.unlockedLevel, TOTAL_LEVELS);
}

export default function App() {
  const [screen, setScreen] = useState('loading');
  const [username, setUsernameState] = useState(getUsername());
  const [activeLevelId, setActiveLevelId] = useState(1);
  const [completionData, setCompletionData] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { progress, updateSettings, completeLevel, resetProgress } = useProgress();
  const sfx = useAudio(progress.settings);

  const handleLogin = useCallback((name) => {
    saveUsername(name);
    setUsernameState(name);
    setScreen('menu');
  }, []);

  const handlePlayLevel = useCallback((levelId) => {
    setActiveLevelId(levelId);
    setScreen('game');
  }, []);

  const handleContinue = useCallback(() => {
    setActiveLevelId(getContinueLevelId(progress));
    setScreen('game');
  }, [progress]);

  const handleLevelComplete = useCallback((levelId, nextLevelId, result) => {
    completeLevel(levelId, nextLevelId, result);
    setCompletionData({ levelId, nextLevelId, result });
    setScreen('completion');
  }, [completeLevel]);

  const handleGameOver = useCallback((levelId) => {
    setActiveLevelId(levelId);
    setScreen('gameover');
  }, []);

  const handleResetConfirmed = useCallback(() => {
    resetProgress();
    setUsernameState('');
    setShowResetConfirm(false);
    setScreen('login');
  }, [resetProgress]);

  let body = null;
  switch (screen) {
    case 'loading':
      body = <LoadingScreen onDone={() => setScreen(username ? 'menu' : 'login')} />;
      break;
    case 'login':
      body = <LoginScreen onLogin={handleLogin} sfx={sfx} />;
      break;
    case 'menu':
      body = (
        <MainMenu
          username={username}
          progress={progress}
          onNavigate={(s) => (s === 'game' ? handleContinue() : setScreen(s))}
          onResetRequest={() => setShowResetConfirm(true)}
          sfx={sfx}
        />
      );
      break;
    case 'levelSelect':
      body = (
        <LevelSelect
          progress={progress}
          onPlayLevel={handlePlayLevel}
          onBack={() => setScreen('menu')}
          sfx={sfx}
        />
      );
      break;
    case 'game':
      body = (
        <PuzzleGame
          levelId={activeLevelId}
          onExit={() => setScreen('menu')}
          onComplete={handleLevelComplete}
          onGameOver={handleGameOver}
          gameSettings={progress.settings}
          onUpdateSettings={updateSettings}
          onResetProgressRequest={() => setShowResetConfirm(true)}
          sfx={sfx}
        />
      );
      break;
    case 'completion':
      body = completionData && (
        <CompletionScreen
          levelId={completionData.levelId}
          nextLevelId={completionData.nextLevelId}
          result={completionData.result}
          onNext={() => { setActiveLevelId(completionData.nextLevelId); setScreen('game'); }}
          onReplay={() => { setActiveLevelId(completionData.levelId); setScreen('game'); }}
          onLevelSelect={() => setScreen('levelSelect')}
          sfx={sfx}
        />
      );
      break;
    case 'gameover':
      body = (
        <GameOverScreen
          levelId={activeLevelId}
          onRestart={() => setScreen('game')}
          onLevelSelect={() => setScreen('levelSelect')}
          sfx={sfx}
        />
      );
      break;
    case 'settings':
      body = (
        <Settings
          settings={progress.settings}
          onUpdate={updateSettings}
          onBack={() => setScreen('menu')}
          onResetProgress={() => setShowResetConfirm(true)}
          sfx={sfx}
        />
      );
      break;
    case 'howto':
      body = <HowToPlay onBack={() => setScreen('menu')} sfx={sfx} />;
      break;
    case 'credits':
      body = <Credits onBack={() => setScreen('menu')} sfx={sfx} />;
      break;
    default:
      body = null;
  }

  return (
    <div className="scaled-view">
      {body}
      {showResetConfirm && (
        <ConfirmModal
          title="Reset Progress"
          body="This clears every unlocked level, best time, and your player name. This can't be undone."
          confirmLabel="Reset Everything"
          onConfirm={handleResetConfirmed}
          onCancel={() => setShowResetConfirm(false)}
          sfx={sfx}
        />
      )}
    </div>
  );
}
