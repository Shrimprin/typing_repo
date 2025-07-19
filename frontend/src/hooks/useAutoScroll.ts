import { useCallback, useRef } from 'react';

type UseAutoScrollOptions = {
  coolTime?: number;
  scrollMargin?: number;
};

export function useAutoScroll({ coolTime = 150, scrollMargin = 0.1 }: UseAutoScrollOptions) {
  const lastScrollTimeRef = useRef<number>(0);

  const scrollToElement = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;

      const now = Date.now();

      if (now - lastScrollTimeRef.current < coolTime) return;

      const container = element.closest('[class*="overflow-auto"]') as HTMLElement;
      if (!container) return;

      const elementRect = element.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const leftThreshold = containerRect.left + containerRect.width * scrollMargin;
      const rightThreshold = containerRect.right - containerRect.width * scrollMargin;

      if (elementRect.left < leftThreshold || elementRect.right > rightThreshold) {
        lastScrollTimeRef.current = now;

        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
      }
    },
    [coolTime, scrollMargin],
  );

  return scrollToElement;
}
