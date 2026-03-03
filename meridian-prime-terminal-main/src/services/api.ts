/**
 * api.ts — MERIDIAN PRIME
 * Real CoinGecko + Alternative.me endpoints.
 * NO Math.random(), NO MOCK_ASSETS fallback.
 * Error handling hanya throw — biar React Query tangkap properly.
 */

import type { CryptoAsset, GlobalData, FearGreedData } from '@/types/crypto';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchMarkets(signal?: AbortSignal): Promise<CryptoAsset[]> {
  const res = await fetch(
    `${COINGECKO_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&sparkline=true&price_change_percentage=7d`,
    { signal }
  );
  if (!res.ok) throw new Error(`Markets API error: ${res.status}`);
  return res.json();
}

export async function fetchGlobal(signal?: AbortSignal): Promise<GlobalData> {
  const res = await fetch(`${COINGECKO_BASE}/global`, { signal });
  if (!res.ok) throw new Error(`Global API error: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function fetchFearGreed(signal?: AbortSignal): Promise<FearGreedData> {
  const res = await fetch('https://api.alternative.me/fng/?limit=1', { signal });
  if (!res.ok) throw new Error(`Fear & Greed API error: ${res.status}`);
  const json = await res.json();
  return json.data[0];
}
