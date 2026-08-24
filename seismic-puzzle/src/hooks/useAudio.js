import { useEffect, useRef } from 'react';
import { audioManager } from '../utils/audioManager';

// Syncs the singleton audioManager with saved settings, without ever
// re-instantiating or restarting the <audio> element on re-render.
export function useAudio(settings) {
  const applied = useRef(null);

  useEffect(() => {
    const key = JSON.stringify(settings);
    if (applied.current === key) return;
    applied.current = key;
    audioManager.applySettings(settings);
  }, [settings]);

  useEffect(() => {
    const start = () => {
      audioManager.playMusic();
      window.removeEventListener('pointerdown', start);
    };
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, []);

  return {
    click: () => audioManager.playSfx('click'),
    pickup: () => audioManager.playSfx('pickup'),
    place: () => audioManager.playSfx('place'),
    wrong: () => audioManager.playSfx('wrong'),
    complete: () => audioManager.playSfx('complete'),
  };
}
