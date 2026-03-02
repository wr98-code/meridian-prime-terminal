import { memo, type ReactNode } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, font } from '@/styles/tokens';
import AppSidebar from './AppSidebar';
import AppTopbar from './AppTopbar';
import MobileBottomNav from './MobileBottomNav';

const AppLayout = memo(function AppLayout({ children }: { children: ReactNode }) {
  const { isMobile, isTablet } = useBreakpoint();
  const collapsed = isTablet;
  const sidebarWidth = isMobile ? 0 : collapsed ? 56 : 220;

  return (
    <div style={{ fontFamily: font.family, background: colors.bgPage, minHeight: '100vh', color: colors.textPrimary }}>
      {!isMobile && <AppSidebar collapsed={collapsed} />}
      <div style={{ marginLeft: sidebarWidth, transition: 'margin-left 200ms', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppTopbar showMenuButton={isMobile} />
        <main style={{ flex: 1, padding: isMobile ? '16px' : '20px 24px', paddingBottom: isMobile ? '80px' : '20px', maxWidth: 1600, width: '100%' }}>
          {children}
        </main>
      </div>
      {isMobile && <MobileBottomNav />}
    </div>
  );
});
AppLayout.displayName = 'AppLayout';
export default AppLayout;
