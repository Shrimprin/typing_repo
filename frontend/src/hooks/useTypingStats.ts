import { useCallback, useEffect, useState } from 'react';

import { Stats } from '@/types';

export function useTypingStats() {
  const [accuracy, setAccuracy] = useState(100);
  const [correctTypeCount, setCorrectTypeCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [typoCount, setTypoCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [lastMeasureTime, setLastMeasureTime] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTyping || !lastMeasureTime) return;

      const currentTime = Date.now();
      const newElapsedSeconds = elapsedSeconds + Math.floor((currentTime - lastMeasureTime) / 1000);
      setElapsedSeconds(newElapsedSeconds);
      setLastMeasureTime(currentTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTyping, lastMeasureTime, elapsedSeconds]);

  useEffect(() => {
    if (!isTyping || !lastMeasureTime || correctTypeCount === 0 || elapsedSeconds === 0) return;

    const elapsedMinutes = elapsedSeconds / 60;
    const newWpm = Math.round(correctTypeCount / 5 / elapsedMinutes);
    setWpm(newWpm);
  }, [isTyping, lastMeasureTime, elapsedSeconds, correctTypeCount]);

  useEffect(() => {
    const totalTypeCount = correctTypeCount + typoCount;
    if (totalTypeCount > 0) {
      const newAccuracy = Math.round((correctTypeCount / totalTypeCount) * 100);
      setAccuracy(newAccuracy);
    } else {
      setAccuracy(100);
    }
  }, [correctTypeCount, typoCount]);

  const startStats = useCallback(() => {
    setAccuracy(100);
    setCorrectTypeCount(0);
    setElapsedSeconds(0);
    setTypoCount(0);
    setWpm(0);
    setLastMeasureTime(Date.now());
    setIsTyping(true);
  }, [setAccuracy, setCorrectTypeCount, setElapsedSeconds, setTypoCount, setWpm, setLastMeasureTime, setIsTyping]);

  const pauseStats = useCallback(() => {
    setLastMeasureTime(null);
    setIsTyping(false);
  }, [setLastMeasureTime, setIsTyping]);

  const resumeStats = useCallback(() => {
    setLastMeasureTime(Date.now());
    setIsTyping(true);
  }, [setLastMeasureTime, setIsTyping]);

  const resetStats = useCallback(() => {
    setAccuracy(100);
    setCorrectTypeCount(0);
    setElapsedSeconds(0);
    setTypoCount(0);
    setWpm(0);
    setLastMeasureTime(null);
    setIsTyping(false);
  }, [setAccuracy, setCorrectTypeCount, setElapsedSeconds, setTypoCount, setWpm, setLastMeasureTime, setIsTyping]);

  const updateStats = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setCorrectTypeCount((prev) => prev + 1);
      } else {
        setTypoCount((prev) => prev + 1);
      }
    },
    [setCorrectTypeCount, setTypoCount],
  );

  const restoreStats = useCallback(
    (
      savedAccuracy: number,
      savedCorrectTypeCount: number,
      savedElapsedSeconds: number,
      savedTypoCount: number,
      savedWpm: number,
    ) => {
      setAccuracy(savedAccuracy);
      setCorrectTypeCount(savedCorrectTypeCount);
      setElapsedSeconds(savedElapsedSeconds);
      setTypoCount(savedTypoCount);
      setWpm(savedWpm);
      setLastMeasureTime(null);
      setIsTyping(false);
    },
    [setAccuracy, setCorrectTypeCount, setElapsedSeconds, setTypoCount, setWpm, setLastMeasureTime, setIsTyping],
  );

  const stats: Stats = {
    accuracy,
    correctTypeCount,
    elapsedSeconds,
    typoCount,
    wpm,
  };

  return {
    ...stats,
    startStats,
    pauseStats,
    resumeStats,
    resetStats,
    updateStats,
    restoreStats,
  };
}
