# DreamGrid

A high-performance virtualized masonry grid for React. Built with Float64Array-backed layout calculations, GPU-accelerated positioning, and hysteresis-based scroll updates for buttery smooth rendering of 10,000+ items.

## Features

- **Float64Array layout engine** — Column height tracking uses typed arrays for faster numeric operations than plain JavaScript arrays
- **Virtualized rendering** — Only items within the viewport (plus configurable overscan) are rendered to the DOM
- **GPU-accelerated positioning** — Items use `translate3d` transforms and CSS containment (`contain: strict` on container, `layout style paint` on items)
- **Hysteresis-based scroll updates** — Configurable threshold prevents re-render thrashing during scroll
- **RAF-throttled scroll handler** — At most one layout update per animation frame
- **Built-in infinite scroll** — Optional pagination hook with debounce and threshold control
- **Custom scroll containers** — Works with `window` or any scrollable element via ref
- **Headless hooks** — Use the layout engine without the component for fully custom rendering
- **Fully configurable** — Gutter size, column counts, column widths, scroll thresholds, and overscan are all customizable
- **Tiny bundle** — ~12KB with no dependencies beyond React

## Install

```bash
npm install dream-grid
```

## Quick Start

```tsx
import { DreamGrid } from 'dream-grid';

type Photo = {
  id: string;
  src: string;
  width: number;
  height: number;
};

function Gallery({ photos }: { photos: Photo[] }) {
  return (
    <DreamGrid
      items={photos}
      maxColumnCount={4}
      renderItem={(photo) => (
        <img
          src={photo.src}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    />
  );
}
```

## Infinite Scroll

```tsx
function InfiniteGallery() {
  const [items, setItems] = useState<Photo[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadMore = async () => {
    setLoading(true);
    const next = await fetchPhotos(items.length);
    setItems((prev) => [...prev, ...next.data]);
    setHasMore(next.hasMore);
    setLoading(false);
  };

  return (
    <DreamGrid
      items={items}
      renderItem={(photo) => <img src={photo.src} alt="" />}
      hasMore={hasMore}
      isFetchingMore={loading}
      onLoadMore={loadMore}
      scrollThreshold={2000}
      renderLoader={() => <div>Loading...</div>}
      renderEmpty={() => <div>No photos yet</div>}
    />
  );
}
```

## Custom Layout

```tsx
<DreamGrid
  items={items}
  renderItem={(item) => <Card item={item} />}
  maxColumnCount={6}
  minColumnCount={1}
  minColumnWidth={180}
  gutterSize={8}
  overscan={1200}
  hysteresis={50}
/>
```

## Custom Scroll Container

```tsx
function ScrollablePanel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollRef} style={{ height: '100vh', overflow: 'auto' }}>
      <DreamGrid
        items={items}
        renderItem={(item) => <Card item={item} />}
        scrollContainer={scrollRef}
      />
    </div>
  );
}
```

## Headless Usage

### `useGrid` — Full virtualization without the component

```tsx
import { useGrid } from 'dream-grid';

function CustomGrid({ items }) {
  const { containerRef, dimensions, visibleItems, totalHeight } = useGrid({
    items,
    maxColumnCount: 4,
    minColumnCount: 2,
    minColumnWidth: 200,
    gutterSize: 12,
    overscan: 800,
    hysteresis: 50,
  });

  return (
    <div
      ref={containerRef}
      style={{ height: totalHeight, position: 'relative' }}
    >
      {visibleItems.map(({ item, pos, transform }) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            transform,
            width: dimensions!.columnWidth,
            height: pos.height,
          }}
        >
          <YourComponent item={item} />
        </div>
      ))}
    </div>
  );
}
```

### `usePositioner` — Layout math only, no DOM

```tsx
import { usePositioner } from 'dream-grid';

function LayoutDebugger({ items, width }) {
  const { positions, totalHeight, dimensions } = usePositioner({
    items,
    containerWidth: width,
    maxColumnCount: 3,
    gutterSize: 10,
  });

  // positions is an array of { column, top, left, height } for each item
  // Use for canvas rendering, SSR, testing, or anything non-DOM
}
```

### `useInfiniteScroll` — Standalone pagination

```tsx
import { useInfiniteScroll } from 'dream-grid';

useInfiniteScroll({
  fetchNextPage: loadMore,
  hasNextPage: true,
  isFetchingNextPage: false,
  threshold: 1500,
  useWindow: true,
});
```

## API

### `<DreamGrid>` Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | required | Array of items. Each must have `id: string` and optionally `width`/`height` or `aspectRatio` |
| `renderItem` | `(item: T, index: number) => ReactNode` | required | Render function for each grid cell |
| `maxColumnCount` | `number` | `5` | Maximum number of columns |
| `minColumnCount` | `number` | `2` | Minimum number of columns |
| `minColumnWidth` | `number` | `240` | Minimum column width in pixels before reducing column count |
| `gutterSize` | `number` | `1.5` | Gap between items in pixels |
| `isLoading` | `boolean` | `false` | Show loader state |
| `hasMore` | `boolean` | `false` | Whether more items can be loaded |
| `isFetchingMore` | `boolean` | `false` | Whether a load is in progress |
| `onLoadMore` | `() => Promise<unknown>` | — | Called when scroll nears the bottom |
| `scrollContainer` | `MutableRefObject<HTMLElement>` | — | Custom scroll container (defaults to window) |
| `overscan` | `number` | `1000` | Pixels above/below viewport to pre-render |
| `hysteresis` | `number` | `100` | Minimum scroll distance before re-calculating visible items |
| `scrollThreshold` | `number` | `1500` | Distance from bottom in pixels to trigger `onLoadMore` |
| `renderLoader` | `() => ReactNode` | — | Custom loading state |
| `renderEmpty` | `() => ReactNode` | — | Custom empty state |
| `className` | `string` | — | Container class |
| `style` | `CSSProperties` | — | Container style (merged with internal styles) |

### `useGrid` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | `T[]` | required | Array of grid items |
| `maxColumnCount` | `number` | `5` | Maximum columns |
| `minColumnCount` | `number` | `2` | Minimum columns |
| `minColumnWidth` | `number` | `240` | Minimum column width in px |
| `gutterSize` | `number` | `1.5` | Gap between items in px |
| `overscan` | `number` | `1000` | Pre-render buffer in px |
| `hysteresis` | `number` | `100` | Scroll threshold before update |
| `scrollContainer` | `RefObject<HTMLElement>` | — | Custom scroll element |

Returns: `{ containerRef, dimensions, positions, totalHeight, visibleItems, validItems }`

### `usePositioner` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `items` | `T[]` | required | Array of grid items |
| `containerWidth` | `number` | required | Container width in px |
| `maxColumnCount` | `number` | `5` | Maximum columns |
| `minColumnCount` | `number` | `2` | Minimum columns |
| `minColumnWidth` | `number` | `240` | Minimum column width in px |
| `gutterSize` | `number` | `1.5` | Gap between items in px |

Returns: `{ dimensions, positions, totalHeight, validItems }`

### Item Shape

Items must satisfy:

```ts
type GridItem = {
  id: string;
  width?: number;       // intrinsic width
  height?: number;      // intrinsic height
  aspectRatio?: number; // width / height (e.g. 16/9 = 1.778)
};
```

The grid resolves item height in this order:
1. **`width` + `height`** — calculates aspect ratio from dimensions
2. **`aspectRatio`** — uses the ratio directly (useful when you only have the ratio, not raw dimensions)
3. **Neither** — renders as a square

## How It Works

1. **Column calculation** — Container width is divided into columns respecting `minColumnWidth`, `minColumnCount`, and `maxColumnCount` constraints, with configurable `gutterSize` gaps
2. **Masonry positioning** — Items are placed in the shortest column using Float64Array for O(items x columns) layout
3. **Viewport culling** — Only items intersecting `[scrollTop - overscan, scrollTop + viewportHeight + overscan]` are rendered
4. **Scroll throttling** — A `requestAnimationFrame` loop checks scroll position, but only triggers a React update when the viewport moves more than the `hysteresis` threshold
5. **Resize handling** — A debounced `ResizeObserver` recalculates column dimensions when the container width changes

## License

MIT
