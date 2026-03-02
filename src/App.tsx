import { memo, lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CryptoProvider } from '@/context/CryptoContext';
import { PWAInstallProvider } from '@/context/PWAInstallContext';
import AppLayout from '@/components/layout/AppLayout';
import SkeletonShimmer from '@/components/shared/SkeletonShimmer';
import OfflineIndicator from '@/components/shared/OfflineIndicator';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import {
  BookOpen, BarChart2, Bell, Star, Brain, Newspaper, Activity,
  Link2, Layers, PieChart, FileText, Settings, DollarSign, Gem,
  Coins, Landmark, Map, Bitcoin, Vote, Timer, Wrench, Bot,
} from 'lucide-react';

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const Dashboard    = lazy(() => import('./pages/Dashboard'));
const Markets      = lazy(() => import('./pages/Markets'));
const Charts       = lazy(() => import('./pages/Charts'));
const OrderBook    = lazy(() => import('./pages/OrderBook'));
const Derivatives  = lazy(() => import('./pages/Derivatives'));
const Alerts       = lazy(() => import('./pages/Alerts'));
const Watchlist    = lazy(() => import('./pages/Watchlist'));
const Converter    = lazy(() => import('./pages/Converter'));
const Defi         = lazy(() => import('./pages/Defi'));
const OnChain      = lazy(() => import('./pages/OnChain'));
const Intelligence = lazy(() => import('./pages/Intelligence'));
const Fundamentals = lazy(() => import('./pages/Fundamentals'));
const Portfolio    = lazy(() => import('./pages/Portfolio'));
const Networks     = lazy(() => import('./pages/Networks'));
const Tokens       = lazy(() => import('./pages/Tokens'));
const Security     = lazy(() => import('./pages/Security'));
const SmartMoney   = lazy(() => import('./pages/SmartMoney'));
const Sentiment    = lazy(() => import('./pages/Sentiment'));
const AISignals    = lazy(() => import('./pages/AISignals'));
const Settings     = lazy(() => import('./pages/Settings'));
const NotFound     = lazy(() => import('./pages/NotFound'));
const PageStub     = lazy(() => import('./components/shared/PageStub'));
const Bridges      = lazy(() => import('./pages/Bridges'));
const Lending      = lazy(() => import('./pages/Lending'));
const Staking      = lazy(() => import('./pages/Staking'));
const Stablecoins  = lazy(() => import('./pages/Stablecoins'));
const Governance   = lazy(() => import('./pages/Governance'));
const NFT          = lazy(() => import('./pages/NFT'));
const Ordinals     = lazy(() => import('./pages/Ordinals'));
const Ecosystem    = lazy(() => import('./pages/Ecosystem'));
const Productivity = lazy(() => import('./pages/Productivity'));
const DevTools     = lazy(() => import('./pages/DevTools'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false, refetchOnReconnect: true },
  },
});

function PageLoader() {
  return (
    <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <SkeletonShimmer width="200px" height="20px" />
      <SkeletonShimmer width="100%" height="200px" borderRadius="12px" />
      <SkeletonShimmer width="100%" height="120px" borderRadius="12px" />
    </div>
  );
}

const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CryptoProvider>
        <PWAInstallProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <ErrorBoundary tileLabel="App">
              <AppLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Core */}
                    <Route path="/"            element={<Dashboard />} />
                    <Route path="/dashboard"   element={<Dashboard />} />
                    <Route path="/markets"     element={<Markets />} />
                    <Route path="/charts"      element={<Charts />} />

                    {/* Trading */}
                    <Route path="/orderbook"   element={<OrderBook />} />
                    <Route path="/derivatives" element={<Derivatives />} />
                    <Route path="/converter"   element={<Converter />} />
                    <Route path="/alerts"      element={<Alerts />} />
                    <Route path="/watchlist"   element={<Watchlist />} />

                    {/* Intelligence */}
                    <Route path="/aisignals"   element={<AISignals />} />
                    <Route path="/intelligence"element={<Intelligence />} />
                    <Route path="/sentiment"   element={<Sentiment />} />
                    <Route path="/smartmoney"  element={<SmartMoney />} />
                    <Route path="/security"    element={<Security />} />
                    <Route path="/news"        element={<PageStub title="Crypto News" description="Aggregated news from CryptoCompare, CoinDesk, and more" icon={Newspaper} />} />
                    <Route path="/ai-research" element={<PageStub title="AI Research" description="AI-generated market reports, macro analysis, narrative tracking" icon={Bot} />} />

                    {/* On-Chain */}
                    <Route path="/onchain"     element={<OnChain />} />
                    <Route path="/networks"    element={<Networks />} />
                    <Route path="/tokens"      element={<Tokens />} />
                    <Route path="/defi"        element={<Defi />} />
                    <Route path="/bridges"     element={<Bridges />} />
                    <Route path="/lending"     element={<Lending />} />
                    <Route path="/staking"     element={<Staking />} />
                    <Route path="/stablecoins" element={<Stablecoins />} />
                    <Route path="/ecosystem"   element={<Ecosystem />} />
                    <Route path="/nft"         element={<NFT />} />
                    <Route path="/ordinals"    element={<Ordinals />} />
                    <Route path="/governance"  element={<Governance />} />

                    {/* Portfolio */}
                    <Route path="/portfolio"   element={<Portfolio />} />
                    <Route path="/fundamentals"element={<Fundamentals />} />

                    {/* System */}
                    <Route path="/settings"    element={<Settings />} />
                    <Route path="/productivity"element={<Productivity />} />
                    <Route path="/devtools"    element={<DevTools />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </AppLayout>
            </ErrorBoundary>
          </BrowserRouter>
        </PWAInstallProvider>
      </CryptoProvider>
    </TooltipProvider>
  </QueryClientProvider>
));
App.displayName = 'App';
export default App;
