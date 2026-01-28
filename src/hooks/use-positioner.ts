import { useMemo } from 'react';
import type { GridItem } from '../types';
import { calculateDimensions, calculatePositions, filterValidItems } from '../utils';

interface UsePositionerOptions<T extends GridItem> {
  items: T[];
  containerWidth: number;
  maxColumnCount?: number;
  minColumnCount?: number;
  minColumnWidth?: number;
  gutterSize?: number;
}

export function usePositioner<T extends GridItem>({
  items,
  containerWidth,
  maxColumnCount = 5,
  minColumnCount,
  minColumnWidth,
  gutterSize,
}: UsePositionerOptions<T>) {
  const dimensions = useMemo(
    () => calculateDimensions(containerWidth, maxColumnCount, minColumnCount, minColumnWidth, gutterSize),
    [containerWidth, maxColumnCount, minColumnCount, minColumnWidth, gutterSize],
  );

  const validItems = useMemo(() => filterValidItems(items), [items]);

  const { positions, totalHeight } = useMemo(() => {
    if (!dimensions || validItems.length === 0) {
      return { positions: [] as never[], totalHeight: 0 };
    }
    return calculatePositions(validItems, dimensions, gutterSize);
  }, [validItems, dimensions, gutterSize]);

  return { dimensions, positions, totalHeight, validItems };
}
