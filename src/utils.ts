import type {
  Dimensions,
  GridItem,
  Position,
  ViewBounds,
  VisibleItem,
} from './types';
import { GUTTER_SIZE, MIN_COLUMN_WIDTH } from './types';

export function calculateDimensions(
  containerWidth: number,
  maxColumnCount: number,
  minColumnCount: number = 2,
  minColumnWidth: number = MIN_COLUMN_WIDTH,
  gutterSize: number = GUTTER_SIZE,
): Dimensions | null {
  if (containerWidth === 0) return null;

  const columnCount = Math.min(
    maxColumnCount,
    Math.max(minColumnCount, Math.floor(containerWidth / (minColumnWidth + gutterSize))),
  );
  const columnWidth =
    (containerWidth - (columnCount - 1) * gutterSize) / columnCount;

  return { columnCount, columnWidth };
}

export function calculatePositions<T extends { width?: number; height?: number; aspectRatio?: number }>(
  items: T[],
  dimensions: Dimensions,
  gutterSize: number = GUTTER_SIZE,
): { positions: Position[]; totalHeight: number } {
  const { columnCount, columnWidth } = dimensions;
  const columnHeights = new Float64Array(columnCount);

  const colLefts = new Float64Array(columnCount);
  const colStep = columnWidth + gutterSize;
  for (let c = 0; c < columnCount; c++) {
    colLefts[c] = c * colStep;
  }

  const positions: Position[] = new Array(items.length);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    let minHeight = columnHeights[0];
    let column = 0;
    for (let c = 1; c < columnCount; c++) {
      const h = columnHeights[c];
      if (h < minHeight) {
        minHeight = h;
        column = c;
      }
    }

    const w = item.width;
    const h = item.height;
    const ar = (item as { aspectRatio?: number }).aspectRatio;
    const height =
      w && h && w !== h
        ? Math.round((columnWidth * h) / w)
        : ar && ar > 0
          ? Math.round(columnWidth / ar)
          : columnWidth;
    const top = columnHeights[column];

    positions[i] = { column, top, height, left: colLefts[column] };
    columnHeights[column] = top + height + gutterSize;
  }

  const maxHeight = Math.max(...columnHeights);

  return {
    positions,
    totalHeight: maxHeight > 0 ? maxHeight - gutterSize : 0,
  };
}

export function filterVisibleItems<T extends GridItem>(
  items: T[],
  positions: Position[],
  viewBounds: ViewBounds,
): VisibleItem<T>[] {
  const len = positions.length;
  const viewTop = viewBounds.top;
  const viewBottom = viewBounds.bottom;

  const result: VisibleItem<T>[] = [];

  for (let i = 0; i < len; i++) {
    const pos = positions[i];
    const posTop = pos.top;

    if (posTop > viewBottom) continue;

    const itemBottom = posTop + pos.height;

    if (itemBottom >= viewTop) {
      result.push({
        item: items[i],
        pos,
        index: i,
        transform: `translate3d(${pos.left}px,${posTop}px,0)`,
      });
    }
  }

  return result;
}

export function filterValidItems<T extends GridItem>(items: T[]): T[] {
  const result: T[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item != null && item.id != null) {
      result.push(item);
    }
  }
  return result;
}

export function getScrollPosition(
  scrollElement: Window | HTMLElement,
  containerTop: number,
  overscan: number,
): ViewBounds {
  const scrollTop =
    scrollElement === window
      ? window.scrollY
      : (scrollElement as HTMLElement).scrollTop;
  const viewportHeight =
    scrollElement === window
      ? window.innerHeight
      : (scrollElement as HTMLElement).clientHeight;

  const relativeScrollTop = scrollTop - containerTop;

  return {
    top: relativeScrollTop - overscan,
    bottom: relativeScrollTop + viewportHeight + overscan,
  };
}

export function boundsChangedSignificantly(
  prev: ViewBounds,
  next: ViewBounds,
  threshold: number,
): boolean {
  return (
    Math.abs(next.top - prev.top) >= threshold ||
    Math.abs(next.bottom - prev.bottom) >= threshold
  );
}
