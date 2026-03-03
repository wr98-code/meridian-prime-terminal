// types/crypto.ts — MERIDIAN PRIME
// Full ZM-grade types — superset of CoinGecko + Binance WS

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change7d: number;
  change30d?: number;
  marketCap: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
  circulatingSupply: number;
  totalSupply?: number;
  ath?: number;
  athDate?: string;
  rank: number;
  image?: string;
  sparkline?: number[];
  lastUpdated?: string;
  priceDirection?: 'up' | 'down' | 'neutral';
}

export interface GlobalData {
  totalMcap: number;
  totalVolume: number;
  btcDominance: number;
  ethDominance: number;
  activeCurrencies: number;
  mcapChange24h: number;
}

export interface FearGreedData {
  value: number;
  label: string;
}

export type Regime = 'SURGE' | 'BULL' | 'CRAB' | 'BEAR';
export type AISignal = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export type WsStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface PriceUpdate {
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
  direction?: 'up' | 'down' | 'neutral';
}
