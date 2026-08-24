import AnimatedBackground from '../components/AnimatedBackground';

export default function Settings({ settings, onUpdate, onBack, onResetProgress, sfx, embedded = false }) {
  const toggle = (key) => { sfx.click(); onUpdate({ [key]: !settings[key] }); };

  const content = (
    <div className="content-layer" style={{ alignItems: 'center', gap: 20, width: '100%' }}>
        <div className="topbar" style={{ maxWidth: 380 }}>
          <button className="btn-icon" onClick={() => { sfx.click(); onBack(); }} aria-label="Back">←</button>
          <span className="title">Settings</span>
          <span style={{ width: 44 }} />
        </div>

        <div className="card fade-up" style={{ width: '100%', maxWidth: 380, padding: '4px 20px' }}>
          <div className="setting-row">
            <label>Music</label>
            <button className={`toggle${settings.musicOn ? ' on' : ''}`} onClick={() => toggle('musicOn')} aria-label="Toggle music">
              <span className="knob" />
            </button>
          </div>
          <div className="setting-row">
            <label>Music Volume</label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.musicVolume}
              onChange={(e) => onUpdate({ musicVolume: parseFloat(e.target.value) })}
            />
          </div>
          <div className="setting-row">
            <label>SFX</label>
            <button className={`toggle${settings.sfxOn ? ' on' : ''}`} onClick={() => toggle('sfxOn')} aria-label="Toggle sound effects">
              <span className="knob" />
            </button>
          </div>
          <div className="setting-row">
            <label>SFX Volume</label>
            <input
              type="range" min="0" max="1" step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => onUpdate({ sfxVolume: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <button className="btn btn-danger btn-block fade-up delay-1" style={{ maxWidth: 380 }} onClick={() => { sfx.click(); onResetProgress(); }}>
          Reset Progress
        </button>
      </div>
  );

  if (embedded) return content;

  return (
    <div className="screen">
      <AnimatedBackground />
      {content}
    </div>
  );
}
