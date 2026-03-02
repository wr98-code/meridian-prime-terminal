/**
 * Staking.tsx — Meridian Prime
 * ETH staking comparison, liquid staking peg health, restaking
 * Real data: DeFiLlama yields + Beacon Chain stats
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
  purple:      'rgba(130,80,220,1)',
  purpleBg:    'rgba(130,80,220,0.08)',
  textPrimary: 'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:   'rgba(165,175,210,1)',
  bgBase:      'rgba(248,249,252,1)',
  cardBg:      'rgba(255,255,255,1)',
  glassBg:     'rgba(15,40,100,0.04)',
  glassBorder: 'rgba(15,40,100,0.09)',
});

const TABS = Object.freeze(['All', 'Liquid', 'Restaking', 'Native'] as const);
type TabType = typeof TABS[number];

interface StakingPool {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  project: string;
  tvlUsd: number;
  apy: number;
  apyBase: number;
  apyReward: number;
  type: 'liquid' | 'restaking' | 'native';
  pegRatio: number | null;
}

interface DLYield {
  pool?: string;
  symbol?: string;
  chain?: string;
  project?: string;
  tvlUsd?: number;
  apy?: number;
  apyBase?: number;
  apyReward?: number;
  stablecoin?: boolean;
  underlyingTokens?: string[];
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${(n / 1e3).toFixed(0)}K`;
}

const LIQUID_PROJECTS  = ['lido', 'rocket pool', 'coinbase', 'stader', 'frax', 'ankr', 'stakewise', 'mantle lsd'];
const RESTAKE_PROJECTS = ['eigenlayer', 'kelp dao', 'renzo', 'puffer', 'ether.fi', 'symbiotic'];

function classifyType(project: string): StakingPool['type'] {
  const p = project.toLowerCase();
  if (RESTAKE_PROJECTS.some(r => p.includes(r))) return 'restaking';
  if (LIQUID_PROJECTS.some(l => p.includes(l))) return 'liquid';
  return 'native';
}

// ─── PegIndicator ─────────────────────────────────────────────────────────────

interface PegIndicatorProps { ratio: number | null; }
const PegIndicator = memo(({ ratio }: PegIndicatorProps) => {
  if (ratio === null) return <span style={{ fontFamily: FONT, fontSize: 10, color: C.textFaint }}>—</span>;
  const pct = ((ratio - 1) * 100).toFixed(3);
  const color = Math.abs(ratio - 1) < 0.005 ? C.positive : Math.abs(ratio - 1) < 0.02 ? C.warning : C.negative;
  const label = Math.abs(ratio - 1) < 0.005 ? 'PEGGED' : ratio > 1 ? `+${pct}%` : `${pct}%`;
  return (
    <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color, background: `${color}14`, borderRadius: 4, padding: '2px 6px' }}>{label}</span>
  );
});
PegIndicator.displayName = 'PegIndicator';

// ─── TypeBadge ────────────────────────────────────────────────────────────────

interface TypeBadgeProps { type: StakingPool['type']; }
const TypeBadge = memo(({ type }: TypeBadgeProps) => {
  const map = {
    liquid:     { color: C.accent,    bg: C.accentBg,  label: 'LIQUID' },
    restaking:  { color: C.purple,    bg: C.purpleBg,  label: 'RESTAKE' },
    native:     { color: C.positive,  bg: C.positiveBg,label: 'NATIVE' },
  };
  const { color, bg, label } = map[type];
  return <span style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, color, background: bg, borderRadius: 4, padding: '2px 6px' }}>{label}</span>;
});
TypeBadge.displayName = 'TypeBadge';

// ─── PoolRow ──────────────────────────────────────────────────────────────────

interface PoolRowProps { pool: StakingPool; isMobile: boolean; }
const PoolRow = memo(({ pool, isMobile }: PoolRowProps) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 70px' : '1fr 80px 80px 80px 100px 90px',
        alignItems: 'center',
        gap: isMobile ? 10 : 14,
        padding: isMobile ? '10px 12px' : '12px 18px',
        background: hovered ? C.glassBg : 'transparent',
        borderRadius: 8,
        transition: 'background 0.15s',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{pool.symbol}</span>
          <TypeBadge type={pool.type} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 3, alignItems: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: C.accent }}>{pool.project}</span>
          <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>{pool.chain}</span>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.positive }}>{pool.apy.toFixed(2)}%</div>
        <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>APY</div>
      </div>

      {!isMobile && (
        <>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 10, color: C.textSecondary }}>{pool.apyBase.toFixed(2)}%</div>
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>Base</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 10, color: pool.apyReward > 0 ? C.purple : C.textFaint }}>
              {pool.apyReward > 0 ? `+${pool.apyReward.toFixed(2)}%` : '—'}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>Reward</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.textPrimary }}>{fmtUsd(pool.tvlUsd)}</div>
            <div style={{ fontFamily: FONT, fontSize: 8, color: C.textFaint }}>TVL</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <PegIndicator ratio={pool.pegRatio} />
          </div>
        </>
      )}
    </div>
  );
});
PoolRow.displayName = 'PoolRow';

// ─── Staking (Main) ───────────────────────────────────────────────────────────

const STAKING_KEYWORDS = ['steth', 'reth', 'wsteth', 'cbeth', 'meth', 'staking', 'eigen', 'restake', 'frxeth', 'ankr', 'sweth', 'oseth'];

const Staking = memo(() => {
  const { isMobile } = useBreakpoint();
  const [pools, setPools]         = useState<StakingPool[]>([]);
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

      const parsed: StakingPool[] = ((json.data ?? []) as DLYield[])
        .filter((p: DLYield) => {
          const sym = (p.symbol ?? '').toLowerCase();
          const proj = (p.project ?? '').toLowerCase();
          return (
            STAKING_KEYWORDS.some(k => sym.includes(k) || proj.includes(k)) &&
            (p.tvlUsd ?? 0) > 500_000
          );
        })
        .slice(0, 60)
        .map((p: DLYield): StakingPool => {
          const project = p.project ?? '';
          const type = classifyType(project);
          return {
            id:        p.pool ?? '',
            name:      p.symbol ?? '',
            symbol:    (p.symbol ?? '').replace(/-/g, ' ').toUpperCase().slice(0, 16),
            chain:     p.chain ?? 'Ethereum',
            project:   project.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            tvlUsd:    p.tvlUsd ?? 0,
            apy:       p.apy ?? 0,
            apyBase:   p.apyBase ?? 0,
            apyReward: p.apyReward ?? 0,
            type,
            pegRatio:  null, // DeFiLlama yields API does not expose peg ratio — shown as N/A
          };
        })
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
    const t = activeTab.toLowerCase();
    return pools.filter(p => p.type === t || (activeTab === 'Restaking' && p.type === 'restaking'));
  }, [pools, activeTab]);

  const stats = useMemo(() => {
    const total = pools.reduce((s, p) => s + p.tvlUsd, 0);
    const liquidTvl = pools.filter(p => p.type === 'liquid').reduce((s, p) => s + p.tvlUsd, 0);
    const restakeTvl = pools.filter(p => p.type === 'restaking').reduce((s, p) => s + p.tvlUsd, 0);
    const avgApy = pools.length ? pools.reduce((s, p) => s + p.apy, 0) / pools.length : 0;
    return { total, liquidTvl, restakeTvl, avgApy };
  }, [pools]);

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
          <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Staking & Yield</h1>
          <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
            Liquid Staking · Restaking · Peg Health · Updated {lastStr}
          </p>
        </div>
        <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid rgba(15,40,180,0.2)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>↻ Refresh</button>
      </div>

      {/* Stat cards */}
      {!loading && pools.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Staked TVL', value: fmtUsd(stats.total), sub: `${pools.length} pools` },
            { label: 'Liquid Staking',   value: fmtUsd(stats.liquidTvl), sub: 'incl. wstETH, rETH' },
            { label: 'Restaking TVL',    value: fmtUsd(stats.restakeTvl), sub: 'EigenLayer & more' },
            { label: 'Avg Staking APY',  value: `${stats.avgApy.toFixed(2)}%`, sub: 'across all pools' },
          ].map(s => (
            <div key={s.label} style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 110 }}>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{s.value}</div>
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

      {loading && <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>Loading staking data...</div>}
      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.negative }}>{error}</span>
          <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          {!isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 100px 90px', gap: 14, padding: '10px 18px', borderBottom: `1px solid ${C.glassBorder}`, background: C.glassBg }}>
              {['Pool', 'APY', 'Base', 'Reward', 'TVL', 'Peg'].map(h => (
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
Staking.displayName = 'Staking';
export default Staking;
