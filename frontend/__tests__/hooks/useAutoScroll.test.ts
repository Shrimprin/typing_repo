import { useAutoScroll } from '@/hooks/useAutoScroll';
import { renderHook } from '@testing-library/react';

describe('useAutoScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('scrolls when the element is left of the scroll range', () => {
    const { result } = renderHook(() => useAutoScroll({ scrollMargin: 0.1 }));

    const mockScrollIntoView = jest.fn();
    const mockContainer: Partial<HTMLElement> = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 100,
        right: 500,
        width: 400,
        height: 300,
      }),
    };

    const mockElement: Partial<HTMLElement> = {
      scrollIntoView: mockScrollIntoView,
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 50,
        right: 60,
        width: 10,
        height: 20,
      }),
      closest: jest.fn().mockReturnValue(mockContainer),
    };

    result.current(mockElement as HTMLElement);

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  });

  it('scrolls when the element is right of the scroll range', () => {
    const { result } = renderHook(() => useAutoScroll({ scrollMargin: 0.1 }));

    const mockScrollIntoView = jest.fn();
    const mockContainer: Partial<HTMLElement> = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 100,
        right: 500,
        width: 400,
        height: 300,
      }),
    };

    const mockElement: Partial<HTMLElement> = {
      scrollIntoView: mockScrollIntoView,
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 480,
        right: 490,
        width: 10,
        height: 20,
      }),
      closest: jest.fn().mockReturnValue(mockContainer),
    };

    result.current(mockElement as HTMLElement);

    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    });
  });

  it('does not scroll when the element is in the scroll range', () => {
    const { result } = renderHook(() => useAutoScroll({ scrollMargin: 0.1 }));

    const mockScrollIntoView = jest.fn();
    const mockContainer: Partial<HTMLElement> = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 100,
        right: 500,
        width: 400,
        height: 300,
      }),
    };

    const mockElement: Partial<HTMLElement> = {
      scrollIntoView: mockScrollIntoView,
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 200,
        right: 210,
        width: 10,
        height: 20,
      }),
      closest: jest.fn().mockReturnValue(mockContainer),
    };

    result.current(mockElement as HTMLElement);

    expect(mockScrollIntoView).not.toHaveBeenCalled();
  });

  it('does not scroll when the cool time is not passed', () => {
    const { result } = renderHook(() => useAutoScroll({ coolTime: 150 }));

    const mockScrollIntoView = jest.fn();
    const mockContainer: Partial<HTMLElement> = {
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 100,
        right: 500,
        width: 400,
        height: 300,
      }),
    };

    const mockElement: Partial<HTMLElement> = {
      scrollIntoView: mockScrollIntoView,
      getBoundingClientRect: jest.fn().mockReturnValue({
        left: 50,
        right: 60,
        width: 10,
        height: 20,
      }),
      closest: jest.fn().mockReturnValue(mockContainer),
    };

    // 1回目の実行
    result.current(mockElement as HTMLElement);
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);

    // クールタイム内（100ms後）に実行
    jest.advanceTimersByTime(100);
    result.current(mockElement as HTMLElement);
    expect(mockScrollIntoView).toHaveBeenCalledTimes(1);

    // クールタイム経過後（さらに60ms後）に実行
    jest.advanceTimersByTime(60);
    result.current(mockElement as HTMLElement);
    expect(mockScrollIntoView).toHaveBeenCalledTimes(2);
  });
});
