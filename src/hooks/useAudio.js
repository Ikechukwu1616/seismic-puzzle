import { useEffect, useMemo } from 'react';
import { audioManager } from '../utils/audioManager';

// Syncs the singleton audioManager with saved settings, and hands back a
// stable object of sfx callbacks so components that depend on it don't
// re-run effects on every render.
export function useAudio(settings) {
  useEffect(() => {
    audioManager.applySettings(settings);
  }, [settings.musicOn, settings.sfxOn, settings.musicVolume, settings.sfxVolume]);

  useEffect(() => {
    const start = () => {
      audioManager.playMusic();
      window.removeEventListener('pointerdown', start);
    };
    window.addEventListener('pointerdown', start, { once: true });
    return () => window.removeEventListener('pointerdown', start);
  }, []);

  return useMemo(() => ({
    click: () => audioManager.playSfx('click'),
    pickup: () => audioManager.playSfx('pickup'),
    place: () => audioManager.playSfx('place'),
    wrong: () => audioManager.playSfx('wrong'),
    complete: () => audioManager.playSfx('complete'),
  }), []);
}
