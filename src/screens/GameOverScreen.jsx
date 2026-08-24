import AnimatedBackground from '../components/AnimatedBackground';
import { getLevel } from '../data/levels';

export default function GameOverScreen({ levelId, onRestart, onLevelSelect, sfx }) {
  const level = getLevel(levelId);
  const act = (fn) => { sfx.click(); fn(); };

  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer fade-up" style={{ alignItems: 'center', gap: 14, width: '100%', maxWidth: 380 }}>
        <span className="eyebrow" style={{ color: 'var(--danger)' }}>Time up</span>
        <h1 className="seismic-mark" style={{ fontSize: 36, margin: '6px 0' }}>
          GAME <span className="crack" style={{ color: 'var(--danger)', textShadow: '0 0 18px rgba(255,84,112,0.55)' }}>OVER</span>
        </h1>
        <p style={{ color: 'var(--ink-1)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
          You ran out of time on Level {String(levelId).padStart(2, '0')}, {level.character}. Give it another shot.
        </p>

        <div className="menu-panel" style={{ marginTop: 12 }}>
          <button className="btn btn-primary btn-block" onClick={() => act(onRestart)}>Restart Level</button>
          <button className="btn btn-ghost btn-block" onClick={() => act(onLevelSelect)}>Level Select</button>
        </div>
      </div>
    </div>
  );
}
