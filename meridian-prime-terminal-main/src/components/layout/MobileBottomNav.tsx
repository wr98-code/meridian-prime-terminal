import { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { colors, font } from '@/styles/tokens';
import { LayoutDashboard, BarChart3, LineChart, Bell, PieChart } from 'lucide-react';

const items = [
  { label: 'Dashboard', path: '/',         icon: LayoutDashboard },
  { label: 'Markets',   path: '/markets',  icon: BarChart3 },
  { label: 'Charts',    path: '/charts',   icon: LineChart },
  { label: 'Alerts',    path: '/alerts',   icon: Bell },
  { label: 'Portfolio', path: '/portfolio',icon: PieChart },
];

const MobileBottomNav = memo(function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: colors.bgPage, borderTop: '1px solid ' + colors.borderFaint, display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 50, fontFamily: font.family }} aria-label="Mobile navigation">
      {items.map(item => {
        const active = location.pathname === item.path || (item.path === '/' && location.pathname === '/dashboard');
        const Icon = item.icon;
        return (
          <button key={item.path} onClick={() => navigate(item.path)} aria-label={item.label} aria-current={active ? 'page' : undefined}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '8px 12px', minWidth: 44, minHeight: 44, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon size={20} style={{ color: active ? colors.accent : colors.textMuted, transition: 'color 150ms' }} />
            <span style={{ fontSize: 9, fontWeight: active ? 600 : 500, color: active ? colors.accent : colors.textMuted, fontFamily: font.family }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
});
MobileBottomNav.displayName = 'MobileBottomNav';
export default MobileBottomNav;
