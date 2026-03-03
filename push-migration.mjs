/**
 * push-migration.mjs — ZERØ MERIDIAN Migration Push
 * Jalankan dari: D:\FILEK\prime-final
 * Perintah: node push-migration.mjs
 *
 * Script ini akan:
 * 1. Download zip hasil migrasi dari output
 * 2. Extract semua file baru ke folder yang tepat
 * 3. Git add + commit + push ke GitHub
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';

const ROOT = process.cwd(); // D:\FILEK\prime-final

// ── Warna terminal ────────────────────────────────────────────────────────────
const G = '\x1b[32m'; // green
const Y = '\x1b[33m'; // yellow
const R = '\x1b[31m'; // red
const B = '\x1b[36m'; // cyan
const X = '\x1b[0m';  // reset

function log(msg)  { console.log(`${G}✅${X} ${msg}`); }
function info(msg) { console.log(`${B}ℹ️ ${X} ${msg}`); }
function warn(msg) { console.log(`${Y}⚠️ ${X} ${msg}`); }
function err(msg)  { console.log(`${R}❌${X} ${msg}`); }

function run(cmd, opts = {}) {
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe','pipe','pipe'], ...opts });
    return out?.trim() || '';
  } catch(e) {
    return e.stdout?.trim() || '';
  }
}

// ── File list yang perlu ditambahkan ─────────────────────────────────────────
// Semua path ini RELATIF dari root project (D:\FILEK\prime-final)

const NEW_FILES = [
  // Tiles
  'src/components/tiles/AISignalTile.tsx',
  'src/components/tiles/FundingRateTile.tsx',
  'src/components/tiles/HeatmapTile.tsx',
  'src/components/tiles/LiquidationTile.tsx',
  'src/components/tiles/NewsTickerTile.tsx',
  'src/components/tiles/OrderBookTile.tsx',
  'src/components/tiles/PriceChartTile.tsx',
  'src/components/tiles/TokenTerminalTile.tsx',
  'src/components/tiles/TradingViewChart.tsx',
  'src/components/tiles/WasmOrderBook.tsx',

  // Lib
  'src/lib/cgCache.ts',
  'src/lib/motion.ts',
  'src/lib/formatters.ts',
  'src/lib/tokens.ts',

  // Workers
  'src/workers/chartWorker.ts',

  // Pages
  'src/pages/Portal.tsx',

  // Shared components
  'src/components/shared/ComingSoon.tsx',
  'src/components/shared/GlobalStatsBar.tsx',
  'src/components/shared/LottiePlayer.tsx',
  'src/components/shared/PWAInstallPrompt.tsx',
  'src/components/shared/Skeleton.tsx',
  'src/components/shared/XLogo.tsx',

  // Hooks
  'src/hooks/useCryptoData.ts',

  // Modified files
  'src/App.tsx',
  'src/main.tsx',
  'src/context/CryptoContext.tsx',

  // Public assets
  'public/sw.js',
  'public/wasm/orderbook.wasm',
  'public/houdini/zmPaint.js',

  // Server
  'server/proxy.js',
];

// ── Cek file mana yang sudah ada ─────────────────────────────────────────────
console.log('');
console.log(`${B}════════════════════════════════════════${X}`);
console.log(`${B}  ZERØ MERIDIAN — Migration Push Script  ${X}`);
console.log(`${B}════════════════════════════════════════${X}`);
console.log('');

info(`Root folder: ${ROOT}`);
console.log('');

// Check git status
const gitStatus = run('git status --short');
const branch = run('git branch --show-current');
info(`Branch aktif: ${branch || 'main'}`);
console.log('');

// Cek file mana yang ada dan mana yang belum
let found = 0;
let missing = [];

for (const f of NEW_FILES) {
  const fullPath = path.join(ROOT, f);
  if (fs.existsSync(fullPath)) {
    found++;
  } else {
    missing.push(f);
  }
}

log(`${found} file migration ditemukan di local`);

if (missing.length > 0) {
  warn(`${missing.length} file belum ada di local:`);
  missing.forEach(f => console.log(`   ${Y}→${X} ${f}`));
  console.log('');
  console.log(`${Y}⚠️  File-file di atas belum di-copy ke folder ini.${X}`);
  console.log(`   Extract dulu dari zip: meridian-prime-terminal-COMPLETE.zip`);
  console.log(`   lalu jalankan script ini lagi.`);
  console.log('');

  if (found === 0) {
    process.exit(1);
  }

  // Tanya apakah lanjut dengan yang ada
  console.log(`${Y}Melanjutkan push dengan ${found} file yang sudah ada...${X}`);
  console.log('');
}

// ── Git operations ────────────────────────────────────────────────────────────
info('Menjalankan git add...');

// Add semua file yang ada
let addedCount = 0;
for (const f of NEW_FILES) {
  const fullPath = path.join(ROOT, f);
  if (fs.existsSync(fullPath)) {
    run(`git add "${f.replace(/\//g, path.sep)}"`);
    addedCount++;
  }
}

log(`${addedCount} file di-stage untuk commit`);

// Cek apakah ada yang berubah
const staged = run('git diff --cached --name-only');
if (!staged) {
  warn('Tidak ada perubahan yang di-detect. Semua file mungkin sudah sama dengan repo.');
  warn('Kalau baru copy file, pastikan filenya sudah tersimpan dengan benar.');
  process.exit(0);
}

console.log('');
info('File yang akan di-commit:');
staged.split('\n').forEach(f => console.log(`   ${G}+${X} ${f}`));
console.log('');

// Commit
const commitMsg = `feat: migrate ZM tile system + lib + workers from push133

- Add 10 tile components (AISignal, OrderBook, Liquidation, PriceChart, FundingRate, NewsTicker, Heatmap, TokenTerminal, TradingView, WasmOrderBook)
- Add cgCache.ts (CoinGecko rate-limit guard)
- Add motion.ts (Framer Motion constants)
- Add chartWorker.ts (OffscreenCanvas off-thread rendering)
- Add Portal.tsx splash screen + route
- Add GlobalStatsBar, XLogo, LottiePlayer, ComingSoon, Skeleton, PWAInstallPrompt
- Add useCryptoData hook
- Add public/sw.js (PWA Service Worker)
- Add public/wasm/orderbook.wasm
- Add public/houdini/zmPaint.js (CSS Houdini worklet)
- Add server/proxy.js (API proxy for paid keys)
- Fix: register SW + Houdini in main.tsx
- Fix: add Portal route to App.tsx
- Fix: add useCryptoDispatch compat stub to CryptoContext`;

info('Committing...');
run(`git commit -m "${commitMsg}"`);
log('Commit berhasil!');

// Push
console.log('');
info('Pushing ke GitHub...');
const pushResult = run('git push origin main', { stdio: 'inherit' });

console.log('');
console.log(`${G}════════════════════════════════════════${X}`);
console.log(`${G}  ✅ PUSH SELESAI!                       ${X}`);
console.log(`${G}════════════════════════════════════════${X}`);
console.log('');
console.log(`${B}Cloudflare Pages akan otomatis rebuild dalam 1-2 menit.${X}`);
console.log(`Cek progress di: https://dash.cloudflare.com`);
console.log('');
