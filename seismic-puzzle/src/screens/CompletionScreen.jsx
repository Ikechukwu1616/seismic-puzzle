import AnimatedBackground from '../components/AnimatedBackground';
import { getLevel } from '../data/levels';

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function CompletionScreen({ levelId, nextLevelId, result, onNext, onReplay, onLevelSelect, sfx }) {
  const level = getLevel(levelId);
  const score = Math.max(0, Math.round(result.accuracy * 10 - result.hintsUsed * 15 + Math.max(0, 6000 - result.timeMs / 100)));

  const act = (fn) => { sfx.click(); fn(); };

  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer fade-up" style={{ alignItems: 'center', gap: 6, width: '100%', maxWidth: 420 }}>
        <span className="eyebrow">Level {String(levelId).padStart(2, '0')} Complete</span>
        <div className="completion-portrait">
          <img src={level.image} alt={level.character} />
        </div>
        <h1 className="seismic-mark" style={{ fontSize: 30, margin: '4px 0' }}>
          {level.character} <span className="crack">Restored</span>
        </h1>

        <div className="stat-row">
          <div className="stat-box"><div className="val">{fmtTime(result.timeMs)}</div><div className="lbl">Time</div></div>
          <div className="stat-box"><div className="val">{result.moves}</div><div className="lbl">Moves</div></div>
          <div className="stat-box"><div className="val">{result.accuracy}%</div><div className="lbl">Accuracy</div></div>
        </div>

        <div className="card" style={{ width: '100%', padding: '18px 20px', textAlign: 'center', marginBottom: 20 }}>
          <div className="small-note">SCORE</div>
          <div className="seismic-mark" style={{ fontSize: 32 }}>{score}</div>
          {result.hintsUsed > 0 && <div className="small-note" style={{ marginTop: 4 }}>{result.hintsUsed} hint{result.hintsUsed > 1 ? 's' : ''} used</div>}
        </div>

        <div className="menu-panel">
          {nextLevelId ? (
            <button className="btn btn-primary btn-block" onClick={() => act(onNext)}>Next Level</button>
          ) : (
            <div className="small-note" style={{ textAlign: 'center', marginBottom: 4 }}>You've restored every character. More coming soon.</div>
          )}
          <button className="btn btn-secondary btn-block" onClick={() => act(onReplay)}>Replay Level</button>
          <button className="btn btn-ghost btn-block" onClick={() => act(onLevelSelect)}>Level Select</button>
        </div>
      </div>
    </div>
  );
}
