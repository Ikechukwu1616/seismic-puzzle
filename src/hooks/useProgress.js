import { useCallback, useState } from 'react';
import { loadProgress, saveProgress, recordLevelComplete, resetAllProgress } from '../utils/storage';

export function useProgress() {
  const [progress, setProgress] = useState(() => loadProgress());

  const updateSettings = useCallback((partial) => {
    setProgress((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...partial } };
      saveProgress(next);
      return next;
    });
  }, []);

  const completeLevel = useCallback((levelId, nextLevelId, result) => {
    setProgress((prev) => recordLevelComplete(prev, levelId, nextLevelId, result));
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = resetAllProgress();
    setProgress(fresh);
  }, []);

  return { progress, updateSettings, completeLevel, resetProgress };
}
