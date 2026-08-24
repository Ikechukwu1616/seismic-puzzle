// Singleton audio manager. Lives outside React so background music is never
// re-created or restarted when components re-render or screens change.
//
// PLACE YOUR REAL AUDIO FILES HERE (create the folder if it doesn't exist):
//   /public/audio/music-theme.mp3      - looping background music
//   /public/audio/sfx-click.mp3        - button click
//   /public/audio/sfx-pickup.mp3       - piece picked up
//   /public/audio/sfx-place.mp3        - correct placement
//   /public/audio/sfx-wrong.mp3        - incorrect placement
//   /public/audio/sfx-complete.mp3     - level completed
//
// Until real files are added, missing-file playback errors are caught and
// silently ignored - the game remains fully playable without audio.

const SFX_PATHS = {
  click: '/audio/sfx-click.mp3',
  pickup: '/audio/sfx-pickup.mp3',
  place: '/audio/sfx-place.mp3',
  wrong: '/audio/sfx-wrong.mp3',
  complete: '/audio/sfx-complete.mp3',
};

const MUSIC_PATH = '/audio/music-theme.mp3';

class AudioManager {
  constructor() {
    this.music = typeof Audio !== 'undefined' ? new Audio(MUSIC_PATH) : null;
    if (this.music) {
      this.music.loop = true;
      this.music.volume = 0.5;
    }
    this.sfxVolume = 0.7;
    this.musicOn = true;
    this.sfxOn = true;
    this._sfxCache = {};
  }

  applySettings({ musicOn, sfxOn, musicVolume, sfxVolume }) {
    this.musicOn = musicOn;
    this.sfxOn = sfxOn;
    this.sfxVolume = sfxVolume;
    if (this.music) {
      this.music.volume = musicVolume;
      if (musicOn) this.playMusic();
      else this.music.pause();
    }
  }

  playMusic() {
    if (!this.music || !this.musicOn) return;
    if (this.music.paused) {
      this.music.play().catch(() => {
        /* browsers block autoplay until first user gesture - expected */
      });
    }
  }

  stopMusic() {
    if (this.music) this.music.pause();
  }

  playSfx(name) {
    if (!this.sfxOn) return;
    const path = SFX_PATHS[name];
    if (!path) return;
    try {
      const el = new Audio(path);
      el.volume = this.sfxVolume;
      el.play().catch(() => {});
    } catch {
      /* ignore */
    }
  }
}

export const audioManager = new AudioManager();
