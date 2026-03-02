// formatters.ts — MERIDIAN PRIME
// Full ZM-grade formatters + regime/signal computation

import type { CryptoAsset, Regime, AISignal } from '@/types/crypto';

export function formatNumber(n: number, decimals = 2): string {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function formatCompact(n: number): string {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3)  return '$' + (n / 1e3).toFixed(2) + 'K';
  return '$' + n.toFixed(2);
}

export function formatCompactNum(n: number): string {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9)  return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6)  return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3)  return (n / 1e3).toFixed(2) + 'K';
  return n.toFixed(2);
}

export function formatPrice(n: number): string {
  if (!isFinite(n)) return '—';
  if (n >= 1000)  return '$' + formatNumber(n, 2);
  if (n >= 1)     return '$' + formatNumber(n, 4);
  if (n >= 0.01)  return '$' + formatNumber(n, 6);
  return '$' + n.toFixed(8);
}

export function formatChange(n: number): string {
  if (!isFinite(n)) return '—';
  const sign = n >= 0 ? '+' : '';
  return sign + n.toFixed(2) + '%';
}

export function formatDelta(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function formatPct(n: number): string {
  return n.toFixed(2) + '%';
}

export function detectRegime(assets: CryptoAsset[]): Regime {
  if (assets.length === 0) return 'CRAB';
  const top = assets.slice(0, 10);
  let totalWeight = 0, wSum = 0;
  for (const a of top) {
    const w = a.marketCap > 0 ? a.marketCap : 1;
    totalWeight += w;
    wSum += a.change24h * w;
  }
  const avg = totalWeight > 0 ? wSum / totalWeight : 0;
  const top20 = assets.slice(0, 20);
  const pos = top20.filter(a => a.change24h > 0).length;
  const breadth = top20.length > 0 ? pos / top20.length : 0.5;
  if (avg > 5 || (avg > 3 && breadth > 0.75)) return 'SURGE';
  if (avg > 1.5 && breadth > 0.55) return 'BULL';
  if (avg < -1.5 && breadth < 0.45) return 'BEAR';
  return 'CRAB';
}

export function computeSignal(assets: CryptoAsset[]): AISignal {
  const top = assets.slice(0, 15);
  let score = 0, weight = 0;
  for (const a of top) {
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

export function deterministicJitter(attempt: number): number {
  const seed = (attempt + 1) * 0x9e3779b9;
  return ((seed ^ (seed >>> 16)) & 0x1ff);
}

export function getReconnectDelay(attempt: number): number {
  const base = 1000 * Math.pow(2, Math.min(attempt, 5));
  return Math.min(base + deterministicJitter(attempt), 30000);
}
