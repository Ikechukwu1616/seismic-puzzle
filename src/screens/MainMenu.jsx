import AnimatedBackground from '../components/AnimatedBackground';
import SeismicLogo from '../components/SeismicLogo';
import { TOTAL_LEVELS } from '../data/levels';

export default function MainMenu({ username, progress, onNavigate, onResetRequest, sfx }) {
  const completedCount = Object.keys(progress.completed).length;
  // A brand new player has finished nothing and is still sitting on level 1.
  const isNewPlayer = completedCount === 0 && progress.unlockedLevel <= 1;
  const allDone = completedCount >= TOTAL_LEVELS;

  const playLabel = isNewPlayer ? 'Play' : allDone ? 'Replay Latest' : 'Continue';

  const go = (screen) => { sfx.click(); onNavigate(screen); };

  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer" style={{ alignItems: 'center', gap: 26 }}>
        <div className="fade-up" style={{ textAlign: 'center' }}>
          <SeismicLogo size={38} />
          <p className="eyebrow" style={{ marginTop: 8 }}>
            {isNewPlayer ? `Welcome, ${username}` : `Welcome back, ${username}`}
          </p>
        </div>

        <nav className="menu-panel fade-up delay-1">
          <button className="menu-item" onClick={() => go('game')}>
            {playLabel} <span className="arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => go('levelSelect')}>
            Level Select <span className="arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => go('howto')}>
            How to Play <span className="arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => go('settings')}>
            Settings <span className="arrow">→</span>
          </button>
          <button className="menu-item" onClick={() => go('credits')}>
            Credits <span className="arrow">→</span>
          </button>
          {!isNewPlayer && (
            <button className="menu-item" style={{ color: 'var(--danger)' }} onClick={() => { sfx.click(); onResetRequest(); }}>
              Reset Progress <span className="arrow" style={{ color: 'var(--danger)' }}>↺</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
