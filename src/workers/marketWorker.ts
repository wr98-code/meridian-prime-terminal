/**
 * marketWorker.ts — MERIDIAN PRIME
 * Web Worker: all heavy computation off main thread.
 * - detectRegime + computeSignal
 * - sort + filter 100+ assets
 * - price update merge
 * Zero JSX. Zero React. Zero imports from src/.
 */

interface CryptoAsset {
  id: string; symbol: string; name: string;
  price: number; change24h: number; change7d: number; change30d?: number;
  marketCap: number; volume24h: number;
  high24h?: number; low24h?: number;
  circulatingSupply: number; totalSupply?: number;
  ath?: number; athDate?: string;
  rank: number; image?: string; sparkline?: number[];
  lastUpdated?: string; priceDirection?: 'up' | 'down' | 'neutral';
}

interface PriceUpdate {
  price: number; change24h: number;
  high24h?: number; low24h?: number; volume24h?: number;
  direction?: 'up' | 'down' | 'neutral';
}

type Regime = 'SURGE' | 'BULL' | 'CRAB' | 'BEAR';
type AISignal = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';
type SortKey = 'rank' | 'name' | 'price' | 'change24h' | 'change7d' | 'marketCap' | 'volume24h';

type WorkerMsg =
  | { type: 'COMPUTE_MARKET'; assets: CryptoAsset[]; _id?: string }
  | { type: 'SORT_FILTER'; assets: CryptoAsset[]; sortKey: SortKey; sortDir: 'asc' | 'desc'; query: string; _id?: string }
  | { type: 'MERGE_PRICES'; assets: CryptoAsset[]; updates: Record<string, PriceUpdate>; _id?: string };

function detectRegime(assets: CryptoAsset[]): Regime {
  if (assets.length === 0) return 'CRAB';
  const top = assets.slice(0, 10);
  let totalWeight = 0, wSum = 0;
  for (let i = 0; i < top.length; i++) {
    const w = top[i].marketCap > 0 ? top[i].marketCap : 1;
    totalWeight += w; wSum += top[i].change24h * w;
  }
  const avg = totalWeight > 0 ? wSum / totalWeight : 0;
  const top20 = assets.slice(0, 20);
  let pos = 0;
  for (let i = 0; i < top20.length; i++) if (top20[i].change24h > 0) pos++;
  const breadth = top20.length > 0 ? pos / top20.length : 0.5;
  if (avg > 5 || (avg > 3 && breadth > 0.75)) return 'SURGE';
  if (avg > 1.5 && breadth > 0.55) return 'BULL';
  if (avg < -1.5 && breadth < 0.45) return 'BEAR';
  return 'CRAB';
}

function computeSignal(assets: CryptoAsset[]): AISignal {
  const top = assets.slice(0, 15);
  let score = 0, weight = 0;
  for (let i = 0; i < top.length; i++) {
    const a = top[i];
    const w = a.marketCap > 0 ? Math.log(a.marketCap) : 1;
    score += (a.change24h * 0.6 + (a.change7d ?? 0) * 0.4) * w;
    weight += w;
  }
  const n = weight > 0 ? score / weight : 0;
  if (n > 6) return 'STRONG_BUY';
  if (n > 2) return 'BUY';
  if (n < -6) return 'STRONG_SELL';
  if (n < -2) return 'SELL';
  return 'NEUTRAL';
}

function sortAssets(assets: CryptoAsset[], key: SortKey, dir: 'asc' | 'desc'): CryptoAsset[] {
  const m = dir === 'asc' ? 1 : -1;
  return [...assets].sort((a, b) => {
    if (key === 'name') return m * a.name.localeCompare(b.name);
    const av = (a as Record<string, number>)[key] ?? 0;
    const bv = (b as Record<string, number>)[key] ?? 0;
    return m * (av - bv);
  });
}

function filterAssets(assets: CryptoAsset[], query: string): CryptoAsset[] {
  if (!query.trim()) return assets;
  const q = query.toLowerCase();
  return assets.filter(a =>
    a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q)
  );
}

function mergePrice(assets: CryptoAsset[], updates: Record<string, PriceUpdate>): CryptoAsset[] {
  const result: CryptoAsset[] = new Array(assets.length);
  for (let i = 0; i < assets.length; i++) {
    const a = assets[i];
    const key = a.symbol.toLowerCase() + 'usdt';
    const tick = updates[key];
    result[i] = tick ? {
      ...a,
      price: tick.price, change24h: tick.change24h,
      volume24h: tick.volume24h ?? a.volume24h,
      high24h: tick.high24h ?? a.high24h,
      low24h: tick.low24h ?? a.low24h,
      priceDirection: tick.direction ?? 'neutral',
    } : a;
  }
  return result;
}

self.onmessage = (e: MessageEvent<WorkerMsg & { _id?: string }>) => {
  const { _id, ...msg } = e.data;
  try {
    switch (msg.type) {
      case 'COMPUTE_MARKET':
        self.postMessage({ _id, regime: detectRegime(msg.assets), signal: computeSignal(msg.assets) });
        break;
      case 'SORT_FILTER': {
        const filtered = filterAssets(msg.assets, msg.query);
        const sorted = sortAssets(filtered, msg.sortKey, msg.sortDir);
        self.postMessage({ _id, assets: sorted });
        break;
      }
      case 'MERGE_PRICES': {
        const merged = mergePrice(msg.assets, msg.updates);
        self.postMessage({ _id, assets: merged, regime: detectRegime(merged), signal: computeSignal(merged) });
        break;
      }
    }
  } catch (err) {
    self.postMessage({ _id, error: String(err) });
  }
};
