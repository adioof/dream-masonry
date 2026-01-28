import React, { memo } from 'react';
import { GridItem as GridItemComponent } from './components/GridItem';
import { useGrid } from './hooks/use-grid';
import { useInfiniteScroll } from './hooks/use-infinite-scroll';
import { injectStyles } from './inject-styles';
import type { DreamGridProps, GridItem } from './types';

injectStyles();

const NOOP = () => {};

const DreamGrid = <T extends GridItem>({
  items,
  renderItem,
  maxColumnCount = 5,
  minColumnCount,
  minColumnWidth,
  gutterSize,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  scrollContainer,
  overscan = 1000,
  hysteresis = 100,
  scrollThreshold = 1500,
  renderLoader,
  renderEmpty,
  className,
  style,
}: DreamGridProps<T>) => {
  const {
    containerRef,
    dimensions,
    totalHeight,
    visibleItems,
  } = useGrid({
    items,
    maxColumnCount,
    minColumnCount,
    minColumnWidth,
    gutterSize,
    overscan,
    hysteresis,
    scrollContainer,
  });

  useInfiniteScroll({
    containerRef: scrollContainer,
    fetchNextPage: onLoadMore || NOOP,
    hasNextPage: hasMore,
    isFetchingNextPage: isFetchingMore,
    enabled: !!onLoadMore && hasMore,
    threshold: scrollThreshold,
    useWindow: !scrollContainer,
    dependencies: [items.length],
  });

  const containerClass = className ? `dg-container ${className}` : 'dg-container';

  if (isLoading || !dimensions) {
    return (
      <div ref={containerRef} className={containerClass} style={style}>
        {renderLoader?.()}
      </div>
    );
  }

  if (items.length === 0 && !isLoading) {
    return (
      <div ref={containerRef} className={containerClass} style={style}>
        {renderEmpty?.()}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={containerClass}
      style={{ height: totalHeight, ...style }}
    >
      {visibleItems.map(({ item, pos, index, transform }) => (
        <GridItemComponent
          key={item.id}
          transform={transform}
          width={dimensions.columnWidth}
          height={pos.height}
        >
          {renderItem(item, index)}
        </GridItemComponent>
      ))}
    </div>
  );
};

export default memo(DreamGrid) as typeof DreamGrid;
