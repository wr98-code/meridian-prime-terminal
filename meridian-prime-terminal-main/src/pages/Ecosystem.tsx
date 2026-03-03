/**
 * Ecosystem.tsx — Meridian Prime
 * Interactive DeFi ecosystem map — protocol categories, TVL, relationships
 * Data: DeFiLlama protocols (free)
 * React.memo + displayName ✓  rgba() only ✓  Zero className ✓
 * JetBrains Mono ✓  useCallback + useMemo ✓  mountedRef ✓  AbortController ✓
 */

import React, { memo, useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const FONT = "'JetBrains Mono', monospace";

const C = Object.freeze({
  accent:      'rgba(15,40,180,1)',
  accentBg:    'rgba(15,40,180,0.07)',
  positive:    'rgba(0,155,95,1)',
  negative:    'rgba(208,35,75,1)',
  warning:     'rgba(195,125,0,1)',
  textPrimary: 'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:   'rgba(165,175,210,1)',
  bgBase:      'rgba(248,249,252,1)',
  cardBg:      'rgba(255,255,255,1)',
  glassBg:     'rgba(15,40,100,0.04)',
  glassBorder: 'rgba(15,40,100,0.09)',
});

const CAT_COLORS: Record<string, string> = {
  'Dexes':           'rgba(15,40,180,1)',
  'Lending':         'rgba(0,155,95,1)',
  'Bridge':          'rgba(130,80,220,1)',
  'Derivatives':     'rgba(208,35,75,1)',
  'Yield':           'rgba(195,125,0,1)',
  'CDP':             'rgba(230,100,20,1)',
  'Liquid Staking':  'rgba(20,160,200,1)',
  'RWA':             'rgba(100,60,180,1)',
  'Other':           'rgba(120,130,165,1)',
};

interface Protocol {
  id: string;
  name: string;
  category: string;
  chains: string[];
  tvl: number;
  change1d: number;
  logo: string;
}

interface DLProtocol {
  id?: string;
  name?: string;
  category?: string;
  chains?: string[];
  tvl?: number;
  change_1d?: number;
  logo?: string;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

// ─── BubbleMap ────────────────────────────────────────────────────────────────

interface BubbleNode { id: string; name: string; category: string; tvl: number; x: number; y: number; r: number; logo: string; change1d: number; }

interface BubbleMapProps { protocols: Protocol[]; isMobile: boolean; }
const BubbleMap = memo(({ protocols, isMobile }: BubbleMapProps) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);

  const W = isMobile ? 340 : 700;
  const H = isMobile ? 320 : 480;

  // Create stable bubble positions via golden-ratio spiral
  const nodes = useMemo<BubbleNode[]>(() => {
    const maxTvl = Math.max(...protocols.map(p => p.tvl), 1);
    return protocols.slice(0, 50).map((p, i) => {
      const angle = i * 2.39996 * Math.PI; // golden angle
      const radius = Math.sqrt(i + 1) * (isMobile ? 28 : 42);
      const rNode = Math.max(8, Math.min(isMobile ? 32 : 52, 8 + (p.tvl / maxTvl) * (isMobile ? 24 : 44)));
      return {
        id:       p.id,
        name:     p.name,
        category: p.category,
        tvl:      p.tvl,
        logo:     p.logo,
        change1d: p.change1d,
        x: Math.max(rNode, Math.min(W - rNode, W / 2 + Math.cos(angle) * radius)),
        y: Math.max(rNode, Math.min(H - rNode, H / 2 + Math.sin(angle) * radius)),
        r: rNode,
      };
    });
  }, [protocols, isMobile, W, H]);

  const hoveredNode = useMemo(() => nodes.find(n => n.id === hovered), [nodes, hovered]);

  return (
    <div style={{ position: 'relative' }}>
      <svg
        width={W}
        height={H}
        style={{ background: C.glassBg, borderRadius: 12, border: `1px solid ${C.glassBorder}`, overflow: 'hidden', display: 'block', maxWidth: '100%' }}
      >
        {nodes.map(n => {
          const color = CAT_COLORS[n.category] ?? CAT_COLORS.Other;
          const isHov = hovered === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={e => { setHovered(n.id); setTooltip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }); }}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={n.x} cy={n.y} r={n.r}
                fill={`${color}22`}
                stroke={color}
                strokeWidth={isHov ? 2 : 1}
                opacity={hovered && !isHov ? 0.4 : 1}
              />
              {n.r > 16 && (
                <text
                  x={n.x} y={n.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  style={{ fontFamily: FONT, fontSize: Math.max(7, Math.min(11, n.r * 0.5)), fill: color, pointerEvents: 'none', fontWeight: 700 }}
                >
                  {n.name.length > 8 ? n.name.slice(0, 7) + '…' : n.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Tooltip */}
      {hovered && hoveredNode && tooltip && (
        <div style={{
          position: 'absolute',
          left: Math.min(tooltip.x + 10, W - 160),
          top:  Math.max(0, tooltip.y - 60),
          background: C.cardBg,
          border: `1px solid ${CAT_COLORS[hoveredNode.category] ?? C.glassBorder}`,
          borderRadius: 8,
          padding: '8px 12px',
          pointerEvents: 'none',
          zIndex: 10,
          minWidth: 130,
        }}>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{hoveredNode.name}</div>
          <div style={{ fontFamily: FONT, fontSize: 9, color: CAT_COLORS[hoveredNode.category] ?? C.textFaint, marginTop: 2 }}>{hoveredNode.category}</div>
          <div style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, marginTop: 4 }}>{fmtUsd(hoveredNode.tvl)}</div>
          <div style={{ fontFamily: FONT, fontSize: 9, color: hoveredNode.change1d >= 0 ? C.positive : C.negative }}>
            {hoveredNode.change1d >= 0 ? '+' : ''}{hoveredNode.change1d.toFixed(2)}% (1d)
          </div>
        </div>
      )}
    </div>
  );
});
BubbleMap.displayName = 'BubbleMap';

// ─── Legend ───────────────────────────────────────────────────────────────────

const Legend = memo(({ cats }: { cats: Record<string, number> }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
      <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: CAT_COLORS[cat] ?? CAT_COLORS.Other }} />
        <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>{cat} ({count})</span>
      </div>
    ))}
  </div>
));
Legend.displayName = 'Legend';

// ─── Ecosystem (Main) ─────────────────────────────────────────────────────────

const Ecosystem = memo(() => {
  const { isMobile } = useBreakpoint();
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<string>('All');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const abortRef   = useRef(new AbortController());

  const fetchData = useCallback(async () => {
    abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);

    try {
      const res = await fetch('https://api.llama.fi/protocols', { signal });
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as DLProtocol[];
      if (!mountedRef.current) return;

      const parsed: Protocol[] = (Array.isArray(json) ? json : [])
        .filter((p: DLProtocol) => (p.tvl ?? 0) > 10_000_000)
        .slice(0, 80)
        .map((p: DLProtocol): Protocol => ({
          id:       p.id ?? p.name ?? '',
          name:     p.name ?? '',
          category: p.category ?? 'Other',
          chains:   p.chains ?? [],
          tvl:      p.tvl ?? 0,
          change1d: p.change_1d ?? 0,
          logo:     p.logo ?? '',
        }))
        .sort((a, b) => b.tvl - a.tvl);

      setProtocols(parsed);
      setLastUpdated(Date.now());
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setError((e instanceof Error) ? e.message : 'Failed to load');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; abortRef.current.abort(); };
  }, [fetchData]);

  const categories = useMemo(() => {
    const cats: Record<string, number> = {};
    protocols.forEach(p => { cats[p.category] = (cats[p.category] ?? 0) + 1; });
    return cats;
  }, [protocols]);

  const filtered = useMemo(() => {
    if (catFilter === 'All') return protocols;
    return protocols.filter(p => p.category === catFilter);
  }, [protocols, catFilter]);

  const catList = useMemo(() => ['All', ...Object.keys(categories).sort((a, b) => (categories[b] ?? 0) - (categories[a] ?? 0)).slice(0, 8)], [categories]);

  const totalTvl = useMemo(() => filtered.reduce((s, p) => s + p.tvl, 0), [filtered]);

  const lastStr = useMemo(() => {
    if (!lastUpdated) return '—';
    const s = Math.floor((Date.now() - lastUpdated) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  }, [lastUpdated]);

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Ecosystem Map</h1>
          <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
            Protocol Relationships · TVL · Categories · Updated {lastStr}
          </p>
        </div>
        <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid rgba(15,40,180,0.2)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>↻ Refresh</button>
      </div>

      {/* Stats */}
      {!loading && protocols.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Protocols', value: filtered.length.toString(), sub: catFilter === 'All' ? 'all categories' : catFilter },
            { label: 'Total TVL', value: fmtUsd(totalTvl), sub: 'in selection' },
            { label: 'Categories', value: Object.keys(categories).length.toString(), sub: 'distinct sectors' },
          ].map(s => (
            <div key={s.label} style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {catList.map(cat => (
          <button key={cat} onClick={() => setCatFilter(cat)} style={{
            fontFamily: FONT, fontSize: 9, fontWeight: 600,
            color: cat === catFilter ? C.bgBase : C.textFaint,
            background: cat === catFilter ? (CAT_COLORS[cat] ?? C.accent) : 'transparent',
            border: `1px solid ${cat === catFilter ? (CAT_COLORS[cat] ?? C.accent) : C.glassBorder}`,
            borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
          }}>{cat}{cat !== 'All' ? ` (${categories[cat] ?? 0})` : ''}</button>
        ))}
      </div>

      {loading && <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>Loading ecosystem data...</div>}
      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.negative }}>{error}</span>
          <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BubbleMap protocols={filtered} isMobile={isMobile} />
          <Legend cats={categories} />
        </div>
      )}
    </div>
  );
});
Ecosystem.displayName = 'Ecosystem';
export default Ecosystem;
