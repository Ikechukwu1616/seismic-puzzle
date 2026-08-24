import { useEffect } from 'react';
import AnimatedBackground from '../components/AnimatedBackground';
import SeismicLogo from '../components/SeismicLogo';

export default function LoadingScreen({ onDone }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 900);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="screen">
      <AnimatedBackground />
      <div className="content-layer fade-up" style={{ alignItems: 'center', gap: 18 }}>
        <img src="/characters/seismic-logo.png" alt="Seismic" className="loading-mark" />
        <SeismicLogo size={32} />
      </div>
    </div>
  );
}
