import AnimatedBackground from '../components/AnimatedBackground';
import SeismicLogo from '../components/SeismicLogo';
import { TOTAL_LEVELS } from '../data/levels';

export default function MainMenu({ username, progress, onNavigate, onResetRequest, sfx }) {
  const allDone = progress.unlockedLevel > TOTAL_LEVELS ||
    (progress.unlockedLevel === TOTAL_LEVELS && Object.keys(progress.completed).length >= TOTAL_LEVELS);

  const go = (screen) => { sfx.click(); onNavigate(screen); };

  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer" style={{ alignItems: 'center', gap: 26 }}>
        <div className="fade-up" style={{ textAlign: 'center' }}>
          <SeismicLogo size={38} />
          <p className="eyebrow" style={{ marginTop: 8 }}>Welcome back, {username}</p>
        </div>

        <nav className="menu-panel fade-up delay-1">
          <button className="menu-item" onClick={() => go('game')}>
            {allDone ? 'Replay Latest' : 'Continue'} <span className="arrow">→</span>
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
          <button className="menu-item" style={{ color: 'var(--danger)' }} onClick={() => { sfx.click(); onResetRequest(); }}>
            Reset Progress <span className="arrow" style={{ color: 'var(--danger)' }}>↺</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
