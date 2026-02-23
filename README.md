# DreamMasonry

[![npm version](https://img.shields.io/npm/v/dream-masonry.svg)](https://www.npmjs.com/package/dream-masonry)
[![npm downloads](https://img.shields.io/npm/dm/dream-masonry.svg)](https://www.npmjs.com/package/dream-masonry)
[![license](https://img.shields.io/npm/l/dream-masonry.svg)](https://github.com/adioof/dream-masonry/blob/main/LICENSE)

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/adioof)

Virtualized masonry grid for React. Handles 10,000+ items without breaking a sweat — only the visible ones get rendered.

**[Live demo](https://adioof.github.io/dream-masonry/)**

If you've ever tried building a Pinterest-style layout and hit a wall with scroll performance, this is for you.

## Install

```bash
npm install dream-masonry
```

## Quick Start

```tsx
import { DreamMasonry } from 'dream-masonry';

function Gallery({ photos }) {
  return (
    <DreamMasonry
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

Items just need an `id` and either `width`/`height` or an `aspectRatio`. If you pass neither, they render as squares.

## Why this over Masonic / react-masonry-css?

Honest comparison:

- **react-masonry-css** is great if you don't need virtualization. It's tiny (~3KB) and CSS-only. But it renders everything to the DOM, so it chokes on large lists.
- **Masonic** does virtualization, but doesn't ship infinite scroll and has a bigger bundle with dependencies.
- **DreamMasonry** virtualizes, has built-in infinite scroll, uses `Float64Array` for layout math, and ships at ~13KB with zero dependencies (besides React).

Pick whatever fits. If you need virtualization + infinite scroll out of the box, that's where this library lives.

## Infinite Scroll

```tsx
<DreamMasonry
  items={items}
  renderItem={(photo) => <img src={photo.src} alt="" />}
  hasMore={hasMore}
  isFetchingMore={loading}
  onLoadMore={loadMore}
  scrollThreshold={2000}
  renderLoader={() => <div>Loading...</div>}
  renderEmpty={() => <div>No photos yet</div>}
/>
```

## Custom Scroll Container

Works with `window` by default, or pass any scrollable element:

```tsx
const scrollRef = useRef<HTMLDivElement>(null);

<div ref={scrollRef} style={{ height: '100vh', overflow: 'auto' }}>
  <DreamMasonry
    items={items}
    renderItem={(item) => <Card item={item} />}
    scrollContainer={scrollRef}
  />
</div>
```

## Headless Hooks

Don't want the component? Use the hooks directly.

**`useGrid`** — full virtualization, you control the markup:

```tsx
import { useGrid } from 'dream-masonry';

const { containerRef, visibleItems, totalHeight } = useGrid({
  items,
  maxColumnCount: 4,
  gutterSize: 12,
});
```

**`usePositioner`** — layout math only, no DOM involved. Good for SSR, canvas, or testing:

```tsx
import { usePositioner } from 'dream-masonry';

const { positions, totalHeight } = usePositioner({
  items,
  containerWidth: 800,
  maxColumnCount: 3,
});
```

**`useInfiniteScroll`** — standalone infinite scroll, use it with anything:

```tsx
import { useInfiniteScroll } from 'dream-masonry';

useInfiniteScroll({
  fetchNextPage: loadMore,
  hasNextPage: true,
  isFetchingNextPage: false,
  threshold: 1500,
});
```

## Props

### `<DreamMasonry>`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | required | Array of items with `id` and optional `width`/`height`/`aspectRatio` |
| `renderItem` | `(item, index) => ReactNode` | required | Render function for each cell |
| `maxColumnCount` | `number` | `5` | Max columns |
| `minColumnCount` | `number` | `2` | Min columns |
| `minColumnWidth` | `number` | `240` | Min column width (px) before reducing count |
| `gutterSize` | `number` | `1.5` | Gap between items (px) |
| `hasMore` | `boolean` | `false` | More items available to load |
| `onLoadMore` | `() => Promise` | — | Called when scroll nears bottom |
| `scrollContainer` | `RefObject<HTMLElement>` | — | Custom scroll container (defaults to window) |
| `overscan` | `number` | `1000` | Pre-render buffer above/below viewport (px) |
| `hysteresis` | `number` | `100` | Min scroll distance before recalculating |
| `scrollThreshold` | `number` | `1500` | Distance from bottom to trigger `onLoadMore` (px) |
| `renderLoader` | `() => ReactNode` | — | Loading indicator |
| `renderEmpty` | `() => ReactNode` | — | Empty state |

## How It Works

1. Container width gets divided into columns based on your min/max constraints
2. Items go into the shortest column each time (classic masonry) — column heights tracked with `Float64Array`
3. Only items in/near the viewport are in the DOM. Everything else is skipped
4. Scroll position is checked once per `requestAnimationFrame`, but React only re-renders when you've scrolled past the `hysteresis` threshold
5. A `ResizeObserver` recalculates columns when the container resizes

## License

MIT — made by [@adioof](https://github.com/adioof)
