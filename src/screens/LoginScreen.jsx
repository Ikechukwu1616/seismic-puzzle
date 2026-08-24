import { useState } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import SeismicLogo from '../components/SeismicLogo';

export default function LoginScreen({ onLogin, sfx }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleStart = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name to continue.');
      return;
    }
    sfx.click();
    onLogin(trimmed);
  };

  return (
    <div className="screen">
      <AnimatedBackground />
      <form className="content-layer" style={{ alignItems: 'center', gap: 24, width: '100%', maxWidth: 360 }} onSubmit={handleStart}>
        <div className="fade-up" style={{ textAlign: 'center' }}>
          <SeismicLogo size={40} />
          <p className="eyebrow" style={{ marginTop: 10 }}>Rebuild what fractured</p>
        </div>

        <div className="card fade-up delay-1" style={{ width: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <label className="small-note" htmlFor="username">PLAYER NAME</label>
          <input
            id="username"
            className="text-input"
            placeholder="e.g. Dav_walker_0"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            maxLength={20}
            autoFocus
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: 13, margin: 0 }}>{error}</p>}
          <button type="submit" className="btn btn-primary btn-block">Start</button>
        </div>

        <p className="small-note fade-up delay-2" style={{ textAlign: 'center' }}>
          Created by{' '}
          <a
            href="https://x.com/Dav_walker_0"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline"
          >
            Dav_walker_0
          </a>
        </p>
      </form>
    </div>
  );
}
