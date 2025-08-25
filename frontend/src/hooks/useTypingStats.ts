import { useCallback, useEffect, useState } from 'react';

export type TypingStatsData = {
  accuracy: number;
  correctTypeCount: number;
  elapsedSeconds: number;
  typoCount: number;
  wpm: number;
};

type TypingStatsActions = {
  startStats: () => void;
  pauseStats: () => void;
  resumeStats: () => void;
  resetStats: () => void;
  updateStats: (isCorrect: boolean) => void;
  restoreStats: (
    savedAccuracy: number,
    savedCorrectTypeCount: number,
    savedElapsedSeconds: number,
    savedTypoCount: number,
    savedWpm: number,
  ) => void;
};

export function useTypingStats(): TypingStatsData & TypingStatsActions {
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [typoCount, setTypoCount] = useState(0);
  const [correctTypeCount, setCorrectTypeCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    console.log('ACCUMULATED TIME', accumulatedSeconds);

    const interval = setInterval(() => {
      if (!isTyping || !startTime) return;

      const newElapsedSeconds = accumulatedSeconds + Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(newElapsedSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTyping, startTime, accumulatedSeconds]);

  useEffect(() => {
    if (!isTyping || !startTime || correctTypeCount === 0 || elapsedSeconds === 0) return;

    const elapsedMinutes = elapsedSeconds / 60;
    const newWpm = Math.round(correctTypeCount / 5 / elapsedMinutes);
    setWpm(newWpm);
  }, [isTyping, startTime, elapsedSeconds, correctTypeCount]);

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
    setStartTime(Date.now());
    setAccumulatedSeconds(0);
    setWpm(0);
    setTypoCount(0);
    setCorrectTypeCount(0);
    setElapsedSeconds(0);
    setAccuracy(100);
    setIsTyping(true);
  }, []);

  const pauseStats = useCallback(() => {
    setAccumulatedSeconds(elapsedSeconds);
    setStartTime(null);
    setIsTyping(false);
  }, [elapsedSeconds]);

  const resumeStats = useCallback(() => {
    setStartTime(Date.now());
    setIsTyping(true);
  }, []);

  const resetStats = useCallback(() => {
    setStartTime(null);
    setAccumulatedSeconds(0);
    setWpm(0);
    setAccuracy(100);
    setTypoCount(0);
    setCorrectTypeCount(0);
    setElapsedSeconds(0);
    setIsTyping(false);
  }, []);

  const updateStats = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectTypeCount((prev) => prev + 1);
    } else {
      setTypoCount((prev) => prev + 1);
    }
  }, []);

  const restoreStats = useCallback(
    (
      savedAccuracy: number,
      savedCorrectTypeCount: number,
      savedElapsedSeconds: number,
      savedTypoCount: number,
      savedWpm: number,
    ) => {
      const timeInSeconds = Math.floor(savedElapsedSeconds);
      setAccumulatedSeconds(timeInSeconds);
      setElapsedSeconds(timeInSeconds);
      setTypoCount(savedTypoCount);
      setCorrectTypeCount(savedCorrectTypeCount);
      setWpm(savedWpm);
      setStartTime(null);

      setAccuracy(savedAccuracy);

      setIsTyping(false);
    },
    [],
  );

  return {
    accuracy,
    correctTypeCount,
    elapsedSeconds,
    typoCount,
    wpm,
    startStats,
    pauseStats,
    resumeStats,
    resetStats,
    updateStats,
    restoreStats,
  };
}
