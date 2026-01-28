import React, { useState, useCallback } from 'react';
import { DreamGrid } from 'dream-grid';

type Photo = {
  id: string;
  width: number;
  height: number;
  color: string;
};

const COLORS = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#e91e63', '#00bcd4',
  '#8bc34a', '#ff5722', '#607d8b', '#795548', '#673ab7',
];

function generateItems(start: number, count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => {
    const idx = start + i;
    const w = 300 + Math.floor(Math.random() * 400);
    const h = 200 + Math.floor(Math.random() * 500);
    return {
      id: `photo-${idx}`,
      width: w,
      height: h,
      color: COLORS[idx % COLORS.length],
    };
  });
}

export default function App() {
  const [items, setItems] = useState<Photo[]>(() => generateItems(0, 50));
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);

  const loadMore = useCallback(async () => {
    setFetching(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    setItems((prev) => {
      const next = [...prev, ...generateItems(prev.length, 30)];
      if (next.length >= 300) setHasMore(false);
      return next;
    });
    setFetching(false);
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          DreamGrid Demo
        </h1>
        <p style={{ color: '#888', margin: '8px 0 0' }}>
          {items.length} items loaded{hasMore ? ' — scroll down for more' : ' — all loaded'}
        </p>
      </div>

      <DreamGrid<Photo>
        items={items}
        maxColumnCount={5}
        hasMore={hasMore}
        isFetchingMore={fetching}
        onLoadMore={loadMore}
        renderItem={(photo) => (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: photo.color,
              display: 'flex',
              alignItems: 'end',
              padding: 12,
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.85)',
                fontSize: 12,
                fontFamily: 'monospace',
              }}
            >
              {photo.width}×{photo.height}
            </span>
          </div>
        )}
        renderLoader={() => (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            Loading...
          </div>
        )}
        renderEmpty={() => (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
            No items
          </div>
        )}
      />

      {fetching && (
        <div style={{ textAlign: 'center', padding: 24, color: '#888' }}>
          Loading more...
        </div>
      )}
    </div>
  );
}
