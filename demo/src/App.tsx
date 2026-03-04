import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DreamMasonry } from 'dream-masonry';

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
    return { id: `photo-${idx}`, width: w, height: h, color: COLORS[idx % COLORS.length] };
  });
}

// ── Benchmark ───────────────────────────────────────────────

type BenchResult = { count: number; renderTime: number; domNodes: number; fps: number | null };

function Benchmark() {
  const [results, setResults] = useState<BenchResult[]>([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('');
  const [benchItems, setBenchItems] = useState<Photo[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const TESTS = [100, 1000, 5000, 10000];

  const measureFPS = (): Promise<number> =>
    new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames++;
        if (performance.now() - start < 1000) requestAnimationFrame(tick);
        else resolve(Math.round(frames / ((performance.now() - start) / 1000)));
      };
      requestAnimationFrame(tick);
    });

  const run = async () => {
    setRunning(true);
    setResults([]);
    const res: BenchResult[] = [];
    for (const count of TESTS) {
      setStatus(`Rendering ${count.toLocaleString()} items...`);
      await new Promise((r) => setTimeout(r, 100));
      const items = generateItems(0, count);
      const t0 = performance.now();
      setBenchItems(items);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50))));
      const renderTime = Math.round(performance.now() - t0);
      const domNodes = ref.current ? ref.current.querySelectorAll('*').length : 0;
      setStatus(`Measuring FPS (${count.toLocaleString()} items)...`);
      const fps = await measureFPS();
      res.push({ count, renderTime, domNodes, fps });
      setResults([...res]);
    }
    setStatus('');
    setRunning(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={run} disabled={running} style={{
          padding: '10px 24px', borderRadius: 8, border: 'none',
          background: running ? '#555' : '#6c63ff', color: '#fff',
          fontSize: 15, fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer',
        }}>
          {running ? 'Running...' : 'Run Benchmark'}
        </button>
        {status && <span style={{ color: '#888', fontSize: 14 }}>{status}</span>}
      </div>

      {results.length > 0 && (
        <table style={{ width: '100%', maxWidth: 600, borderCollapse: 'collapse', marginBottom: 32 }}>
          <thead>
            <tr>
              {['Items', 'Render Time', 'DOM Nodes', 'FPS'].map((h) => (
                <th key={h} style={{
                  textAlign: 'left', padding: '10px 16px', borderBottom: '2px solid #333',
                  color: '#888', fontSize: 13, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.count}>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #222', color: '#fff', fontWeight: 600 }}>
                  {r.count.toLocaleString()}
                </td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #222', color: '#ccc', fontFamily: 'monospace' }}>
                  {r.renderTime}ms
                </td>
                <td style={{ padding: '10px 16px', borderBottom: '1px solid #222', color: '#ccc', fontFamily: 'monospace' }}>
                  ~{r.domNodes}
                </td>
                <td style={{
                  padding: '10px 16px', borderBottom: '1px solid #222', fontFamily: 'monospace', fontWeight: 600,
                  color: r.fps && r.fps >= 55 ? '#22c55e' : r.fps && r.fps >= 40 ? '#eab308' : '#ef4444',
                }}>{r.fps ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div ref={ref} style={{
        height: benchItems.length > 0 ? 500 : 0, overflow: 'auto', borderRadius: 8,
        border: benchItems.length > 0 ? '1px solid #333' : 'none',
      }}>
        {benchItems.length > 0 && (
          <DreamMasonry<Photo>
            items={benchItems}
            maxColumnCount={5}
            scrollContainer={ref}
            renderItem={(photo) => (
              <div style={{ width: '100%', height: '100%', backgroundColor: photo.color, display: 'flex', alignItems: 'end', padding: 8 }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontFamily: 'monospace' }}>{photo.id}</span>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────

export default function App() {
  const [items, setItems] = useState<Photo[]>(() => generateItems(0, 50));
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [tab, setTab] = useState<'demo' | 'benchmark'>(() =>
    window.location.hash === '#benchmark' ? 'benchmark' : 'demo'
  );

  useEffect(() => {
    const onHash = () => setTab(window.location.hash === '#benchmark' ? 'benchmark' : 'demo');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

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

  const tabStyle = (active: boolean) => ({
    padding: '8px 20px', borderRadius: 6, textDecoration: 'none' as const, fontSize: 14, fontWeight: 600,
    background: active ? '#6c63ff' : '#1c1c20', color: active ? '#fff' : '#888',
    border: '1px solid ' + (active ? '#6c63ff' : '#333'), cursor: 'pointer' as const,
  });

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#fff' }}>DreamMasonry</h1>
        <p style={{ color: '#888', margin: '4px 0 0', fontSize: 15 }}>Virtualized masonry grid for React</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <a href="#demo" onClick={() => setTab('demo')} style={tabStyle(tab === 'demo')}>Demo</a>
          <a href="#benchmark" onClick={() => setTab('benchmark')} style={tabStyle(tab === 'benchmark')}>Benchmark</a>
          <a href="https://github.com/adioof/dream-masonry" target="_blank" rel="noopener" style={tabStyle(false)}>GitHub</a>
          <a href="https://www.npmjs.com/package/dream-masonry" target="_blank" rel="noopener" style={tabStyle(false)}>npm</a>
        </div>
      </div>

      {tab === 'demo' && (
        <>
          <p style={{ color: '#888', margin: '0 0 16px', fontSize: 14 }}>
            {items.length} items loaded{hasMore ? ' — scroll down for more' : ' — all loaded'}
          </p>
          <DreamMasonry<Photo>
            items={items} maxColumnCount={5} hasMore={hasMore} isFetchingMore={fetching} onLoadMore={loadMore}
            renderItem={(photo) => (
              <div style={{ width: '100%', height: '100%', backgroundColor: photo.color, display: 'flex', alignItems: 'end', padding: 12 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'monospace' }}>{photo.width}×{photo.height}</span>
              </div>
            )}
            renderLoader={() => <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading...</div>}
            renderEmpty={() => <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No items</div>}
          />
        </>
      )}

      {tab === 'benchmark' && (
        <>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>dream-masonry Benchmark</h2>
          <p style={{ color: '#888', fontSize: 14, margin: '0 0 24px' }}>
            Benchmarking <strong>dream-masonry</strong> — renders 100 to 10,000 items and measures render time, DOM node count, and FPS live in your browser. Install: <code style={{background:"#1c1c20",padding:"2px 6px",borderRadius:4,color:"#22c55e"}}>npm install dream-masonry</code>
          </p>
          <Benchmark />
        </>
      )}
    </div>
  );
}
