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

// Mock data fallback
function generateSparkline(base: number, volatility: number): number[] {
  const points: number[] = [];
  let price = base;
  for (let i = 0; i < 168; i++) {
    price += (Math.random() - 0.48) * volatility;
    points.push(Math.max(price, base * 0.8));
  }
  return points;
}

export const MOCK_ASSETS: CryptoAsset[] = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', current_price: 97542.18, market_cap: 1920000000000, market_cap_rank: 1, total_volume: 42300000000, price_change_percentage_24h: 1.24, price_change_percentage_7d_in_currency: 3.45, sparkline_in_7d: { price: generateSparkline(95000, 800) } },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', current_price: 3421.56, market_cap: 411800000000, market_cap_rank: 2, total_volume: 18700000000, price_change_percentage_24h: -0.87, price_change_percentage_7d_in_currency: 2.12, sparkline_in_7d: { price: generateSparkline(3300, 50) } },
  { id: 'solana', symbol: 'sol', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', current_price: 187.34, market_cap: 86500000000, market_cap_rank: 3, total_volume: 4200000000, price_change_percentage_24h: 3.56, price_change_percentage_7d_in_currency: 8.92, sparkline_in_7d: { price: generateSparkline(175, 5) } },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', current_price: 612.45, market_cap: 91200000000, market_cap_rank: 4, total_volume: 1800000000, price_change_percentage_24h: 0.45, price_change_percentage_7d_in_currency: 1.23, sparkline_in_7d: { price: generateSparkline(605, 8) } },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', current_price: 2.34, market_cap: 134000000000, market_cap_rank: 5, total_volume: 8900000000, price_change_percentage_24h: -1.23, price_change_percentage_7d_in_currency: -0.45, sparkline_in_7d: { price: generateSparkline(2.3, 0.05) } },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', current_price: 0.78, market_cap: 27800000000, market_cap_rank: 6, total_volume: 1200000000, price_change_percentage_24h: 2.15, price_change_percentage_7d_in_currency: 5.67, sparkline_in_7d: { price: generateSparkline(0.74, 0.02) } },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', image: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', current_price: 42.18, market_cap: 17200000000, market_cap_rank: 7, total_volume: 890000000, price_change_percentage_24h: -2.34, price_change_percentage_7d_in_currency: -1.56, sparkline_in_7d: { price: generateSparkline(43, 1.5) } },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', current_price: 0.182, market_cap: 26800000000, market_cap_rank: 8, total_volume: 2100000000, price_change_percentage_24h: 4.56, price_change_percentage_7d_in_currency: 12.34, sparkline_in_7d: { price: generateSparkline(0.165, 0.008) } },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', image: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', current_price: 8.92, market_cap: 12400000000, market_cap_rank: 9, total_volume: 560000000, price_change_percentage_24h: 1.89, price_change_percentage_7d_in_currency: 4.23, sparkline_in_7d: { price: generateSparkline(8.5, 0.3) } },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', current_price: 18.45, market_cap: 11500000000, market_cap_rank: 10, total_volume: 780000000, price_change_percentage_24h: -0.56, price_change_percentage_7d_in_currency: 2.89, sparkline_in_7d: { price: generateSparkline(18, 0.6) } },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', image: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png', current_price: 12.67, market_cap: 9500000000, market_cap_rank: 11, total_volume: 450000000, price_change_percentage_24h: 1.34, price_change_percentage_7d_in_currency: 3.78, sparkline_in_7d: { price: generateSparkline(12.2, 0.4) } },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', current_price: 98.45, market_cap: 7400000000, market_cap_rank: 12, total_volume: 620000000, price_change_percentage_24h: 0.89, price_change_percentage_7d_in_currency: 1.45, sparkline_in_7d: { price: generateSparkline(97, 2) } },
];
