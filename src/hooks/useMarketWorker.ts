/**
 * useMarketWorker.ts — MERIDIAN PRIME
 * Singleton Web Worker wrapper — promise-based, timeout-safe
 */

import { useEffect, useRef, useCallback } from 'react';
import type { CryptoAsset, PriceUpdate, Regime, AISignal } from '@/types/crypto';

type SortKey = 'rank' | 'name' | 'price' | 'change24h' | 'change7d' | 'marketCap' | 'volume24h';
type Callback = (data: unknown) => void;

let _worker: Worker | null = null;
let _refCount = 0;
const _callbacks = new Map<string, Callback>();
let _msgId = 0;

function getWorker(): Worker | null {
  if (typeof Worker === 'undefined') return null;
  if (!_worker) {
    _worker = new Worker(new URL('../workers/marketWorker.ts', import.meta.url), { type: 'module' });
    _worker.onmessage = (e) => {
      const { _id, ...data } = e.data as { _id?: string } & Record<string, unknown>;
      if (_id && _callbacks.has(_id)) { _callbacks.get(_id)!(data); _callbacks.delete(_id); }
    };
    _worker.onerror = (err) => console.error('[MarketWorker]', err.message);
  }
  return _worker;
}

function postMsg<T>(msg: object, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = getWorker();
    if (!worker) { reject(new Error('Worker unavailable')); return; }
    const id = 'mw_' + (++_msgId);
    const timer = setTimeout(() => { _callbacks.delete(id); reject(new Error('Worker timeout')); }, timeoutMs);
    _callbacks.set(id, (data: unknown) => { clearTimeout(timer); resolve(data as T); });
    worker.postMessage({ ...msg, _id: id });
  });
}

export function useMarketWorker() {
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    _refCount++;
    return () => {
      mountedRef.current = false;
      _refCount--;
      if (_refCount === 0 && _worker) { _worker.terminate(); _worker = null; _callbacks.clear(); }
    };
  }, []);

  const mergeAndCompute = useCallback((assets: CryptoAsset[], updates: Record<string, PriceUpdate>) =>
    postMsg<{ assets: CryptoAsset[]; regime: Regime; signal: AISignal }>({ type: 'MERGE_PRICES', assets, updates }), []);

  const sortAndFilter = useCallback((assets: CryptoAsset[], sortKey: SortKey, sortDir: 'asc' | 'desc', query: string) =>
    postMsg<{ assets: CryptoAsset[] }>({ type: 'SORT_FILTER', assets, sortKey, sortDir, query }), []);

  const computeMarket = useCallback((assets: CryptoAsset[]) =>
    postMsg<{ regime: Regime; signal: AISignal }>({ type: 'COMPUTE_MARKET', assets }), []);

  return { mergeAndCompute, sortAndFilter, computeMarket };
}
