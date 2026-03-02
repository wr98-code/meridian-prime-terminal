import { memo, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCrypto } from '@/context/CryptoContext';
import GlassCard from '@/components/shared/GlassCard';
import ChangeBadge from '@/components/shared/ChangeBadge';
import SparklineChart from '@/components/shared/SparklineChart';
import FearGreedGauge from '@/components/shared/FearGreedGauge';
import SkeletonShimmer from '@/components/shared/SkeletonShimmer';
import { colors, font, radii } from '@/styles/tokens';
import { formatPrice, formatCompact, formatDelta } from '@/utils/formatters';
import type { Regime } from '@/types/crypto';
import { RefreshCw, TrendingUp, TrendingDown, Newspaper } from 'lucide-react';

const regimeLabels: Record<Regime, { icon: string; label: string; desc: string; color: string }> = {
  SURGE: { icon: '🔥', label: 'SURGE MODE', desc: 'Extreme bullish momentum across major assets', color: colors.warn },
  BULL: { icon: '↑', label: 'BULL MARKET', desc: 'Broad market strength with positive momentum', color: colors.bull },
  CRAB: { icon: '⇌', label: 'CRAB MARKET', desc: 'Mixed signals — range-bound price action', color: colors.warn },
  BEAR: { icon: '↓', label: 'BEAR MARKET', desc: 'Risk-off sentiment with declining prices', color: colors.bear },
};

function Dashboard() {
  const { assets, global, fearGreed, regime, isLoading } = useCrypto();
  const navigate = useNavigate();
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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
  );

  const metrics = [
    { label: 'MARKET CAP', value: formatCompact(totalMcap), change: 1.8 },
    { label: '24H VOLUME', value: formatCompact(totalVol), change: -2.3 },
    { label: 'BTC DOMINANCE', value: `${btcDom.toFixed(1)}%`, change: 0.3 },
    { label: 'ETH DOMINANCE', value: `${ethDom.toFixed(1)}%`, change: -0.1 },
    { label: 'FEAR & GREED', value: String(fgValue), change: null },
  ];

  const rl = regimeLabels[regime];

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.04 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

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
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.bull, animation: 'pulse 2s infinite' }} />
          <button aria-label="Refresh" style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}>
            <RefreshCw size={14} style={{ color: colors.textMuted }} />
          </button>
        </div>
      </motion.div>

      {/* Metrics Strip */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {metrics.map((m, i) => (
          <GlassCard key={m.label}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: font.family, marginBottom: '6px' }}>
              {m.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>
                {m.value}
              </span>
              {m.change !== null && <ChangeBadge value={m.change} />}
            </div>
          </GlassCard>
        ))}
      </motion.div>

      {/* Regime Banner */}
      <motion.div variants={fadeUp} style={{
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
          {/* Price Chart Card */}
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
              </div>
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
              <FearGreedGauge value={fgValue} label={fgLabel} />
            </GlassCard>
          </motion.div>

          <motion.div variants={fadeUp}>
            <GlassCard>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, fontFamily: font.family }}>Latest News</span>
              </div>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

const MoverRow = memo(function MoverRow({ coin, onClick }: { coin: { symbol: string; name: string; image: string; current_price: number; price_change_percentage_24h: number; sparkline_in_7d: { price: number[] } | null }; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 8px',
        borderRadius: radii.badge,
        cursor: 'pointer',
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
