import AnimatedBackground from '../components/AnimatedBackground';

const STEPS = [
  { n: 1, text: 'Pick up a puzzle piece scattered around the tray.' },
  { n: 2, text: 'Drag it anywhere on the board - works with mouse or touch.' },
  { n: 3, text: 'Find the dashed outline that matches its shape.' },
  { n: 4, text: 'Drop it near that outline - it doesn\'t need to be pixel-perfect.' },
  { n: 5, text: 'Correct pieces snap into place. You can still pick a placed piece back up any time if you want to move it.' },
  { n: 6, text: 'Place every piece to fully restore the character and clear the level.' },
];

export default function HowToPlay({ onBack, sfx }) {
  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer" style={{ alignItems: 'center', gap: 20, width: '100%' }}>
        <div className="topbar" style={{ maxWidth: 420 }}>
          <button className="btn-icon" onClick={() => { sfx.click(); onBack(); }} aria-label="Back">←</button>
          <span className="title">How to Play</span>
          <span style={{ width: 44 }} />
        </div>

        <div className="card fade-up" style={{ width: '100%', maxWidth: 420, padding: '4px 22px' }}>
          {STEPS.map((s) => (
            <div className="step-card" key={s.n}>
              <span className="step-num">{String(s.n).padStart(2, '0')}</span>
              <div className="step-text"><p>{s.text}</p></div>
            </div>
          ))}
        </div>

        <p className="small-note" style={{ maxWidth: 420, textAlign: 'center' }}>
          Use the hint button in-game to briefly highlight where one unplaced piece belongs.
        </p>
      </div>
    </div>
  );
}
