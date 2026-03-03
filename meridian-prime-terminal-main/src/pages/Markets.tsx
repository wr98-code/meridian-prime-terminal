import { memo, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCrypto } from '@/context/CryptoContext';
import GlassCard from '@/components/shared/GlassCard';
import ChangeBadge from '@/components/shared/ChangeBadge';
import SparklineChart from '@/components/shared/SparklineChart';
import SkeletonShimmer from '@/components/shared/SkeletonShimmer';
import { colors, font, radii, shadows } from '@/styles/tokens';
import { formatPrice, formatCompact } from '@/utils/formatters';
import { Search } from 'lucide-react';

const FILTERS = ['All', 'DeFi', 'L1', 'L2', 'Stable'] as const;

function Markets() {
  const { assets, isLoading } = useCrypto();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = assets;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
    }
    return result;
  }, [assets, search]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '2px', height: '20px', background: 'rgba(15,40,180,0.6)', borderRadius: '1px' }} />
          <h1 style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, margin: 0 }}>Markets</h1>
          <span style={{ fontSize: '10px', color: colors.textMuted, fontFamily: font.family }}>{filtered.length} assets</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 12px',
            height: '32px',
            background: colors.bgHover,
            border: `1px solid ${colors.borderFaint}`,
            borderRadius: radii.button,
          }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assets..."
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: font.family,
                fontSize: '10px',
                color: colors.textPrimary,
                width: '160px',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: 600,
                  fontFamily: font.family,
                  background: activeFilter === f ? colors.accentDim : 'transparent',
                  color: activeFilter === f ? colors.accent : colors.textMuted,
                  border: `1px solid ${activeFilter === f ? colors.borderAccent : 'transparent'}`,
                  borderRadius: radii.badge,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: font.family }}>
            <thead>
              <tr style={{ height: '32px' }}>
                {['#', 'Asset', 'Price', '24h', '7d', 'Market Cap', 'Volume', 'Chart'].map(h => (
                  <th key={h} style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    color: colors.textMuted,
                    textTransform: 'uppercase',
                    textAlign: h === 'Asset' ? 'left' : 'right',
                    padding: '8px 16px',
                    borderBottom: `1px solid ${colors.borderFaint}`,
                    position: 'sticky',
                    top: 0,
                    background: colors.bgCard,
                    whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} style={{ height: '44px' }}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} style={{ padding: '8px 16px' }}>
                        <SkeletonShimmer width={j === 1 ? '120px' : '60px'} height="14px" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                filtered.map((coin, i) => {
                  const isHovered = hoveredRow === coin.id;
                  return (
                    <tr
                      key={coin.id}
                      onClick={() => navigate(`/charts?symbol=${coin.symbol.toUpperCase()}`)}
                      onMouseEnter={() => setHoveredRow(coin.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        height: '44px',
                        cursor: 'pointer',
                        background: isHovered ? colors.bgHover : 'transparent',
                        transition: 'background 80ms',
                        borderLeft: isHovered ? `2px solid ${colors.accent}` : '2px solid transparent',
                      }}
                    >
                      <td style={{ padding: '8px 16px', fontSize: '10px', color: colors.textMuted, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{coin.market_cap_rank || i + 1}</td>
                      <td style={{ padding: '8px 16px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={coin.image} alt={coin.name} width={24} height={24} style={{ borderRadius: '50%' }} loading="lazy" />
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary }}>{coin.name}</div>
                            <div style={{ fontSize: '10px', color: colors.textMuted }}>{coin.symbol.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '8px 16px', fontSize: '11px', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textPrimary }}>
                        {formatPrice(coin.current_price)}
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        <ChangeBadge value={coin.price_change_percentage_24h} />
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        <ChangeBadge value={coin.price_change_percentage_7d_in_currency} />
                      </td>
                      <td style={{ padding: '8px 16px', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}>
                        {formatCompact(coin.market_cap)}
                      </td>
                      <td style={{ padding: '8px 16px', fontSize: '10px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: colors.textSecondary }}>
                        {formatCompact(coin.total_volume)}
                      </td>
                      <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                        {coin.sparkline_in_7d?.price && (
                          <SparklineChart data={coin.sparkline_in_7d.price} positive={(coin.price_change_percentage_24h ?? 0) >= 0} />
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default memo(Markets);
