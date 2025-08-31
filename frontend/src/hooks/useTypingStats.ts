import { useCallback, useEffect, useRef, useState } from 'react';

import { Stats } from '@/types';

export function useTypingStats() {
  const [accuracy, setAccuracy] = useState(100);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalCorrectTypeCount, setTotalCorrectTypeCount] = useState(0);
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
    const newWpm = Math.round((totalCorrectTypeCount / 5 / elapsedMinutes) * 10) / 10;
    setWpm(newWpm);
  }, [isTyping, elapsedSeconds, totalCorrectTypeCount]);

  useEffect(() => {
    if (!isTyping) return;

    const totalTypeCount = totalCorrectTypeCount + totalTypoCount;
    if (totalTypeCount > 0) {
      const newAccuracy = Math.round((totalCorrectTypeCount / totalTypeCount) * 1000) / 10;
      setAccuracy(newAccuracy);
    } else {
      setAccuracy(100);
    }
  }, [isTyping, totalCorrectTypeCount, totalTypoCount]);

  const startStats = useCallback(() => {
    if (isTyping) return;

    setAccuracy(100);
    setTotalCorrectTypeCount(0);
    setElapsedSeconds(0);
    setTotalTypoCount(0);
    setWpm(0);
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
      if (!isTyping) return;

      if (isCorrect) {
        setTotalCorrectTypeCount((prev) => prev + 1);
      } else {
        setTotalTypoCount((prev) => prev + 1);
      }
    },
    [isTyping, setTotalCorrectTypeCount, setTotalTypoCount],
  );

  const restoreStats = useCallback(
    (
      savedAccuracy: number,
      savedElapsedSeconds: number,
      savedCorrectTypeCount: number,
      savedTypoCount: number,
      savedWpm: number,
    ) => {
      setAccuracy(savedAccuracy);
      setElapsedSeconds(savedElapsedSeconds);
      setTotalCorrectTypeCount(savedCorrectTypeCount);
      setTotalTypoCount(savedTypoCount);
      setWpm(savedWpm);
      lastMeasureTimeRef.current = null;
      setIsTyping(false);
    },
    [],
  );

  const stats: Stats = {
    accuracy,
    elapsedSeconds,
    totalCorrectTypeCount,
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
