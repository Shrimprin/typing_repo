import { useCallback, useEffect, useRef, useState } from 'react';

import { Stats } from '@/types';

export function useTypingStats() {
  const [stats, setStats] = useState<Stats>({
    accuracy: 100,
    elapsedSeconds: 0,
    totalCorrectTypeCount: 0,
    totalTypoCount: 0,
    wpm: 0,
  });
  const lastMeasureTimeRef = useRef<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTyping || !lastMeasureTimeRef.current) return;

      const currentTime = performance.now();
      const newElapsedSeconds = stats.elapsedSeconds + Math.floor((currentTime - lastMeasureTimeRef.current) / 1000);

      setStats((prev) => ({
        ...prev,
        elapsedSeconds: newElapsedSeconds,
        wpm:
          prev.totalCorrectTypeCount > 0 && newElapsedSeconds > 0
            ? Math.round((prev.totalCorrectTypeCount / 5 / (newElapsedSeconds / 60)) * 10) / 10
            : 0,
      }));

      lastMeasureTimeRef.current = currentTime;
    }, 1000);

    return () => clearInterval(interval);
  }, [isTyping, stats.elapsedSeconds]);

  const startStats = useCallback(() => {
    if (isTyping) return;

    setStats({
      accuracy: 100,
      elapsedSeconds: 0,
      totalCorrectTypeCount: 0,
      totalTypoCount: 0,
      wpm: 0,
    });
    lastMeasureTimeRef.current = performance.now();
    setIsTyping(true);
  }, [isTyping]);

  const pauseStats = useCallback(() => {
    if (!isTyping) return;

    lastMeasureTimeRef.current = null;
    setIsTyping(false);
  }, [isTyping]);

  const resumeStats = useCallback(() => {
    if (isTyping) return;

    lastMeasureTimeRef.current = performance.now();
    setIsTyping(true);
  }, [isTyping]);

  const completeStats = useCallback(() => {
    if (!isTyping) return;

    lastMeasureTimeRef.current = null;
    setIsTyping(false);
  }, [isTyping]);

  const resetStats = useCallback(() => {
    setStats({
      accuracy: 100,
      elapsedSeconds: 0,
      totalCorrectTypeCount: 0,
      totalTypoCount: 0,
      wpm: 0,
    });
    lastMeasureTimeRef.current = null;
    setIsTyping(false);
  }, []);

  const updateStats = useCallback(
    (isCorrect: boolean) => {
      if (!isTyping) return;

      setStats((prev) => {
        const newCorrectCount = isCorrect ? prev.totalCorrectTypeCount + 1 : prev.totalCorrectTypeCount;
        const newTypoCount = isCorrect ? prev.totalTypoCount : prev.totalTypoCount + 1;
        const newTotalCount = newCorrectCount + newTypoCount;

        const newAccuracy = newTotalCount > 0 ? Math.round((newCorrectCount / newTotalCount) * 1000) / 10 : 100;

        const newWpm =
          prev.elapsedSeconds > 0 && newCorrectCount > 0
            ? Math.round((newCorrectCount / 5 / (prev.elapsedSeconds / 60)) * 10) / 10
            : 0;

        return {
          ...prev,
          totalCorrectTypeCount: newCorrectCount,
          totalTypoCount: newTypoCount,
          accuracy: newAccuracy,
          wpm: newWpm,
        };
      });
    },
    [isTyping],
  );

  const restoreStats = useCallback(
    (
      savedAccuracy: number,
      savedElapsedSeconds: number,
      savedCorrectTypeCount: number,
      savedTypoCount: number,
      savedWpm: number,
    ) => {
      setStats({
        accuracy: savedAccuracy,
        elapsedSeconds: savedElapsedSeconds,
        totalCorrectTypeCount: savedCorrectTypeCount,
        totalTypoCount: savedTypoCount,
        wpm: savedWpm,
      });
      lastMeasureTimeRef.current = null;
      setIsTyping(false);
    },
    [],
  );

  return {
    ...stats,
    startStats,
    pauseStats,
    resumeStats,
    completeStats,
    resetStats,
    updateStats,
    restoreStats,
  };
}
