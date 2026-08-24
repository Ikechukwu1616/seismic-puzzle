import { useEffect, useRef, useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import { getLevel } from '../data/levels';

const TIME_LIMIT_MS = 3 * 60 * 1000;
const AUTO_ADVANCE_MS = 5000;

function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export default function CompletionScreen({ levelId, nextLevelId, result, onNext, onReplay, onLevelSelect, sfx }) {
  const level = getLevel(levelId);
  const timeLeftMs = Math.max(0, TIME_LIMIT_MS - result.timeMs);
  const timeLeftLabel = fmtTime(timeLeftMs);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(AUTO_ADVANCE_MS / 1000));
  const advancedRef = useRef(false);

  const act = (fn) => { advancedRef.current = true; sfx.click(); fn(); };

  // Auto-advance to the next level a few seconds after landing here, so you
  // don't have to sit and click through. Any manual button press cancels it.
  useEffect(() => {
    if (!nextLevelId) return undefined;
    const tickId = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    const advanceId = setTimeout(() => {
      if (!advancedRef.current) {
        advancedRef.current = true;
        onNext();
      }
    }, AUTO_ADVANCE_MS);
    return () => { clearInterval(tickId); clearTimeout(advanceId); };
  }, [nextLevelId, onNext]);

  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer fade-up" style={{ alignItems: 'center', gap: 6, width: '100%', maxWidth: 420 }}>
        <span className="eyebrow" style={{ color: 'var(--fracture)' }}>Level {String(levelId).padStart(2, '0')} Complete</span>
        <div className="completion-portrait">
          <img src={level.image} alt={level.character} />
        </div>
        <h1 className="seismic-mark" style={{ fontSize: 30, margin: '4px 0', textAlign: 'center' }}>
          <span className="crack">Congratulations</span>
        </h1>
        <p style={{ color: 'var(--ink-1)', textAlign: 'center', margin: '0 0 6px', lineHeight: 1.5 }}>
          You restored {level.character} with <strong style={{ color: 'var(--fracture)' }}>{timeLeftLabel}</strong> to spare.
        </p>

        <div className="stat-row">
          <div className="stat-box"><div className="val">{fmtTime(result.timeMs)}</div><div className="lbl">Time</div></div>
          <div className="stat-box"><div className="val">{result.moves}</div><div className="lbl">Moves</div></div>
          <div className="stat-box"><div className="val">{result.accuracy}%</div><div className="lbl">Accuracy</div></div>
        </div>

        <div className="menu-panel">
          {nextLevelId ? (
            <button className="btn btn-primary btn-block" onClick={() => act(onNext)}>
              Play Next Level {secondsLeft > 0 ? `(${secondsLeft})` : ''}
            </button>
          ) : (
            <div className="small-note" style={{ textAlign: 'center', marginBottom: 4 }}>
              You've restored every character. More coming soon.
            </div>
          )}
          <button className="btn btn-secondary btn-block" onClick={() => act(onReplay)}>Replay Level</button>
          <button className="btn btn-ghost btn-block" onClick={() => act(onLevelSelect)}>Level Select</button>
        </div>
      </div>
    </div>
  );
}
