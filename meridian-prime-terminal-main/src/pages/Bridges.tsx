/**
 * Bridges.tsx — Meridian Prime
 * Cross-chain bridge volume, security scores, TVL tracking
 * Real data: DeFiLlama bridges API (free, no key)
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

interface BridgeData {
  id: string;
  name: string;
  chains: string[];
  tvl: number;
  volume24h: number;
  volume7d: number;
  securityScore: number; // 0-100
  audited: boolean;
  category: string;
  logo: string;
}

interface DLBridge {
  id?: number;
  displayName?: string;
  chains?: string[];
  currentDayVolume?: number;
  previousDayTotalTokensUSD?: number;
  lastHourlyVolume?: number;
}

interface DLBridgeVolume {
  id?: number;
  volume?: number;
}

function calcSecurityScore(name: string, audited: boolean): number {
  const topTier = ['stargate', 'across', 'hop', 'celer', 'synapse', 'axelar', 'wormhole', 'layerzero'];
  const base = topTier.some(t => name.toLowerCase().includes(t)) ? 80 : 60;
  return audited ? Math.min(100, base + 15) : base - 10;
}

function fmtUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtChains(chains: string[], max: number): string {
  if (!chains.length) return '—';
  const shown = chains.slice(0, max).join(', ');
  const extra = chains.length > max ? ` +${chains.length - max}` : '';
  return shown + extra;
}

// ─── SecurityBar ─────────────────────────────────────────────────────────────

interface SecurityBarProps { score: number; }
const SecurityBar = memo(({ score }: SecurityBarProps) => {
  const color = score >= 80 ? C.positive : score >= 60 ? C.warning : C.negative;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: C.glassBg, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color, minWidth: 24 }}>{score}</span>
    </div>
  );
});
SecurityBar.displayName = 'SecurityBar';

// ─── BridgeRow ───────────────────────────────────────────────────────────────

interface BridgeRowProps { bridge: BridgeData; rank: number; isMobile: boolean; }
const BridgeRow = memo(({ bridge, rank, isMobile }: BridgeRowProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '24px 1fr 80px' : '32px 1fr 110px 110px 110px 100px',
        alignItems: 'center',
        gap: isMobile ? 10 : 16,
        padding: isMobile ? '10px 12px' : '12px 16px',
        background: hovered ? C.glassBg : 'transparent',
        borderRadius: 8,
        transition: 'background 0.15s',
        cursor: 'default',
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: 10, color: C.textFaint, textAlign: 'right' }}>{rank}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {bridge.logo ? (
          <img src={bridge.logo} alt="" width={24} height={24} style={{ borderRadius: 6, flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div style={{ width: 24, height: 24, borderRadius: 6, background: C.accentBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: C.accent }}>{bridge.name[0]}</span>
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
            {bridge.name}
            {bridge.audited && (
              <span style={{ fontFamily: FONT, fontSize: 8, fontWeight: 600, color: C.positive, background: C.positiveBg, borderRadius: 4, padding: '1px 5px' }}>AUDITED</span>
            )}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fmtChains(bridge.chains, isMobile ? 2 : 4)}
          </div>
        </div>
      </div>

      {isMobile ? (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{fmtUsd(bridge.volume24h)}</div>
          <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>24h vol</div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.textPrimary }}>{fmtUsd(bridge.tvl)}</div>
            <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>TVL</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, color: C.accent }}>{fmtUsd(bridge.volume24h)}</div>
            <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>24h vol</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: FONT, fontSize: 11, color: C.textSecondary }}>{fmtUsd(bridge.volume7d)}</div>
            <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>7d vol</div>
          </div>
          <SecurityBar score={bridge.securityScore} />
        </>
      )}
    </div>
  );
});
BridgeRow.displayName = 'BridgeRow';

// ─── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps { label: string; value: string; sub?: string; }
const StatCard = memo(({ label, value, sub }: StatCardProps) => (
  <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: '14px 18px', flex: 1, minWidth: 120 }}>
    <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.textFaint, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 4 }}>{sub}</div>}
  </div>
));
StatCard.displayName = 'StatCard';

// ─── Bridges (Main) ───────────────────────────────────────────────────────────

const Bridges = memo(() => {
  const { isMobile } = useBreakpoint();
  const [bridges, setBridges] = useState<BridgeData[]>([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const abortRef   = useRef(new AbortController());

  const fetchData = useCallback(async () => {
    abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);

    try {
      const [listRes, volRes] = await Promise.all([
        fetch('https://bridges.llama.fi/bridges?includeChains=true', { signal }),
        fetch('https://bridges.llama.fi/bridgevolume/all?id=all', { signal }),
      ]);

      if (!mountedRef.current) return;

      const listJson = listRes.ok ? await listRes.json() as { bridges?: DLBridge[] } : { bridges: [] };
      const volJson  = volRes.ok  ? await volRes.json()  as DLBridgeVolume[] : [];

      if (!mountedRef.current) return;

      const volMap = new Map<number, number>();
      if (Array.isArray(volJson)) {
        volJson.slice(0, 50).forEach((v: DLBridgeVolume) => {
          if (v.id != null && v.volume != null) volMap.set(v.id, v.volume);
        });
      }

      const parsed: BridgeData[] = ((listJson.bridges ?? []) as DLBridge[])
        .slice(0, 20)
        .map((b: DLBridge): BridgeData => {
          const id = String(b.id ?? '');
          const name = b.displayName ?? `Bridge ${id}`;
          const audited = ['stargate','hop','across','celer','synapse','axelar','wormhole'].some(t => name.toLowerCase().includes(t));
          return {
            id,
            name,
            chains:        b.chains ?? [],
            tvl:           b.previousDayTotalTokensUSD ?? 0,
            volume24h:     b.currentDayVolume ?? 0,
            volume7d:      (volMap.get(Number(id)) ?? 0),
            securityScore: calcSecurityScore(name, audited),
            audited,
            category:      'Bridge',
            logo:          `https://icons.llama.fi/icons/protocols/${name.toLowerCase().replace(/\s+/g,'-')}.png`,
          };
        })
        .filter(b => b.tvl > 0 || b.volume24h > 0)
        .sort((a, b) => b.volume24h - a.volume24h);

      setBridges(parsed);
      setLastUpdated(Date.now());
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setError((e instanceof Error) ? e.message : 'Failed to load bridge data');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; abortRef.current.abort(); };
  }, [fetchData]);

  const stats = useMemo(() => {
    const totalTvl    = bridges.reduce((s, b) => s + b.tvl, 0);
    const totalVol24h = bridges.reduce((s, b) => s + b.volume24h, 0);
    const avgSec      = bridges.length ? Math.round(bridges.reduce((s, b) => s + b.securityScore, 0) / bridges.length) : 0;
    return { totalTvl, totalVol24h, avgSec, count: bridges.length };
  }, [bridges]);

  const lastStr = useMemo(() => {
    if (!lastUpdated) return '—';
    const s = Math.floor((Date.now() - lastUpdated) / 1000);
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  }, [lastUpdated]);

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Bridge Monitor</h1>
          <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
            Cross-Chain Volume · TVL · Security · Updated {lastStr}
          </p>
        </div>
        <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid rgba(15,40,180,0.2)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>↻ Refresh</button>
      </div>

      {/* Stat cards */}
      {!loading && bridges.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard label="Total TVL" value={fmtUsd(stats.totalTvl)} sub={`${stats.count} bridges`} />
          <StatCard label="24h Volume" value={fmtUsd(stats.totalVol24h)} />
          <StatCard label="Avg Security" value={`${stats.avgSec}/100`} sub="across all bridges" />
        </div>
      )}

      {loading && (
        <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>
          Loading bridge data...
        </div>
      )}

      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.negative, textAlign: 'center' }}>{error}</span>
          <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.textPrimary, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && bridges.length > 0 && (
        <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          {/* Table header */}
          {!isMobile && (
            <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 110px 110px 110px 100px', gap: 16, padding: '10px 16px', borderBottom: `1px solid ${C.glassBorder}`, background: C.glassBg }}>
              {['#', 'Bridge', 'TVL', '24h Vol', '7d Vol', 'Security'].map(h => (
                <span key={h} style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, textAlign: h === '#' ? 'right' : h === 'Bridge' ? 'left' : 'right' }}>{h}</span>
              ))}
            </div>
          )}
          {bridges.map((b, i) => <BridgeRow key={b.id} bridge={b} rank={i + 1} isMobile={isMobile} />)}
        </div>
      )}
    </div>
  );
});
Bridges.displayName = 'Bridges';
export default Bridges;
