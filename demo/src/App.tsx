import React, { useState, useCallback } from 'react';
import { DreamMasonry } from 'dream-masonry';
import Benchmark from './Benchmark';

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

function Nav({ page, setPage }: { page: string; setPage: (p: string) => void }) {
  return (
    <nav style={{ display: 'flex', gap: 16, marginBottom: 24, padding: '16px 16px 0' }}>
      <button
        onClick={() => setPage('demo')}
        style={{
          background: 'none',
          border: 'none',
          color: page === 'demo' ? '#3498db' : '#666',
          fontSize: 14,
          fontWeight: page === 'demo' ? 700 : 400,
          cursor: 'pointer',
          padding: '4px 0',
          borderBottom: page === 'demo' ? '2px solid #3498db' : '2px solid transparent',
        }}
      >
        Demo
      </button>
      <button
        onClick={() => setPage('benchmark')}
        style={{
          background: 'none',
          border: 'none',
          color: page === 'benchmark' ? '#3498db' : '#666',
          fontSize: 14,
          fontWeight: page === 'benchmark' ? 700 : 400,
          cursor: 'pointer',
          padding: '4px 0',
          borderBottom: page === 'benchmark' ? '2px solid #3498db' : '2px solid transparent',
        }}
      >
        Benchmarks
      </button>
      <a
        href="https://github.com/adioof/dream-masonry"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          marginLeft: 'auto',
          color: '#666',
          fontSize: 14,
          textDecoration: 'none',
        }}
      >
        GitHub ↗
      </a>
    </nav>
  );
}

function Demo() {
  const [items, setItems] = useState<Photo[]>(() => generateItems(0, 50));
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);

  const loadMore = useCallback(async () => {
    setFetching(true);
    await new Promise((r) => setTimeout(r, 600));
    setItems((prev) => {
      const next = [...prev, ...generateItems(prev.length, 30)];
      if (next.length >= 300) setHasMore(false);
      return next;
    });
    setFetching(false);
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          DreamMasonry Demo
        </h1>
        <p style={{ color: '#888', margin: '8px 0 0' }}>
          {items.length} items loaded{hasMore ? ' — scroll down for more' : ' — all loaded'}
        </p>
      </div>

      <DreamMasonry<Photo>
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
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(() => {
    return window.location.hash === '#benchmark' ? 'benchmark' : 'demo';
  });

  const handleSetPage = useCallback((p: string) => {
    setPage(p);
    window.location.hash = p === 'demo' ? '' : p;
  }, []);

  return (
    <>
      <Nav page={page} setPage={handleSetPage} />
      {page === 'benchmark' ? <Benchmark /> : <Demo />}
    </>
  );
}
