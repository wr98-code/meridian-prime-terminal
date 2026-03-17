import { memo, useState, useEffect, useMemo, type CSSProperties } from 'react';
import { colors, font, shadows, radii } from '@/styles/tokens';
import { useCrypto } from '@/context/CryptoContext';
import { formatPrice, formatCompact } from '@/utils/formatters';
import type { Regime } from '@/types/crypto';
import { Search, Bell, Settings, Menu, Download } from 'lucide-react';
import { usePWAInstall } from '@/context/PWAInstallContext';

interface TopbarProps { onMenuToggle?: () => void; showMenuButton?: boolean; }

const regimeConfig: Record<Regime, { label: string; emoji: string; bg: string; border: string; color: string; pulse: boolean }> = {
  SURGE: { label: 'SURGE', emoji: '🔥', bg: 'rgba(200,80,0,0.08)', border: 'rgba(195,125,0,0.35)', color: colors.warn, pulse: true },
  BULL:  { label: 'BULL',  emoji: '↑',  bg: colors.bullDim, border: colors.bullMid, color: colors.bull, pulse: false },
  CRAB:  { label: 'CRAB',  emoji: '⇌',  bg: colors.warnDim, border: colors.warnMid, color: colors.warn, pulse: false },
  BEAR:  { label: 'BEAR',  emoji: '↓',  bg: colors.bearDim, border: colors.bearMid, color: colors.bear, pulse: true },
};

const AppTopbar = memo(function AppTopbar({ onMenuToggle, showMenuButton }: TopbarProps) {
  const { assets, global, regime } = useCrypto();
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  const btc = useMemo(() => assets.find(a => a.symbol === 'btc'), [assets]);
  const eth = useMemo(() => assets.find(a => a.symbol === 'eth'), [assets]);
  const rc = regimeConfig[regime];
  const { canInstall, triggerInstall } = usePWAInstall();

  const barStyle: CSSProperties = { height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: scrolled ? 'rgba(255,255,255,0.94)' : colors.bgPage, backdropFilter: scrolled ? 'blur(20px)' : undefined, borderBottom: '1px solid ' + colors.borderFaint, fontFamily: font.family, position: 'sticky', top: 0, zIndex: 40, transition: 'background 200ms', gap: 16 };

  return (
    <header style={barStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden', flex: 1, minWidth: 0 }}>
        {showMenuButton && (
          <button onClick={onMenuToggle} aria-label="Toggle menu" style={{ padding: 8, cursor: 'pointer', background: 'none', border: 'none' }}>
            <Menu size={20} style={{ color: colors.textPrimary }} />
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, overflow: 'auto', whiteSpace: 'nowrap', flex: 1 }}>
          <StatItem label="BTC" value={btc ? formatPrice(btc.price) : '$—'} change={btc?.change24h} />
          <Div /><StatItem label="ETH" value={eth ? formatPrice(eth.price) : '$—'} change={eth?.change24h} />
          <Div /><StatItem label="MCAP" value={global?.totalMcap ? formatCompact(global.totalMcap) : '—'} />
          <Div /><StatItem label="VOL" value={global?.totalVolume ? formatCompact(global.totalVolume) : '—'} />
          <Div /><StatItem label="DOM" value={global?.btcDominance ? global.btcDominance.toFixed(1) + '%' : '—'} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ width: searchFocused ? 280 : 200, height: 32, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', background: colors.bgHover, border: '1px solid ' + (searchFocused ? colors.borderAccent : colors.borderFaint), borderRadius: radii.button, transition: 'width 250ms, border-color 200ms', boxShadow: searchFocused ? shadows.focusRing : 'none' }}>
          <Search size={14} style={{ color: colors.textMuted, flexShrink: 0 }} />
          <input placeholder="Search... ⌘K" onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: font.family, fontSize: 10, color: colors.textPrimary, width: '100%' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: rc.bg, border: '1px solid ' + rc.border, borderRadius: radii.badge, animation: rc.pulse ? 'pulse 2s infinite' : undefined }}>
          <span style={{ fontSize: 10 }}>{rc.emoji}</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: rc.color, letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: font.family }}>{rc.label}</span>
        </div>
        {canInstall && (
          <button onClick={triggerInstall} aria-label="Install App" title="Install App" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', cursor: 'pointer', background: colors.accentDim, border: '1px solid ' + colors.borderAccent, borderRadius: radii.badge, fontFamily: font.family }}>
            <Download size={12} style={{ color: colors.accent }} />
            <span style={{ fontSize: 9, fontWeight: 700, color: colors.accent, letterSpacing: '0.08em' }}>INSTALL</span>
          </button>
        )}
        <button aria-label="Notifications" style={{ padding: 6, cursor: 'pointer', background: 'none', border: 'none', borderRadius: radii.button }}><Bell size={16} style={{ color: colors.textMuted }} /></button>
        <button aria-label="Settings" style={{ padding: 6, cursor: 'pointer', background: 'none', border: 'none', borderRadius: radii.button }}><Settings size={16} style={{ color: colors.textMuted }} /></button>
      </div>
    </header>
  );
});

function StatItem({ label, value, change }: { label: string; value: string; change?: number | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 500, color: colors.textMuted, fontFamily: font.family }}>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: colors.textPrimary, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
      {change != null && isFinite(change) && (
        <span style={{ fontSize: 9, fontWeight: 600, color: change >= 0 ? colors.bull : colors.bear, fontFamily: font.family, fontVariantNumeric: 'tabular-nums' }}>
          {(change >= 0 ? '+' : '') + change.toFixed(2) + '%'}
        </span>
      )}
    </div>
  );
}
function Div() { return <div style={{ width: 1, height: 16, background: colors.borderFaint }} />; }
AppTopbar.displayName = 'AppTopbar';
export default AppTopbar;
