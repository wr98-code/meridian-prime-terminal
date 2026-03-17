/**
 * CryptoContext.tsx — MERIDIAN PRIME
 * Real data only. No MOCK_ASSETS fallback.
 * isError exposed agar UI bisa render proper error state.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarkets, fetchGlobal, fetchFearGreed } from '@/services/api';
import type { CryptoAsset, GlobalData, FearGreedData, Regime } from '@/types/crypto';

interface CryptoContextValue {
  assets:    CryptoAsset[];
  global:    GlobalData | null;
  fearGreed: FearGreedData | null;
  regime:    Regime;
  isLoading: boolean;
  isError:   boolean;
}

const CryptoCtx = createContext<CryptoContextValue>({
  assets:    [],
  global:    null,
  fearGreed: null,
  regime:    'CRAB',
  isLoading: true,
  isError:   false,
});

function detectRegime(assets: CryptoAsset[]): Regime {
  const top10 = assets.slice(0, 10);
  if (top10.length === 0) return 'CRAB';
  const changes = top10.map(a => (a as unknown as { price_change_percentage_24h?: number }).price_change_percentage_24h ?? 0);
  const avg = changes.reduce((s, c) => s + c, 0) / changes.length;
  const positiveRatio = changes.filter(c => c > 0).length / changes.length;
  const negativeRatio = changes.filter(c => c < 0).length / changes.length;
  if (avg > 5 && positiveRatio > 0.8) return 'SURGE';
  if (avg > 1 && positiveRatio > 0.6) return 'BULL';
  if (avg < -1 && negativeRatio > 0.6) return 'BEAR';
  return 'CRAB';
}

export function CryptoProvider({ children }: { children: ReactNode }) {
  const marketsQuery = useQuery({
    queryKey: ['markets'],
    queryFn:  ({ signal }) => fetchMarkets(signal),
    staleTime: 30_000,
    gcTime:    300_000,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
  });

  const globalQuery = useQuery({
    queryKey: ['global'],
    queryFn:  ({ signal }) => fetchGlobal(signal),
    staleTime: 30_000,
    gcTime:    300_000,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
  });

  const fgQuery = useQuery({
    queryKey: ['fearGreed'],
    queryFn:  ({ signal }) => fetchFearGreed(signal),
    staleTime: 60_000,
    gcTime:    300_000,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
  });

  // Real data only — empty array while loading/error, tidak ada fake fallback
  const assets = marketsQuery.data ?? [];
  const regime = useMemo(() => detectRegime(assets), [assets]);

  const value = useMemo<CryptoContextValue>(() => ({
    assets,
    global:    globalQuery.data  ?? null,
    fearGreed: fgQuery.data      ?? null,
    regime,
    isLoading: marketsQuery.isLoading,
    isError:   marketsQuery.isError,
  }), [assets, globalQuery.data, fgQuery.data, regime, marketsQuery.isLoading, marketsQuery.isError]);

  return <CryptoCtx.Provider value={value}>{children}</CryptoCtx.Provider>;
}

export function useCrypto(): CryptoContextValue {
  return useContext(CryptoCtx);
}


// Compatibility stub for hooks migrated from old architecture
// useCryptoDispatch is a no-op in the React Query architecture
export function useCryptoDispatch(): (action: unknown) => void {
  return () => {};
}
