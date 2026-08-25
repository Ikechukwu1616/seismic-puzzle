import { useEffect, useMemo } from 'react';
import { audioManager } from '../utils/audioManager';

// Syncs the singleton audioManager with saved settings, and hands back a
// stable object of sfx callbacks so components that depend on it don't
// re-run effects on every render.
export function useAudio(settings) {
  useEffect(() => {
    audioManager.applySettings(settings);
  }, [settings.musicOn, settings.sfxOn, settings.musicVolume, settings.sfxVolume]);

  // Browsers block audio until the user actually interacts with the page.
  // Try immediately (works if the user has already interacted, e.g. after a
  // reload), then keep listening on every common gesture type until one of
  // them succeeds. The listeners remove themselves once music is playing.
  useEffect(() => {
    audioManager.playMusic();

    const events = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'click'];

    const unlock = () => {
      audioManager.playMusic();
      if (audioManager.isPlaying()) {
        events.forEach((e) => window.removeEventListener(e, unlock));
      }
    };

    events.forEach((e) => window.addEventListener(e, unlock));

    // Also retry when the tab regains focus or becomes visible again.
    const onVisible = () => {
      if (document.visibilityState === 'visible') audioManager.playMusic();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      events.forEach((e) => window.removeEventListener(e, unlock));
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return useMemo(() => ({
    click: () => audioManager.playSfx('click'),
    pickup: () => audioManager.playSfx('pickup'),
    place: () => audioManager.playSfx('place'),
    wrong: () => audioManager.playSfx('wrong'),
    complete: () => audioManager.playSfx('complete'),
  }), []);
}
