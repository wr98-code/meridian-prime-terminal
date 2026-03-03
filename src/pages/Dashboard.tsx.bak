<<<<<<< HEAD
=======
/**
 * Dashboard.tsx — MERIDIAN PRIME
 * REAL DATA ONLY:
 * - Assets + Global + FearGreed: CoinGecko via CryptoContext
 * - News: CryptoPanic (fallback CryptoCompare) via useCryptoNews
 * - Market cap change 24h: dari global.market_cap_change_percentage_24h_usd (CoinGecko)
 * Zero Math.random(). Zero hardcoded news. Zero fake % change.
 */

>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
import { memo, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCrypto } from '@/context/CryptoContext';
import { useCryptoNews } from '@/hooks/useCryptoNews';
import GlassCard from '@/components/shared/GlassCard';
import ChangeBadge from '@/components/shared/ChangeBadge';
import SparklineChart from '@/components/shared/SparklineChart';
import FearGreedGauge from '@/components/shared/FearGreedGauge';
import SkeletonShimmer from '@/components/shared/SkeletonShimmer';
import { colors, font, radii } from '@/styles/tokens';
import { formatPrice, formatCompact, formatDelta } from '@/utils/formatters';
import type { Regime } from '@/types/crypto';
import { RefreshCw, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';

<<<<<<< HEAD
const regimeLabels: Record<Regime, { icon: string; label: string; desc: string; color: string }> = {
  SURGE: { icon: '🔥', label: 'SURGE MODE', desc: 'Extreme bullish momentum across major assets', color: colors.warn },
  BULL: { icon: '↑', label: 'BULL MARKET', desc: 'Broad market strength with positive momentum', color: colors.bull },
  CRAB: { icon: '⇌', label: 'CRAB MARKET', desc: 'Mixed signals — range-bound price action', color: colors.warn },
  BEAR: { icon: '↓', label: 'BEAR MARKET', desc: 'Risk-off sentiment with declining prices', color: colors.bear },
=======
// CoinGecko /coins/markets response fields (raw JSON — camelCase mismatch by design)
type RawCoinGeckoAsset = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  sparkline_in_7d: { price: number[] } | null;
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
};

// CoinGecko /global response fields
type RawGlobalData = {
  total_market_cap?: { usd?: number };
  total_volume?: { usd?: number };
  market_cap_percentage?: { btc?: number; eth?: number };
  market_cap_change_percentage_24h_usd?: number;
};

const regimeLabels: Record<Regime, { icon: string; label: string; desc: string; color: string }> = {
  SURGE: { icon: '🔥', label: 'SURGE MODE',  desc: 'Extreme bullish momentum across major assets',  color: colors.warn },
  BULL:  { icon: '↑',  label: 'BULL MARKET', desc: 'Broad market strength with positive momentum',  color: colors.bull },
  CRAB:  { icon: '⇌',  label: 'CRAB MARKET', desc: 'Mixed signals — range-bound price action',       color: colors.warn },
  BEAR:  { icon: '↓',  label: 'BEAR MARKET', desc: 'Risk-off sentiment with declining prices',       color: colors.bear },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Dashboard() {
<<<<<<< HEAD
  const { assets, global, fearGreed, regime, isLoading } = useCrypto();
=======
  const { assets, global, fearGreed, regime, isLoading, isError } = useCrypto();
  const { news, loading: newsLoading } = useCryptoNews();
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  const navigate = useNavigate();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

<<<<<<< HEAD
  const totalMcap = global?.total_market_cap?.usd ?? 2400000000000;
  const totalVol = global?.total_volume?.usd ?? 98000000000;
  const btcDom = global?.market_cap_percentage?.btc ?? 54.2;
  const ethDom = global?.market_cap_percentage?.eth ?? 17.1;
  const fgValue = fearGreed ? parseInt(fearGreed.value, 10) : 65;
  const fgLabel = fearGreed?.value_classification ?? 'Greed';

  const gainers = useMemo(() =>
    [...assets].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 5),
    [assets]
  );
  const losers = useMemo(() =>
    [...assets].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)).slice(0, 5),
    [assets]
=======
  // Cast to raw CoinGecko shape — fetchMarkets returns plain JSON
  const rawAssets = assets as unknown as RawCoinGeckoAsset[];
  const rawGlobal = global as unknown as RawGlobalData | null;

  const totalMcap    = rawGlobal?.total_market_cap?.usd              ?? 0;
  const totalVol     = rawGlobal?.total_volume?.usd                  ?? 0;
  const btcDom       = rawGlobal?.market_cap_percentage?.btc         ?? 0;
  const ethDom       = rawGlobal?.market_cap_percentage?.eth         ?? 0;
  const mcapChange   = rawGlobal?.market_cap_change_percentage_24h_usd ?? null; // REAL 24h change
  const fgValue      = fearGreed ? parseInt(String((fearGreed as unknown as { value: string }).value), 10) : null;
  const fgLabel      = fearGreed ? String((fearGreed as unknown as { value_classification: string }).value_classification) : '—';

  const gainers = useMemo(() =>
    [...rawAssets].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 5),
    [rawAssets]
  );
  const losers = useMemo(() =>
    [...rawAssets].sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0)).slice(0, 5),
    [rawAssets]
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  );

  // Real metrics — change only shown when data available
  const metrics = [
<<<<<<< HEAD
    { label: 'MARKET CAP', value: formatCompact(totalMcap), change: 1.8 },
    { label: '24H VOLUME', value: formatCompact(totalVol), change: -2.3 },
    { label: 'BTC DOMINANCE', value: `${btcDom.toFixed(1)}%`, change: 0.3 },
    { label: 'ETH DOMINANCE', value: `${ethDom.toFixed(1)}%`, change: -0.1 },
    { label: 'FEAR & GREED', value: String(fgValue), change: null },
=======
    { label: 'MARKET CAP',     value: totalMcap  ? formatCompact(totalMcap)  : '—', change: mcapChange },
    { label: '24H VOLUME',     value: totalVol   ? formatCompact(totalVol)   : '—', change: null },
    { label: 'BTC DOMINANCE',  value: btcDom     ? `${btcDom.toFixed(1)}%`   : '—', change: null },
    { label: 'ETH DOMINANCE',  value: ethDom     ? `${ethDom.toFixed(1)}%`   : '—', change: null },
    { label: 'FEAR & GREED',   value: fgValue !== null ? String(fgValue)     : '—', change: null },
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  ];

  const rl = regimeLabels[regime];

<<<<<<< HEAD
  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };
=======
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
  const fadeUp  = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

  // Top 5 news dari real API
  const topNews = news.slice(0, 5);

  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, fontFamily: font.family }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>Failed to load market data</div>
        <div style={{ fontSize: 11, color: colors.textMuted }}>CoinGecko may be rate-limiting. Try again in a moment.</div>
        <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: '8px 20px', fontSize: 11, fontWeight: 600, fontFamily: font.family, background: colors.accentDim, color: colors.accent, border: `1px solid ${colors.borderAccent}`, borderRadius: radii.badge, cursor: 'pointer' }}>
          Retry
        </button>
      </div>
    );
  }
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)

  return (
    <motion.div initial="hidden" animate="show" variants={stagger}>
      {/* Header */}
      <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
          <h1 style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, margin: 0 }}>Dashboard</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '10px', color: colors.textMuted, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>
            {clock.toLocaleTimeString()}
          </span>
<<<<<<< HEAD
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.bull, animation: 'pulse 2s infinite' }} />
=======
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isLoading ? colors.warn : colors.bull, animation: 'pulse 2s infinite' }} />
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
          <button aria-label="Refresh" style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}>
            <RefreshCw size={14} style={{ color: colors.textMuted }} />
          </button>
        </div>
      </motion.div>

      {/* Metrics Strip */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
<<<<<<< HEAD
        {metrics.map((m, i) => (
=======
        {metrics.map((m) => (
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
          <GlassCard key={m.label}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: font.family, marginBottom: '6px' }}>
              {m.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
<<<<<<< HEAD
              <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>
                {m.value}
              </span>
              {m.change !== null && <ChangeBadge value={m.change} />}
=======
              {isLoading
                ? <SkeletonShimmer height="22px" />
                : (
                  <>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>
                      {m.value}
                    </span>
                    {m.change !== null && m.change !== undefined && <ChangeBadge value={m.change} />}
                  </>
                )
              }
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Regime Banner */}
      <motion.div variants={fadeUp} style={{
<<<<<<< HEAD
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: colors.bgCard,
        borderLeft: `3px solid ${rl.color}`,
        borderRadius: radii.card,
        marginBottom: '16px',
        boxShadow: `inset 4px 0 12px -4px ${rl.color}20`,
        fontFamily: font.family,
=======
        height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', background: colors.bgCard, borderLeft: `3px solid ${rl.color}`,
        borderRadius: radii.card, marginBottom: '16px', boxShadow: `inset 4px 0 12px -4px ${rl.color}20`, fontFamily: font.family,
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '16px' }}>{rl.icon}</span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: rl.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{rl.label}</span>
          <span style={{ fontSize: '10px', color: colors.textMuted }}>{rl.desc}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {gainers[0] && (
            <span style={{ fontSize: '10px', fontWeight: 600, color: colors.bull, background: colors.bullDim, padding: '2px 8px', borderRadius: radii.badge }}>
              🚀 {gainers[0].symbol.toUpperCase()} {formatDelta(gainers[0].price_change_percentage_24h)}
            </span>
          )}
          {losers[0] && (
            <span style={{ fontSize: '10px', fontWeight: 600, color: colors.bear, background: colors.bearDim, padding: '2px 8px', borderRadius: radii.badge }}>
              📉 {losers[0].symbol.toUpperCase()} {formatDelta(losers[0].price_change_percentage_24h)}
            </span>
          )}
        </div>
      </motion.div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
<<<<<<< HEAD
          {/* Price Chart Card */}
=======
          {/* Price Chart */}
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family }}>Bitcoin Price</span>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['1H', '4H', '1D', '1W', '1M'].map(tf => (
                    <button key={tf} style={{
<<<<<<< HEAD
                      padding: '4px 8px',
                      fontSize: '9px',
                      fontWeight: 600,
                      fontFamily: font.family,
                      background: tf === '1D' ? colors.accentDim : 'transparent',
                      color: tf === '1D' ? colors.accent : colors.textMuted,
                      border: `1px solid ${tf === '1D' ? colors.borderAccent : 'transparent'}`,
                      borderRadius: radii.badge,
                      cursor: 'pointer',
                    }}>
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
              {assets[0]?.sparkline_in_7d?.price ? (
                <SparklineChart
                  data={assets[0].sparkline_in_7d.price}
                  width={600}
                  height={200}
                  positive={(assets[0].price_change_percentage_24h ?? 0) >= 0}
=======
                      padding: '4px 8px', fontSize: '9px', fontWeight: 600, fontFamily: font.family,
                      background: tf === '1D' ? colors.accentDim : 'transparent',
                      color: tf === '1D' ? colors.accent : colors.textMuted,
                      border: `1px solid ${tf === '1D' ? colors.borderAccent : 'transparent'}`,
                      borderRadius: radii.badge, cursor: 'pointer',
                    }}>{tf}</button>
                  ))}
                </div>
              </div>
              {isLoading ? (
                <SkeletonShimmer height="200px" />
              ) : rawAssets[0]?.sparkline_in_7d?.price ? (
                <SparklineChart
                  data={rawAssets[0].sparkline_in_7d.price}
                  width={600} height={200}
                  positive={(rawAssets[0].price_change_percentage_24h ?? 0) >= 0}
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
                />
              ) : (
                <SkeletonShimmer height="200px" />
              )}
            </GlassCard>
          </motion.div>

          {/* Top Movers */}
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family }}>Top Movers</span>
              </div>
<<<<<<< HEAD
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: colors.bull, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: font.family }}>
                    <TrendingUp size={12} /> GAINERS
                  </div>
                  {gainers.map(coin => (
                    <MoverRow key={coin.id} coin={coin} onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)} />
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: colors.bear, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: font.family }}>
                    <TrendingDown size={12} /> LOSERS
                  </div>
                  {losers.map(coin => (
                    <MoverRow key={coin.id} coin={coin} onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)} />
                  ))}
=======
              {isLoading ? (
                <SkeletonShimmer height="160px" />
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: colors.bull, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: font.family }}>
                      <TrendingUp size={12} /> GAINERS
                    </div>
                    {gainers.map(coin => (
                      <MoverRow key={coin.id} coin={coin} onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)} />
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: colors.bear, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: font.family }}>
                      <TrendingDown size={12} /> LOSERS
                    </div>
                    {losers.map(coin => (
                      <MoverRow key={coin.id} coin={coin} onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)} />
                    ))}
                  </div>
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
                </div>
              )}
            </GlassCard>
          </motion.div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family }}>Fear & Greed</span>
              </div>
              {fgValue !== null
                ? <FearGreedGauge value={fgValue} label={fgLabel} />
                : <SkeletonShimmer height="100px" />
              }
            </GlassCard>
          </motion.div>

          {/* Latest News — REAL DATA via useCryptoNews */}
          <motion.div variants={fadeUp}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family }}>Latest News</span>
              </div>
<<<<<<< HEAD
              {[
                { title: 'Bitcoin ETF inflows hit $1.2B as institutional demand surges', time: '12m ago', source: 'Bloomberg' },
                { title: 'Ethereum Layer-2 TVL reaches new all-time high of $45B', time: '34m ago', source: 'CoinDesk' },
                { title: 'Fed signals pause on rate hikes, crypto markets rally', time: '1h ago', source: 'Reuters' },
              ].map((n, i) => (
                <div key={i} style={{
                  padding: '10px 0',
                  borderBottom: i < 2 ? `1px solid ${colors.borderFaint}` : 'none',
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: colors.accent, background: colors.accentDim, padding: '1px 6px', borderRadius: radii.badge, fontFamily: font.family }}>{n.source}</span>
                    <span style={{ fontSize: '9px', color: colors.textFaint, fontFamily: font.family }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family, lineHeight: 1.4 }}>{n.title}</div>
                </div>
              ))}
=======
              {newsLoading ? (
                <SkeletonShimmer height="120px" />
              ) : topNews.length === 0 ? (
                <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: font.family, padding: '12px 0' }}>No news available</div>
              ) : (
                topNews.map((n, i) => (
                  <a
                    key={n.id}
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block', textDecoration: 'none',
                      padding: '10px 0',
                      borderBottom: i < topNews.length - 1 ? `1px solid ${colors.borderFaint}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: colors.accent, background: colors.accentDim, padding: '1px 6px', borderRadius: radii.badge, fontFamily: font.family }}>
                        {n.source}
                      </span>
                      <span style={{ fontSize: '9px', color: colors.textFaint, fontFamily: font.family }}>
                        {timeAgo(n.publishedAt)}
                      </span>
                      {n.sentiment !== 'neutral' && (
                        <span style={{ fontSize: '9px', color: n.sentiment === 'bullish' ? colors.bull : colors.bear, fontFamily: font.family }}>
                          {n.sentiment === 'bullish' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family, lineHeight: 1.4 }}>
                      {n.title}
                    </div>
                  </a>
                ))
              )}
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Markets Preview */}
      <motion.div variants={fadeUp} style={{ marginTop: '16px' }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family }}>Markets</span>
            </div>
<<<<<<< HEAD
            <button
              onClick={() => navigate('/markets')}
              style={{ fontSize: '10px', fontWeight: 600, color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.family }}
            >
              View all →
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.family }}>
              <thead>
                <tr>
                  {['#', 'Asset', 'Price', '24h', '7d', 'Market Cap', 'Volume', ''].map(h => (
                    <th key={h} style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', textAlign: h === 'Asset' ? 'left' : 'right', padding: '8px 12px', borderBottom: `1px solid ${colors.borderFaint}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assets.slice(0, 10).map((coin, i) => (
                  <tr key={coin.id} onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '8px 12px', fontSize: '10px', color: colors.textMuted, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={coin.image} alt={coin.name} width={24} height={24} style={{ borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary }}>{coin.name}</div>
                          <div style={{ fontSize: '10px', color: colors.textMuted }}>{coin.symbol.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textPrimary }}>{formatPrice(coin.current_price)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}><ChangeBadge value={coin.price_change_percentage_24h} /></td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}><ChangeBadge value={coin.price_change_percentage_7d_in_currency} /></td>
                    <td style={{ padding: '8px 12px', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}>{formatCompact(coin.market_cap)}</td>
                    <td style={{ padding: '8px 12px', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}>{formatCompact(coin.total_volume)}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                      {coin.sparkline_in_7d?.price && (
                        <SparklineChart data={coin.sparkline_in_7d.price} positive={(coin.price_change_percentage_24h ?? 0) >= 0} />
                      )}
                    </td>
=======
            <button onClick={() => navigate('/markets')} style={{ fontSize: '10px', fontWeight: 600, color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: font.family }}>
              View all →
            </button>
          </div>
          {isLoading ? (
            <SkeletonShimmer height="200px" />
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.family }}>
                <thead>
                  <tr>
                    {['#', 'Asset', 'Price', '24h', '7d', 'Market Cap', 'Volume', ''].map(h => (
                      <th key={h} style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', textAlign: h === 'Asset' ? 'left' : 'right', padding: '8px 12px', borderBottom: `1px solid ${colors.borderFaint}` }}>
                        {h}
                      </th>
                    ))}
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
                  </tr>
                </thead>
                <tbody>
                  {rawAssets.slice(0, 10).map((coin, i) => (
                    <tr key={coin.id} onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)} style={{ cursor: 'pointer' }}>
                      <td style={{ padding: '8px 12px', fontSize: '10px', color: colors.textMuted, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={coin.image} alt={coin.name} width={24} height={24} style={{ borderRadius: '50%' }} />
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary }}>{coin.name}</div>
                            <div style={{ fontSize: '10px', color: colors.textMuted }}>{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textPrimary }}>{formatPrice(coin.current_price)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}><ChangeBadge value={coin.price_change_percentage_24h} /></td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}><ChangeBadge value={coin.price_change_percentage_7d_in_currency} /></td>
                      <td style={{ padding: '8px 12px', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}>{formatCompact(coin.market_cap)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}>{formatCompact(coin.total_volume)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        {coin.sparkline_in_7d?.price && (
                          <SparklineChart data={coin.sparkline_in_7d.price} positive={(coin.price_change_percentage_24h ?? 0) >= 0} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

<<<<<<< HEAD
const MoverRow = memo(function MoverRow({ coin, onClick }: { coin: { symbol: string; name: string; image: string; current_price: number; price_change_percentage_24h: number; sparkline_in_7d: { price: number[] } | null }; onClick: () => void }) {
=======
const MoverRow = memo(function MoverRow({
  coin, onClick,
}: {
  coin: RawCoinGeckoAsset;
  onClick: () => void;
}) {
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
<<<<<<< HEAD
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: radii.badge,
        cursor: 'pointer',
=======
        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
        borderRadius: radii.badge, cursor: 'pointer',
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
        background: hovered ? colors.bgHover : 'transparent',
        transition: 'background 80ms',
      }}
    >
      <img src={coin.image} alt={coin.name} width={20} height={20} style={{ borderRadius: '50%' }} />
      <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family, flex: 1 }}>{coin.symbol.toUpperCase()}</span>
      <span style={{ fontSize: '10px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(coin.current_price)}</span>
      <ChangeBadge value={coin.price_change_percentage_24h} />
      {coin.sparkline_in_7d?.price && (
        <SparklineChart data={coin.sparkline_in_7d.price.slice(-24)} width={40} height={16} positive={coin.price_change_percentage_24h >= 0} />
      )}
    </div>
  );
});

export default memo(Dashboard);
