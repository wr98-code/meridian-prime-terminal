/**
 * Stablecoins.tsx — Meridian Prime
 * Supply tracking, peg health, dominance, yield rates
 * Real data: DeFiLlama stablecoins API (free)
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
  positiveBg:  'rgba(0,155,95,0.08)',
  negative:    'rgba(208,35,75,1)',
  negativeBg:  'rgba(208,35,75,0.08)',
  warning:     'rgba(195,125,0,1)',
  warningBg:   'rgba(195,125,0,0.08)',
  textPrimary: 'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:   'rgba(165,175,210,1)',
  bgBase:      'rgba(248,249,252,1)',
  cardBg:      'rgba(255,255,255,1)',
  glassBg:     'rgba(15,40,100,0.04)',
  glassBorder: 'rgba(15,40,100,0.09)',
});

interface StablecoinData {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  pegMechanism: string;
  circulating: number;
  circulatingPrevDay: number;
  change24h: number;
  price: number;
  pegDeviation: number;
  dominance: number;
  chains: string[];
}

interface DLStablecoin {
  id?: string;
  name?: string;
  symbol?: string;
  pegType?: string;
  pegMechanism?: string;
  circulating?: { peggedUSD?: number };
  circulatingPrevDay?: { peggedUSD?: number };
  price?: number;
  chains?: string[];
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

function getPegColor(dev: number): string {
  const abs = Math.abs(dev);
  if (abs < 0.003) return C.positive;
  if (abs < 0.01)  return C.warning;
  return C.negative;
}

function getMechLabel(mech: string): string {
  if (mech.includes('fiat')) return 'FIAT';
  if (mech.includes('crypto')) return 'CRYPTO';
  if (mech.includes('algo')) return 'ALGO';
  return mech.toUpperCase().slice(0, 8);
}

// ─── PegBar ───────────────────────────────────────────────────────────────────

interface PegBarProps { deviation: number; price: number; }
const PegBar = memo(({ deviation, price }: PegBarProps) => {
  const color = getPegColor(deviation);
  const pct   = (deviation * 100).toFixed(3);
  const sign  = deviation >= 0 ? '+' : '';
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color }}>${price.toFixed(4)}</div>
      <div style={{ fontFamily: FONT, fontSize: 9, color, marginTop: 1 }}>{sign}{pct}%</div>
    </div>
  );
});
PegBar.displayName = 'PegBar';

// ─── DominanceBar ─────────────────────────────────────────────────────────────

interface DominanceBarProps { pct: number; color?: string; }
const DominanceBar = memo(({ pct, color = C.accent }: DominanceBarProps) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ flex: 1, height: 4, background: C.glassBg, borderRadius: 2 }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: 2 }} />
    </div>
    <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, minWidth: 34, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
  </div>
));
DominanceBar.displayName = 'DominanceBar';

// ─── StablecoinRow ────────────────────────────────────────────────────────────

interface StablecoinRowProps { coin: StablecoinData; rank: number; totalSupply: number; isMobile: boolean; }
const StablecoinRow = memo(({ coin, rank, totalSupply, isMobile }: StablecoinRowProps) => {
  const [hovered, setHovered] = useState(false);
  const dominance = totalSupply > 0 ? (coin.circulating / totalSupply) * 100 : 0;
  const pegColor  = getPegColor(coin.pegDeviation);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '24px 1fr 80px' : '28px 1fr 120px 100px 110px 120px',
        alignItems: 'center',
        gap: isMobile ? 10 : 14,
        padding: isMobile ? '10px 12px' : '12px 18px',
        background: hovered ? C.glassBg : 'transparent',
        borderRadius: 8,
        transition: 'background 0.15s',
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: 10, color: C.textFaint, textAlign: 'right' }}>{rank}</span>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{coin.symbol}</span>
          <span style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, color: C.accent, background: C.accentBg, borderRadius: 4, padding: '1px 5px' }}>
            {getMechLabel(coin.pegMechanism)}
          </span>
        </div>
        <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>{coin.name}</span>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{fmtUsd(coin.circulating)}</div>
        <div style={{ fontFamily: FONT, fontSize: 8, color: coin.change24h >= 0 ? C.positive : C.negative }}>
          {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
        </div>
      </div>

      {!isMobile && (
        <>
          <PegBar deviation={coin.pegDeviation} price={coin.price} />
          <DominanceBar pct={dominance} color={pegColor} />
          <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'right' }}>
            {coin.chains.slice(0, 3).join(', ')}
            {coin.chains.length > 3 ? ` +${coin.chains.length - 3}` : ''}
          </div>
        </>
      )}
    </div>
  );
});
StablecoinRow.displayName = 'StablecoinRow';

// ─── Stablecoins (Main) ───────────────────────────────────────────────────────

const Stablecoins = memo(() => {
  const { isMobile } = useBreakpoint();
  const [coins, setCoins]           = useState<StablecoinData[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [sortBy, setSortBy]         = useState<'supply' | 'peg' | 'change'>('supply');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const abortRef   = useRef(new AbortController());

  const fetchData = useCallback(async () => {
    abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);

    try {
      const res = await fetch('https://stablecoins.llama.fi/stablecoins?includePrices=true', { signal });
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { peggedAssets?: DLStablecoin[] };
      if (!mountedRef.current) return;

      const parsed: StablecoinData[] = ((json.peggedAssets ?? []) as DLStablecoin[])
        .filter((c: DLStablecoin) => (c.circulating?.peggedUSD ?? 0) > 1_000_000)
        .slice(0, 30)
        .map((c: DLStablecoin): StablecoinData => {
          const circ     = c.circulating?.peggedUSD ?? 0;
          const prevCirc = c.circulatingPrevDay?.peggedUSD ?? circ;
          const price    = c.price ?? 1;
          const change24h = prevCirc > 0 ? ((circ - prevCirc) / prevCirc) * 100 : 0;
          return {
            id:                 c.id ?? '',
            name:               c.name ?? '',
            symbol:             c.symbol ?? '',
            pegType:            c.pegType ?? 'peggedUSD',
            pegMechanism:       c.pegMechanism ?? 'fiat-backed',
            circulating:        circ,
            circulatingPrevDay: prevCirc,
            change24h,
            price,
            pegDeviation:       price - 1,
            dominance:          0, // calculated later
            chains:             c.chains ?? [],
          };
        });

      setCoins(parsed);
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

  const totalSupply = useMemo(() => coins.reduce((s, c) => s + c.circulating, 0), [coins]);

  const sorted = useMemo(() => {
    const arr = [...coins];
    if (sortBy === 'supply')  arr.sort((a, b) => b.circulating - a.circulating);
    if (sortBy === 'peg')     arr.sort((a, b) => Math.abs(a.pegDeviation) - Math.abs(b.pegDeviation));
    if (sortBy === 'change')  arr.sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h));
    return arr;
  }, [coins, sortBy]);

  const lastStr = useMemo(() => {
    if (!lastUpdated) return '—';
    const s = Math.floor((Date.now() - lastUpdated) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  }, [lastUpdated]);

  const offPeg = useMemo(() => coins.filter(c => Math.abs(c.pegDeviation) > 0.01).length, [coins]);

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Stablecoin Center</h1>
          <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
            Supply · Peg Health · Dominance · Updated {lastStr}
          </p>
        </div>
        <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid rgba(15,40,180,0.2)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>↻ Refresh</button>
      </div>

      {/* Stats */}
      {!loading && coins.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Supply', value: fmtUsd(totalSupply), sub: `${coins.length} stablecoins` },
            { label: 'USDT Dominance', value: `${((coins.find(c => c.symbol === 'USDT')?.circulating ?? 0) / totalSupply * 100).toFixed(1)}%`, sub: 'of total stablecoin mktcap' },
            { label: 'USDC Dominance', value: `${((coins.find(c => c.symbol === 'USDC')?.circulating ?? 0) / totalSupply * 100).toFixed(1)}%`, sub: 'regulated fiat-backed' },
            { label: 'Off-Peg Alerts', value: `${offPeg}`, sub: '>1% deviation', color: offPeg > 0 ? C.negative : C.positive },
          ].map(s => (
            <div key={s.label} style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: s.color ?? C.textPrimary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sort tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['supply', 'peg', 'change'] as const).map(s => (
          <button key={s} onClick={() => setSortBy(s)} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600,
            color: s === sortBy ? C.bgBase : C.textFaint,
            background: s === sortBy ? C.accent : 'transparent',
            border: `1px solid ${s === sortBy ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
          }}>Sort: {s.charAt(0).toUpperCase() + s.slice(1)}</button>
        ))}
      </div>

      {loading && <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>Loading stablecoin data...</div>}
      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.negative }}>{error}</span>
          <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          {!isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 120px 100px 110px 120px', gap: 14, padding: '10px 18px', borderBottom: `1px solid ${C.glassBorder}`, background: C.glassBg }}>
              {['#', 'Stablecoin', 'Supply', 'Price / Peg', 'Dominance', 'Chains'].map(h => (
                <span key={h} style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, textAlign: h === '#' || h === 'Stablecoin' ? 'left' : 'right' }}>{h}</span>
              ))}
            </div>
          )}
          {sorted.map((c, i) => <StablecoinRow key={c.id} coin={c} rank={i + 1} totalSupply={totalSupply} isMobile={isMobile} />)}
        </div>
      )}
    </div>
  );
});
Stablecoins.displayName = 'Stablecoins';
export default Stablecoins;
