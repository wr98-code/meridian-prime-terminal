import { memo, useState, type CSSProperties } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors, font } from '@/styles/tokens';
import {
  LayoutDashboard, BarChart3, LineChart, BookOpen, TrendingUp,
  Bell, Star, Brain, Newspaper, Activity, Link2, Layers,
  PieChart, FileText, Settings, Shield, Wallet, Network,
  Coins, RefreshCw, BarChart2, Eye, Flame, DollarSign,
} from 'lucide-react';

interface NavItem { label: string; path: string; icon: React.ElementType; badge?: string; }
interface NavSection { title: string; items: NavItem[]; }

const NAV: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard',    path: '/',            icon: LayoutDashboard },
      { label: 'Markets',      path: '/markets',     icon: BarChart3 },
    ],
  },
  {
    title: 'TRADING',
    items: [
      { label: 'Charts',       path: '/charts',      icon: LineChart },
      { label: 'Order Book',   path: '/orderbook',   icon: BookOpen },
      { label: 'Derivatives',  path: '/derivatives', icon: TrendingUp },
      { label: 'Converter',    path: '/converter',   icon: RefreshCw },
      { label: 'Alerts',       path: '/alerts',      icon: Bell },
      { label: 'Watchlist',    path: '/watchlist',   icon: Star },
    ],
  },
  {
    title: 'INTELLIGENCE',
    items: [
      { label: 'AI Signals',   path: '/aisignals',   icon: Brain },
      { label: 'Intelligence', path: '/intelligence',icon: Eye },
      { label: 'Sentiment',    path: '/sentiment',   icon: Activity },
      { label: 'Smart Money',  path: '/smartmoney',  icon: Wallet },
      { label: 'Security',     path: '/security',    icon: Shield },
      { label: 'News',         path: '/news',        icon: Newspaper },
    ],
  },
  {
    title: 'ON-CHAIN',
    items: [
      { label: 'On-Chain',     path: '/onchain',     icon: Link2, badge: 'LIVE' },
      { label: 'Networks',     path: '/networks',    icon: Network },
      { label: 'Tokens',       path: '/tokens',      icon: Coins },
      { label: 'DeFi',         path: '/defi',        icon: Layers },
      { label: 'Stablecoins',  path: '/stablecoins', icon: DollarSign },
      { label: 'Staking',      path: '/staking',     icon: Flame },
    ],
  },
  {
    title: 'PORTFOLIO',
    items: [
      { label: 'Portfolio',    path: '/portfolio',   icon: PieChart },
      { label: 'Fundamentals', path: '/fundamentals',icon: FileText },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Settings',     path: '/settings',    icon: Settings },
    ],
  },
];

const AppSidebar = memo(function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={{ width: collapsed ? 56 : 220, minWidth: collapsed ? 56 : 220, height: '100vh', position: 'fixed', top: 0, left: 0, background: colors.bgCard, borderRight: '1px solid ' + colors.borderFaint, display: 'flex', flexDirection: 'column', overflowY: 'auto', overflowX: 'hidden', transition: 'width 200ms, min-width 200ms', zIndex: 50, fontFamily: font.family }} aria-label="Main navigation">
      {/* Logo */}
      <div style={{ padding: collapsed ? '16px 8px' : '16px 20px', borderBottom: '1px solid ' + colors.borderFaint, display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', minHeight: 52 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.accent, boxShadow: '0 0 8px ' + colors.accent, flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary, letterSpacing: '0.12em' }}>MERIDIAN PRIME</span>}
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '8px 0', flex: 1 }}>
        {NAV.map(section => (
          <div key={section.title} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <div style={{ fontSize: 9, fontWeight: 600, color: colors.textFaint, letterSpacing: '0.12em', padding: '8px 20px 4px', textTransform: 'uppercase' }}>
                {section.title}
              </div>
            )}
            {section.items.map(item => (
              <SidebarItem key={item.path} item={item}
                active={location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard')}
                collapsed={collapsed}
                onClick={() => navigate(item.path)} />
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
});

function SidebarItem({ item, active, collapsed, onClick }: { item: NavItem; active: boolean; collapsed: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      aria-label={item.label} aria-current={active ? 'page' : undefined}
      style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38, width: '100%', padding: '0 16px', justifyContent: collapsed ? 'center' : 'flex-start', cursor: 'pointer', transition: 'all 150ms', background: active ? colors.accentDim : hovered ? 'rgba(15,40,100,0.04)' : 'transparent', borderLeft: '2px solid ' + (active ? colors.accent : 'transparent'), border: 'none', transform: hovered && !active ? 'translateX(2px)' : 'none' }}>
      <Icon size={15} style={{ color: active ? colors.accent : hovered ? colors.accent : colors.textMuted, flexShrink: 0, transition: 'color 150ms' }} />
      {!collapsed && <span style={{ fontSize: 11, fontWeight: active ? 600 : 500, color: active ? colors.accent : colors.textSecondary, fontFamily: font.family, whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>}
      {!collapsed && item.badge && (
        <span style={{ fontSize: 8, fontWeight: 700, color: colors.bull, background: colors.bullDim, padding: '1px 5px', borderRadius: '4px', letterSpacing: '0.08em', fontFamily: font.family }}>{item.badge}</span>
      )}
    </button>
  );
}

AppSidebar.displayName = 'AppSidebar';
export default AppSidebar;
