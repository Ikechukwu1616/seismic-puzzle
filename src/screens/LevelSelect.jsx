import AnimatedBackground from '../components/AnimatedBackground';
import { LEVELS } from '../data/levels';

export default function LevelSelect({ progress, onPlayLevel, onBack, sfx }) {
  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer" style={{ alignItems: 'center', gap: 22, width: '100%' }}>
        <div className="topbar" style={{ maxWidth: 460 }}>
          <button className="btn-icon" onClick={() => { sfx.click(); onBack(); }} aria-label="Back">←</button>
          <span className="title">Level Select</span>
          <span style={{ width: 44 }} />
        </div>

        <div className="level-grid fade-up">
          {LEVELS.map((lvl) => {
            const unlocked = lvl.id <= progress.unlockedLevel;
            const completed = !!progress.completed[lvl.id];
            return (
              <button
                key={lvl.id}
                className={`level-tile${unlocked ? ' unlocked' : ' locked'}${completed ? ' completed' : ''}`}
                disabled={!unlocked}
                onClick={() => { sfx.click(); onPlayLevel(lvl.id); }}
                style={unlocked ? { backgroundImage: `url(${lvl.image})` } : undefined}
              >
                <span className="tile-shade" />
                {completed && <span className="badge">✓</span>}
                {!unlocked && <span className="badge">🔒</span>}
                <span className="num">{String(lvl.id).padStart(2, '0')}</span>
                <span className="small-note">{lvl.character}</span>
                <span className="diff-dots">
                  {[1, 2, 3].map((d) => (
                    <span key={d} className={d <= lvl.difficulty ? 'on' : ''} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
