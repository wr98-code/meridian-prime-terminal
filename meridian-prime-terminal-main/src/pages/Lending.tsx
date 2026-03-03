/**
 * Lending.tsx — Meridian Prime
 * Supply/Borrow APY across Aave, Compound, Morpho — real DeFiLlama yields API
 * React.memo + displayName ✓  rgba() only ✓  Zero className ✓
 * JetBrains Mono ✓  useCallback + useMemo ✓  mountedRef ✓  AbortController ✓
 */

import React, { memo, useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const FONT = "'JetBrains Mono', monospace";

const C = Object.freeze({
  accent:       'rgba(15,40,180,1)',
  accentBg:     'rgba(15,40,180,0.07)',
  positive:     'rgba(0,155,95,1)',
  positiveBg:   'rgba(0,155,95,0.08)',
  negative:     'rgba(208,35,75,1)',
  negativeBg:   'rgba(208,35,75,0.08)',
  warning:      'rgba(195,125,0,1)',
  warningBg:    'rgba(195,125,0,0.08)',
  textPrimary:  'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:    'rgba(165,175,210,1)',
  bgBase:       'rgba(248,249,252,1)',
  cardBg:       'rgba(255,255,255,1)',
  glassBg:      'rgba(15,40,100,0.04)',
  glassBorder:  'rgba(15,40,100,0.09)',
});

const TABS = Object.freeze(['All', 'Aave', 'Compound', 'Morpho', 'Spark'] as const);
type TabType = typeof TABS[number];

interface LendingPool {
  id: string;
  project: string;
  chain: string;
  symbol: string;
  tvlUsd: number;
  apyBase: number;
  apyReward: number;
  apyTotal: number;
  borrowBase: number;
  borrowTotal: number;
  ilRisk: string;
  stable: boolean;
}

interface DLYield {
  pool?: string;
  project?: string;
  chain?: string;
  symbol?: string;
  tvlUsd?: number;
  apyBase?: number;
  apyReward?: number;
  apy?: number;
  apyBaseBorrow?: number;
  apyTotalBorrow?: number;
  ilRisk?: string;
  stablecoin?: boolean;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtApy(n: number): string {
  return `${n.toFixed(2)}%`;
}

// ─── APY Badge ─────────────────────────────────────────────────────────────────

interface ApyBadgeProps { apy: number; }
const ApyBadge = memo(({ apy }: ApyBadgeProps) => {
  const color = apy >= 10 ? C.positive : apy >= 5 ? C.warning : apy >= 1 ? C.accent : C.textFaint;
  return (
    <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color }}>
      {fmtApy(apy)}
    </span>
  );
});
ApyBadge.displayName = 'ApyBadge';

// ─── PoolRow ──────────────────────────────────────────────────────────────────

interface PoolRowProps { pool: LendingPool; isMobile: boolean; }
const PoolRow = memo(({ pool, isMobile }: PoolRowProps) => {
  const [hovered, setHovered] = useState(false);

  const projectColor = useMemo(() => {
    if (pool.project.includes('aave')) return 'rgba(180,0,90,1)';
    if (pool.project.includes('compound')) return 'rgba(0,100,210,1)';
    if (pool.project.includes('morpho')) return 'rgba(130,80,220,1)';
    if (pool.project.includes('spark')) return 'rgba(230,100,20,1)';
    return C.accent;
  }, [pool.project]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 70px 70px' : '1fr 90px 90px 90px 90px 100px',
        alignItems: 'center',
        gap: isMobile ? 8 : 12,
        padding: isMobile ? '10px 12px' : '12px 18px',
        background: hovered ? C.glassBg : 'transparent',
        borderRadius: 8,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{pool.symbol}</span>
          {pool.stable && (
            <span style={{ fontFamily: FONT, fontSize: 8, color: C.positive, background: C.positiveBg, borderRadius: 4, padding: '1px 5px' }}>STABLE</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 2, alignItems: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: projectColor }}>{pool.project.replace(/-v\d/, '').toUpperCase()}</span>
          <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>{pool.chain}</span>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.positive }}>
          {fmtApy(pool.apyTotal)}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>Supply</div>
      </div>

      {!isMobile && (
        <>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary }}>{fmtApy(pool.apyBase)}</div>
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>Base</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 11, color: pool.apyReward > 0 ? C.accent : C.textFaint }}>{pool.apyReward > 0 ? `+${fmtApy(pool.apyReward)}` : '—'}</div>
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>Reward</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 11, color: C.negative }}>{pool.borrowTotal > 0 ? fmtApy(pool.borrowTotal) : '—'}</div>
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>Borrow</div>
          </div>
        </>
      )}

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.textPrimary }}>{fmtUsd(pool.tvlUsd)}</div>
        <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>TVL</div>
      </div>
    </div>
  );
});
PoolRow.displayName = 'PoolRow';

// ─── Lending (Main) ───────────────────────────────────────────────────────────

const LENDING_PROJECTS = ['aave', 'compound', 'morpho', 'spark'];

const Lending = memo(() => {
  const { isMobile } = useBreakpoint();
  const [pools, setPools]         = useState<LendingPool[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const abortRef   = useRef(new AbortController());

  const fetchData = useCallback(async () => {
    abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);

    try {
      const res = await fetch('https://yields.llama.fi/pools', { signal });
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { data?: DLYield[] };
      if (!mountedRef.current) return;

      const parsed: LendingPool[] = ((json.data ?? []) as DLYield[])
        .filter((p: DLYield) => LENDING_PROJECTS.some(t => (p.project ?? '').includes(t)) && (p.tvlUsd ?? 0) > 100_000)
        .slice(0, 100)
        .map((p: DLYield): LendingPool => ({
          id:          p.pool ?? '',
          project:     p.project ?? '',
          chain:       p.chain ?? '',
          symbol:      (p.symbol ?? '').replace(/\s+/g, '').slice(0, 20),
          tvlUsd:      p.tvlUsd ?? 0,
          apyBase:     p.apyBase ?? 0,
          apyReward:   p.apyReward ?? 0,
          apyTotal:    p.apy ?? 0,
          borrowBase:  p.apyBaseBorrow ?? 0,
          borrowTotal: p.apyTotalBorrow ?? 0,
          ilRisk:      p.ilRisk ?? 'no',
          stable:      p.stablecoin ?? false,
        }))
        .sort((a, b) => b.tvlUsd - a.tvlUsd);

      setPools(parsed);
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

  const filtered = useMemo(() => {
    if (activeTab === 'All') return pools;
    return pools.filter(p => p.project.toLowerCase().includes(activeTab.toLowerCase()));
  }, [pools, activeTab]);

  const stats = useMemo(() => {
    const totalTvl = pools.reduce((s, p) => s + p.tvlUsd, 0);
    const topSupply = filtered.length ? Math.max(...filtered.map(p => p.apyTotal)) : 0;
    const avgBorrow = filtered.length ? filtered.filter(p => p.borrowTotal > 0).reduce((s, p) => s + p.borrowTotal, 0) / (filtered.filter(p => p.borrowTotal > 0).length || 1) : 0;
    return { totalTvl, topSupply, avgBorrow, count: filtered.length };
  }, [pools, filtered]);

  const lastStr = useMemo(() => {
    if (!lastUpdated) return '—';
    const s = Math.floor((Date.now() - lastUpdated) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  }, [lastUpdated]);

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Lending</h1>
          <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
            Supply & Borrow APY · TVL · Updated {lastStr}
          </p>
        </div>
        <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid rgba(15,40,180,0.2)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>↻ Refresh</button>
      </div>

      {/* Stat cards */}
      {!loading && pools.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total TVL', value: fmtUsd(stats.totalTvl), sub: `${stats.count} pools` },
            { label: 'Top Supply APY', value: fmtApy(stats.topSupply), sub: 'in selection' },
            { label: 'Avg Borrow APY', value: fmtApy(stats.avgBorrow), sub: 'weighted' },
          ].map(s => (
            <div key={s.label} style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textFaint, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
            color: t === activeTab ? C.bgBase : C.textFaint,
            background: t === activeTab ? C.accent : 'transparent',
            border: `1px solid ${t === activeTab ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      {loading && <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>Loading lending data...</div>}

      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.negative }}>{error}</span>
          <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          {!isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px 90px 90px 100px', gap: 12, padding: '10px 18px', borderBottom: `1px solid ${C.glassBorder}`, background: C.glassBg }}>
              {['Pool', 'Supply APY', 'Base', 'Reward', 'Borrow APY', 'TVL'].map(h => (
                <span key={h} style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, textAlign: h === 'Pool' ? 'left' : 'right' }}>{h}</span>
              ))}
            </div>
          )}
          {filtered.map(p => <PoolRow key={p.id} pool={p} isMobile={isMobile} />)}
        </div>
      )}
    </div>
  );
});
Lending.displayName = 'Lending';
export default Lending;
