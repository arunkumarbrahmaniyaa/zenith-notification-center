import { useCallback, useLayoutEffect, useRef, useState } from "react";

export interface UseVirtualizerOptions {
  count: number;
  estimateItemHeight: number;
  overscan?: number;
}

export interface VirtualItem {
  index: number;
  start: number;
  size: number;
}

export interface VirtualizerResult {
  virtualItems: VirtualItem[];
  totalHeight: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Lightweight fixed-height virtualizer. Renders only the visible window of a
 * large list, enabling smooth rendering for tens of thousands of notifications
 * without any external dependency.
 */
export const useVirtualizer = ({
  count,
  estimateItemHeight,
  overscan = 6
}: UseVirtualizerOptions): VirtualizerResult => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop);
    }
  }, []);

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    setViewportHeight(element.clientHeight);
    element.addEventListener("scroll", handleScroll, { passive: true });

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => setViewportHeight(element.clientHeight))
        : null;
    observer?.observe(element);

    return () => {
      element.removeEventListener("scroll", handleScroll);
      observer?.disconnect();
    };
  }, [handleScroll]);

  const totalHeight = count * estimateItemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / estimateItemHeight) - overscan);
  const visibleCount = Math.ceil((viewportHeight || estimateItemHeight) / estimateItemHeight) + overscan * 2;
  const endIndex = Math.min(count, startIndex + visibleCount);

  const virtualItems: VirtualItem[] = [];
  for (let index = startIndex; index < endIndex; index += 1) {
    virtualItems.push({
      index,
      start: index * estimateItemHeight,
      size: estimateItemHeight
    });
  }

  return { virtualItems, totalHeight, scrollRef };
};
