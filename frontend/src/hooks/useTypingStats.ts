import { useCallback, useEffect, useRef, useState } from 'react';

import { Stats } from '@/types';

export function useTypingStats() {
  const [accuracy, setAccuracy] = useState(100);
  const [totalCorrectTypeCount, setTotalCorrectTypeCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalTypoCount, setTotalTypoCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const lastMeasureTimeRef = useRef<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTyping || !lastMeasureTimeRef.current) return;

      const currentTime = performance.now();
      const newElapsedSeconds = elapsedSeconds + Math.floor((currentTime - lastMeasureTimeRef.current) / 1000);
      setElapsedSeconds(newElapsedSeconds);
      lastMeasureTimeRef.current = currentTime;
    }, 1000);

    return () => clearInterval(interval);
  }, [isTyping, elapsedSeconds]);

  useEffect(() => {
    if (!isTyping || !lastMeasureTimeRef.current || totalCorrectTypeCount === 0 || elapsedSeconds === 0) return;

    const elapsedMinutes = elapsedSeconds / 60;
    const newWpm = Math.round(totalCorrectTypeCount / 5 / elapsedMinutes);
    setWpm(newWpm);
  }, [isTyping, elapsedSeconds, totalCorrectTypeCount]);

  useEffect(() => {
    const totalTypeCount = totalCorrectTypeCount + totalTypoCount;
    if (totalTypeCount > 0) {
      const newAccuracy = Math.round((totalCorrectTypeCount / totalTypeCount) * 100);
      setAccuracy(newAccuracy);
    } else {
      setAccuracy(100);
    }
  }, [totalCorrectTypeCount, totalTypoCount]);

  const startStats = useCallback(() => {
    setAccuracy(100);
    setTotalCorrectTypeCount(0);
    setElapsedSeconds(0);
    setTotalTypoCount(0);
    setWpm(0);
    lastMeasureTimeRef.current = performance.now();
    setIsTyping(true);
  }, []);

  const pauseStats = useCallback(() => {
    lastMeasureTimeRef.current = null;
    setIsTyping(false);
  }, []);

  const resumeStats = useCallback(() => {
    lastMeasureTimeRef.current = performance.now();
    setIsTyping(true);
  }, []);

  const resetStats = useCallback(() => {
    setAccuracy(100);
    setTotalCorrectTypeCount(0);
    setElapsedSeconds(0);
    setTotalTypoCount(0);
    setWpm(0);
    lastMeasureTimeRef.current = null;
    setIsTyping(false);
  }, []);

  const updateStats = useCallback(
    (isCorrect: boolean) => {
      if (isCorrect) {
        setTotalCorrectTypeCount((prev) => prev + 1);
      } else {
        setTotalTypoCount((prev) => prev + 1);
      }
    },
    [setTotalCorrectTypeCount, setTotalTypoCount],
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
      setTotalCorrectTypeCount(savedCorrectTypeCount);
      setElapsedSeconds(savedElapsedSeconds);
      setTotalTypoCount(savedTypoCount);
      setWpm(savedWpm);
      lastMeasureTimeRef.current = null;
      setIsTyping(false);
    },
    [],
  );

  const stats: Stats = {
    accuracy,
    totalCorrectTypeCount,
    elapsedSeconds,
    totalTypoCount,
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
