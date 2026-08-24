// Centralized save system - every localStorage read/write for SEISMIC goes through here.

const KEYS = {
  USERNAME: 'seismic_username',
  PROGRESS: 'seismic_progress_v1',
};

const DEFAULT_PROGRESS = {
  unlockedLevel: 1, // highest level id the player may play
  completed: {},    // { [levelId]: { bestTimeMs, bestMoves, bestAccuracy, hintsUsed, completedAt } }
  settings: {
    musicOn: true,
    sfxOn: true,
    musicVolume: 0.5,
    sfxVolume: 0.7,
  },
};

function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function getUsername() {
  try {
    return localStorage.getItem(KEYS.USERNAME) || '';
  } catch {
    return '';
  }
}

export function setUsername(name) {
  try {
    localStorage.setItem(KEYS.USERNAME, name);
  } catch {
    /* storage unavailable - fail silently, game still works in-session */
  }
}

export function loadProgress() {
  let raw = null;
  try {
    raw = localStorage.getItem(KEYS.PROGRESS);
  } catch {
    raw = null;
  }
  const parsed = safeParse(raw, DEFAULT_PROGRESS);
  return {
    ...DEFAULT_PROGRESS,
    ...parsed,
    settings: { ...DEFAULT_PROGRESS.settings, ...(parsed.settings || {}) },
    completed: parsed.completed || {},
  };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

export function recordLevelComplete(progress, levelId, nextLevelId, result) {
  const prevBest = progress.completed[levelId];
  const best = {
    bestTimeMs: prevBest ? Math.min(prevBest.bestTimeMs, result.timeMs) : result.timeMs,
    bestMoves: prevBest ? Math.min(prevBest.bestMoves, result.moves) : result.moves,
    bestAccuracy: prevBest ? Math.max(prevBest.bestAccuracy, result.accuracy) : result.accuracy,
    hintsUsed: prevBest ? Math.min(prevBest.hintsUsed, result.hintsUsed) : result.hintsUsed,
    completedAt: Date.now(),
  };
  const updated = {
    ...progress,
    unlockedLevel: nextLevelId ? Math.max(progress.unlockedLevel, nextLevelId) : progress.unlockedLevel,
    completed: { ...progress.completed, [levelId]: best },
  };
  saveProgress(updated);
  return updated;
}

export function resetAllProgress() {
  try {
    localStorage.removeItem(KEYS.PROGRESS);
    localStorage.removeItem(KEYS.USERNAME);
  } catch {
    /* ignore */
  }
  return DEFAULT_PROGRESS;
}

export { DEFAULT_PROGRESS };
