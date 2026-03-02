/**
 * useIndexedDB.ts — MERIDIAN PRIME
 * Tick history — 24h persistent price storage
 */

import { useRef, useCallback, useEffect } from 'react';

const DB_NAME = 'mp_tickdb';
const DB_VERSION = 1;
const STORE = 'ticks';
const MAX_TICKS = 1440;

export interface TickRecord { symbol: string; price: number; timestamp: number; }

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: ['symbol', 'timestamp'] });
        s.createIndex('by_symbol', 'symbol', { unique: false });
        s.createIndex('by_time', 'timestamp', { unique: false });
      }
    };
    req.onsuccess = (e) => { _db = (e.target as IDBOpenDBRequest).result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

export function useIndexedDB() {
  const mountedRef = useRef(true);
  const dbRef = useRef<IDBDatabase | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    openDB().then(db => { if (mountedRef.current) dbRef.current = db; }).catch(() => {});
    return () => { mountedRef.current = false; };
  }, []);

  const saveTick = useCallback(async (symbol: string, price: number) => {
    if (!mountedRef.current) return;
    try {
      const db = dbRef.current ?? await openDB();
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ symbol, price, timestamp: Date.now() });
    } catch {}
  }, []);

  const loadTicks = useCallback(async (symbol: string, limit = MAX_TICKS): Promise<TickRecord[]> => {
    if (!mountedRef.current) return [];
    try {
      const db = dbRef.current ?? await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly');
        const idx = tx.objectStore(STORE).index('by_symbol');
        const results: TickRecord[] = [];
        let count = 0;
        const req = idx.openCursor(IDBKeyRange.only(symbol), 'prev');
        req.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor && count < limit) { results.push(cursor.value); count++; cursor.continue(); }
          else resolve(results.reverse());
        };
        req.onerror = () => reject(req.error);
      });
    } catch { return []; }
  }, []);

  return { saveTick, loadTicks };
}
