import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dimensions, GridItem, ViewBounds } from '../types';
import {
  calculateDimensions,
  calculatePositions,
  filterVisibleItems,
  filterValidItems,
  getScrollPosition,
  boundsChangedSignificantly,
} from '../utils';

const INITIAL_BOUNDS: ViewBounds = { top: -1000, bottom: 2000 };
const EMPTY_ARRAY: never[] = [];
const PASSIVE_EVENT_OPTIONS = { passive: true } as const;
const RESIZE_DEBOUNCE_MS = 100;

interface UseGridOptions<T extends GridItem> {
  items: T[];
  maxColumnCount?: number;
  minColumnCount?: number;
  minColumnWidth?: number;
  gutterSize?: number;
  overscan?: number;
  hysteresis?: number;
  scrollContainer?: { readonly current: HTMLElement | null };
}

export function useGrid<T extends GridItem>({
  items,
  maxColumnCount = 5,
  minColumnCount = 2,
  minColumnWidth,
  gutterSize,
  overscan = 1000,
  hysteresis = 100,
  scrollContainer,
}: UseGridOptions<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const lastBoundsRef = useRef<ViewBounds>({ top: 0, bottom: 0 });

  const [dimensions, setDimensions] = useState<Dimensions | null>(null);
  const [viewBounds, setViewBounds] = useState<ViewBounds>(INITIAL_BOUNDS);

  // Resize observer with debounce
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeout: ReturnType<typeof setTimeout>;

    const update = () => {
      const dims = calculateDimensions(container.offsetWidth, maxColumnCount, minColumnCount, minColumnWidth, gutterSize);
      setDimensions((prev) => {
        if (
          prev?.columnCount === dims?.columnCount &&
          prev?.columnWidth === dims?.columnWidth
        ) {
          return prev;
        }
        return dims;
      });
    };

    const debounced = () => {
      clearTimeout(timeout);
      timeout = setTimeout(update, RESIZE_DEBOUNCE_MS);
    };

    update();

    const observer = new ResizeObserver(debounced);
    observer.observe(container);

    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [maxColumnCount, minColumnCount, minColumnWidth, gutterSize]);

  const validItems = useMemo(() => filterValidItems(items), [items]);

  const { positions, totalHeight } = useMemo(() => {
    if (!dimensions || validItems.length === 0) {
      return { positions: EMPTY_ARRAY, totalHeight: 0 };
    }
    return calculatePositions(validItems, dimensions, gutterSize);
  }, [validItems, dimensions, gutterSize]);

  const visibleItems = useMemo(
    () =>
      dimensions
        ? filterVisibleItems(validItems, positions, viewBounds)
        : EMPTY_ARRAY,
    [validItems, positions, viewBounds, dimensions],
  );

  // Scroll listener with RAF throttle
  useEffect(() => {
    if (!dimensions || positions.length === 0) return;

    const scrollElement = scrollContainer?.current ?? window;

    const updateBounds = () => {
      const containerTop = containerRef.current?.offsetTop ?? 0;
      const newBounds = getScrollPosition(scrollElement, containerTop, overscan);

      if (
        boundsChangedSignificantly(lastBoundsRef.current, newBounds, hysteresis)
      ) {
        lastBoundsRef.current = newBounds;
        setViewBounds(newBounds);
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        updateBounds();
      });
    };

    updateBounds();
    scrollElement.addEventListener('scroll', onScroll, PASSIVE_EVENT_OPTIONS);

    return () => {
      scrollElement.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [dimensions, positions.length, scrollContainer, overscan, hysteresis]);

  return {
    containerRef,
    dimensions,
    positions,
    totalHeight,
    visibleItems,
    validItems,
  };
}
