import { useTypingStats } from '@/hooks/useTypingStats';
import { act, renderHook } from '@testing-library/react';

describe('useTypingStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('sets accuracy to 100% and other stats to 0', () => {
      const { result } = renderHook(() => useTypingStats());

      expect(result.current.accuracy).toBe(100);
      expect(result.current.totalCorrectTypeCount).toBe(0);
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.totalTypoCount).toBe(0);
      expect(result.current.wpm).toBe(0);
    });
  });

  describe('during typing', () => {
    it('updates statistics', () => {
      const { result } = renderHook(() => useTypingStats());

      act(() => {
        result.current.startStats();
      });

      act(() => {
        [...Array(2)].forEach(() => result.current.updateStats(true));
        result.current.updateStats(false);
      });

      expect(result.current.accuracy).toBe(66.7);
      expect(result.current.totalCorrectTypeCount).toBe(2);
      expect(result.current.totalTypoCount).toBe(1);
    });

    it('updates statistics over time', () => {
      const mockPerformanceNow = jest.spyOn(performance, 'now');
      try {
        mockPerformanceNow.mockReturnValue(1000); // 現在の時間を1秒にモック
        const { result } = renderHook(() => useTypingStats());

        act(() => {
          result.current.startStats();
        });

        act(() => {
          [...Array(5)].forEach(() => result.current.updateStats(true));
        });

        mockPerformanceNow.mockReturnValue(61000); // 60秒経過させるようにモック
        act(() => {
          jest.advanceTimersByTime(1000); // タイマーの計測が1秒間隔のため1秒経過させる
        });

        expect(result.current.wpm).toBe(1.0);
        expect(result.current.elapsedSeconds).toBe(60);
      } finally {
        mockPerformanceNow.mockRestore();
      }
    });

    it('can pause and keep statistics', () => {
      const { result } = renderHook(() => useTypingStats());

      const mockPerformanceNow = jest.spyOn(performance, 'now');
      try {
        mockPerformanceNow.mockReturnValue(1000);

        act(() => {
          result.current.startStats();
        });

        act(() => {
          result.current.updateStats(true);
          result.current.updateStats(false);
        });

        mockPerformanceNow.mockReturnValue(2000);
        act(() => {
          jest.advanceTimersByTime(1000);
        });

        // ポーズ前の統計情報の確認
        expect(result.current.accuracy).toBe(50.0);
        expect(result.current.elapsedSeconds).toBe(1);
        expect(result.current.totalCorrectTypeCount).toBe(1);
        expect(result.current.totalTypoCount).toBe(1);
        expect(result.current.wpm).toBe(12);

        act(() => {
          result.current.pauseStats();
        });

        mockPerformanceNow.mockReturnValue(3000);

        act(() => {
          jest.advanceTimersByTime(1000);
        });

        // ポーズ後に統計情報が更新されないことを確認
        expect(result.current.accuracy).toBe(50.0);
        expect(result.current.elapsedSeconds).toBe(1);
        expect(result.current.totalCorrectTypeCount).toBe(1);
        expect(result.current.totalTypoCount).toBe(1);
        expect(result.current.wpm).toBe(12);
      } finally {
        mockPerformanceNow.mockRestore();
      }
    });

    it('can resume after pause', () => {
      const mockPerformanceNow = jest.spyOn(performance, 'now');
      try {
        mockPerformanceNow.mockReturnValue(1000);

        const { result } = renderHook(() => useTypingStats());

        act(() => {
          result.current.startStats();
        });

        mockPerformanceNow.mockReturnValue(2000);

        act(() => {
          result.current.updateStats(true);
          result.current.updateStats(false);
          jest.advanceTimersByTime(1000);
        });

        // ポーズ前の統計情報と時間を確認
        expect(result.current.accuracy).toBe(50.0);
        expect(result.current.elapsedSeconds).toBe(1);
        expect(result.current.totalCorrectTypeCount).toBe(1);
        expect(result.current.totalTypoCount).toBe(1);
        expect(result.current.wpm).toBe(12);

        // ポーズして再開する
        act(() => {
          result.current.pauseStats();
        });

        mockPerformanceNow.mockReturnValue(3000);

        act(() => {
          result.current.resumeStats();
        });

        mockPerformanceNow.mockReturnValue(4000);

        act(() => {
          result.current.updateStats(true);
          jest.advanceTimersByTime(1000);
        });

        // ポーズ前の統計上を引き継いで更新されることを確認
        expect(result.current.accuracy).toBe(66.7);
        expect(result.current.elapsedSeconds).toBe(2);
        expect(result.current.totalCorrectTypeCount).toBe(2);
        expect(result.current.totalTypoCount).toBe(1);
        expect(result.current.wpm).toBe(12);
      } finally {
        mockPerformanceNow.mockRestore();
      }
    });

    it('can reset', () => {
      const { result } = renderHook(() => useTypingStats());

      act(() => {
        result.current.startStats();
        result.current.updateStats(true);
        result.current.updateStats(false);
        result.current.resetStats();
      });

      expect(result.current.accuracy).toBe(100);
      expect(result.current.totalCorrectTypeCount).toBe(0);
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.totalTypoCount).toBe(0);
      expect(result.current.wpm).toBe(0);
    });
  });

  describe('during not typing', () => {
    it('does not update statistics when typing', () => {
      const { result } = renderHook(() => useTypingStats());

      act(() => {
        result.current.updateStats(true);
        result.current.updateStats(false);
      });

      expect(result.current.accuracy).toBe(100);
      expect(result.current.totalCorrectTypeCount).toBe(0);
      expect(result.current.totalTypoCount).toBe(0);
    });

    it('does not update statistics over time', () => {
      const { result } = renderHook(() => useTypingStats());

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.wpm).toBe(0);
    });

    it('can start', () => {
      const { result } = renderHook(() => useTypingStats());

      act(() => {
        result.current.startStats();
      });

      expect(result.current.accuracy).toBe(100);
      expect(result.current.totalCorrectTypeCount).toBe(0);
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.totalTypoCount).toBe(0);
      expect(result.current.wpm).toBe(0);
    });

    it('can reset', () => {
      const { result } = renderHook(() => useTypingStats());

      act(() => {
        result.current.resetStats();
      });

      expect(result.current.accuracy).toBe(100);
      expect(result.current.totalCorrectTypeCount).toBe(0);
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.totalTypoCount).toBe(0);
      expect(result.current.wpm).toBe(0);
    });
  });

  describe('restoreStats', () => {
    it('restores saved statistics', () => {
      const { result } = renderHook(() => useTypingStats());

      const savedStats = {
        accuracy: 85.0,
        elapsedSeconds: 120,
        totalCorrectTypeCount: 17,
        totalTypoCount: 3,
        wpm: 8.0,
      };

      act(() => {
        result.current.restoreStats(
          savedStats.accuracy,
          savedStats.elapsedSeconds,
          savedStats.totalCorrectTypeCount,
          savedStats.totalTypoCount,
          savedStats.wpm,
        );
      });

      expect(result.current.accuracy).toBe(85.0);
      expect(result.current.totalCorrectTypeCount).toBe(17);
      expect(result.current.elapsedSeconds).toBe(120);
      expect(result.current.totalTypoCount).toBe(3);
      expect(result.current.wpm).toBe(8.0);
    });
  });
});
