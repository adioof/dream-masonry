import type { MutableRefObject, ReactNode } from 'react';

export const GUTTER_SIZE = 1.5;
export const MIN_COLUMN_WIDTH = 240;
export const ITEM_HEIGHT_ESTIMATE = 300;

export type GridItem = {
  id: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
};

export type DreamGridProps<T extends GridItem> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  maxColumnCount?: number;
  minColumnCount?: number;
  minColumnWidth?: number;
  gutterSize?: number;
  isLoading?: boolean;
  isFetchingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => Promise<unknown>;
  scrollContainer?: MutableRefObject<HTMLElement | null>;
  overscan?: number;
  hysteresis?: number;
  scrollThreshold?: number;
  renderLoader?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export type Position = {
  column: number;
  top: number;
  height: number;
  left: number;
};

export type Dimensions = {
  columnCount: number;
  columnWidth: number;
};

export type ViewBounds = {
  top: number;
  bottom: number;
};

export type VisibleItem<T> = {
  item: T;
  pos: Position;
  index: number;
  transform: string;
};
