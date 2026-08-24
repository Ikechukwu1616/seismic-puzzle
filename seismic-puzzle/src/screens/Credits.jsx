import AnimatedBackground from '../components/AnimatedBackground';
import SeismicLogo from '../components/SeismicLogo';

export default function Credits({ onBack, sfx }) {
  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer" style={{ alignItems: 'center', gap: 20, width: '100%' }}>
        <div className="topbar" style={{ maxWidth: 380 }}>
          <button className="btn-icon" onClick={() => { sfx.click(); onBack(); }} aria-label="Back">←</button>
          <span className="title">Credits</span>
          <span style={{ width: 44 }} />
        </div>

        <div className="card fade-up" style={{ width: '100%', maxWidth: 380, padding: 32, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          <SeismicLogo size={32} />
          <p className="small-note" style={{ fontSize: 12 }}>PUZZLE GAME</p>
          <div style={{ height: 1, width: 40, background: 'var(--border-bright)', margin: '10px 0' }} />
          <p style={{ margin: 0, color: 'var(--ink-1)' }}>Created by</p>
          <a
            href="https://x.com/Dav_walker_0"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '0.03em' }}
          >
            Dav_walker_0
          </a>
        </div>
      </div>
    </div>
  );
}
