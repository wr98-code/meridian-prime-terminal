<<<<<<< HEAD
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMarkets, fetchGlobal, fetchFearGreed, MOCK_ASSETS } from '@/services/api';
import type { CryptoAsset, GlobalData, FearGreedData, Regime } from '@/types/crypto';

interface CryptoContextValue {
  assets: CryptoAsset[];
  global: GlobalData | null;
  fearGreed: FearGreedData | null;
  regime: Regime;
  isLoading: boolean;
}

const CryptoCtx = createContext<CryptoContextValue>({
  assets: [],
  global: null,
  fearGreed: null,
  regime: 'CRAB',
  isLoading: true,
=======
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
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
});

function detectRegime(assets: CryptoAsset[]): Regime {
  const top10 = assets.slice(0, 10);
  if (top10.length === 0) return 'CRAB';
<<<<<<< HEAD
  const changes = top10.map(a => a.price_change_percentage_24h ?? 0);
=======
  const changes = top10.map(a => (a as unknown as { price_change_percentage_24h?: number }).price_change_percentage_24h ?? 0);
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
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
<<<<<<< HEAD
    queryFn: ({ signal }) => fetchMarkets(signal),
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
=======
    queryFn:  ({ signal }) => fetchMarkets(signal),
    staleTime: 30_000,
    gcTime:    300_000,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  });

  const globalQuery = useQuery({
    queryKey: ['global'],
<<<<<<< HEAD
    queryFn: ({ signal }) => fetchGlobal(signal),
    staleTime: 30000,
    gcTime: 300000,
    retry: 1,
=======
    queryFn:  ({ signal }) => fetchGlobal(signal),
    staleTime: 30_000,
    gcTime:    300_000,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  });

  const fgQuery = useQuery({
    queryKey: ['fearGreed'],
<<<<<<< HEAD
    queryFn: ({ signal }) => fetchFearGreed(signal),
    staleTime: 60000,
    gcTime: 300000,
    retry: 1,
  });

  const assets = marketsQuery.data ?? MOCK_ASSETS;
=======
    queryFn:  ({ signal }) => fetchFearGreed(signal),
    staleTime: 60_000,
    gcTime:    300_000,
    retry: 2,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30_000),
  });

  // Real data only — empty array while loading/error, tidak ada fake fallback
  const assets = marketsQuery.data ?? [];
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)
  const regime = useMemo(() => detectRegime(assets), [assets]);

  const value = useMemo<CryptoContextValue>(() => ({
    assets,
<<<<<<< HEAD
    global: globalQuery.data ?? null,
    fearGreed: fgQuery.data ?? null,
    regime,
    isLoading: marketsQuery.isLoading,
  }), [assets, globalQuery.data, fgQuery.data, regime, marketsQuery.isLoading]);
=======
    global:    globalQuery.data  ?? null,
    fearGreed: fgQuery.data      ?? null,
    regime,
    isLoading: marketsQuery.isLoading,
    isError:   marketsQuery.isError,
  }), [assets, globalQuery.data, fgQuery.data, regime, marketsQuery.isLoading, marketsQuery.isError]);
>>>>>>> 68ffe37 (fix: real data only, no mock/fake fallback)

  return <CryptoCtx.Provider value={value}>{children}</CryptoCtx.Provider>;
}

export function useCrypto(): CryptoContextValue {
  return useContext(CryptoCtx);
}
