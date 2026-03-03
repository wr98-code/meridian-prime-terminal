import { memo, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCrypto } from '@/context/CryptoContext';
import GlassCard from '@/components/shared/GlassCard';
import ChangeBadge from '@/components/shared/ChangeBadge';
import { colors, font, radii, shadows } from '@/styles/tokens';
import { formatPrice } from '@/utils/formatters';
import { useResponsive } from '@/hooks/useResponsive';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'] as const;

function Charts() {
  const [searchParams] = useSearchParams();
  const symbolParam = searchParams.get('symbol') ?? 'BTC';
  const [symbol, setSymbol] = useState(symbolParam.toUpperCase());
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [pairListOpen, setPairListOpen] = useState(true);
  const [pairSearch, setPairSearch] = useState('');
  const { assets } = useCrypto();
  const { isMobile } = useResponsive();
  const chartRef = useRef<HTMLDivElement>(null);

  const selectedAsset = useMemo(
    () => assets.find(a => a.symbol.toUpperCase() === symbol) ?? assets[0],
    [assets, symbol]
  );

  const filteredPairs = useMemo(() => {
    if (!pairSearch) return assets;
    const q = pairSearch.toLowerCase();
    return assets.filter(a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q));
  }, [assets, pairSearch]);

  // TradingView Widget
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'tradingview_chart';
    container.style.width = '100%';
    container.style.height = '100%';
    chartRef.current.appendChild(container);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      const win = window as unknown as Record<string, unknown>;
      if (win.TradingView) {
        const TV = win.TradingView as { widget: new (config: Record<string, unknown>) => unknown };
        new TV.widget({
          container_id: 'tradingview_chart',
          symbol: `BINANCE:${symbol}USDT`,
          interval: activeTimeframe === '1D' ? 'D' : activeTimeframe === '1W' ? 'W' : activeTimeframe.replace('H', '60').replace('m', ''),
          theme: 'light',
          style: '1',
          locale: 'en',
          autosize: true,
          allow_symbol_change: false,
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          studies: ['RSI@tv-basicstudies'],
          overrides: {
            'paneProperties.background': 'rgba(255,255,255,1)',
            'paneProperties.backgroundType': 'solid',
            'scalesProperties.textColor': 'rgba(60,70,110,1)',
            'mainSeriesProperties.candleStyle.upColor': 'rgba(0,155,95,1)',
            'mainSeriesProperties.candleStyle.downColor': 'rgba(210,38,75,1)',
            'mainSeriesProperties.candleStyle.wickUpColor': 'rgba(0,155,95,1)',
            'mainSeriesProperties.candleStyle.wickDownColor': 'rgba(210,38,75,1)',
          },
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [symbol, activeTimeframe]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', gap: '0', height: 'calc(100vh - 92px)' }}
    >
      {/* Pair List */}
      {!isMobile && pairListOpen && (
        <div style={{
          width: '260px',
          minWidth: '260px',
          borderRight: `1px solid ${colors.borderFaint}`,
          display: 'flex',
          flexDirection: 'column',
          background: colors.bgCard,
          borderRadius: `${radii.card} 0 0 ${radii.card}`,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '12px',
            borderBottom: `1px solid ${colors.borderFaint}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Search size={14} style={{ color: colors.textMuted }} />
            <input
              value={pairSearch}
              onChange={e => setPairSearch(e.target.value)}
              placeholder="Search pairs..."
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: font.family, fontSize: '10px', color: colors.textPrimary, width: '100%',
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredPairs.map(coin => {
              const active = coin.symbol.toUpperCase() === symbol;
              return (
                <button
                  key={coin.id}
                  onClick={() => setSymbol(coin.symbol.toUpperCase())}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: active ? colors.accentDim : 'transparent',
                    borderLeft: active ? `2px solid ${colors.accent}` : '2px solid transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: font.family,
                    transition: 'background 100ms',
                  }}
                >
                  <img src={coin.image} alt={coin.name} width={20} height={20} style={{ borderRadius: '50%' }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textPrimary }}>{coin.symbol.toUpperCase()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(coin.current_price)}</div>
                    <ChangeBadge value={coin.price_change_percentage_24h} size="sm" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Chart Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: `1px solid ${colors.borderFaint}`,
          background: colors.bgPage,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isMobile && (
              <button
                onClick={() => setPairListOpen(!pairListOpen)}
                aria-label="Toggle pair list"
                style={{ padding: '4px', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                {pairListOpen ? <ChevronLeft size={16} style={{ color: colors.textMuted }} /> : <ChevronRight size={16} style={{ color: colors.textMuted }} />}
              </button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedAsset && <img src={selectedAsset.image} alt={selectedAsset.name} width={24} height={24} style={{ borderRadius: '50%' }} />}
              <span style={{ fontSize: '13px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family }}>{symbol}/USDT</span>
              {selectedAsset && (
                <>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>
                    {formatPrice(selectedAsset.current_price)}
                  </span>
                  <ChangeBadge value={selectedAsset.price_change_percentage_24h} size="md" />
                </>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                style={{
                  padding: '4px 8px',
                  fontSize: '9px',
                  fontWeight: 600,
                  fontFamily: font.family,
                  background: activeTimeframe === tf ? colors.accentDim : 'transparent',
                  color: activeTimeframe === tf ? colors.accent : colors.textMuted,
                  borderBottom: activeTimeframe === tf ? `2px solid ${colors.accent}` : '2px solid transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* TradingView Chart */}
        <div ref={chartRef} style={{ flex: 1, minHeight: '400px', background: colors.bgPage }} />
      </div>
    </motion.div>
  );
}

export default memo(Charts);
