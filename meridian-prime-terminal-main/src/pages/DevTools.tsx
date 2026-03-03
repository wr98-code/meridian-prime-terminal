/**
 * DevTools.tsx — Meridian Prime
 * JSON formatter, Base64 encoder, Regex tester, Hash generator, JWT decoder
 * 100% client-side — no API required
 * React.memo + displayName ✓  rgba() only ✓  Zero className ✓
 * JetBrains Mono ✓  useCallback + useMemo ✓
 */

import React, { memo, useCallback, useMemo, useState } from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const FONT = "'JetBrains Mono', monospace";

const C = Object.freeze({
  accent:      'rgba(15,40,180,1)',
  accentBg:    'rgba(15,40,180,0.07)',
  positive:    'rgba(0,155,95,1)',
  positiveBg:  'rgba(0,155,95,0.08)',
  negative:    'rgba(208,35,75,1)',
  negativeBg:  'rgba(208,35,75,0.08)',
  warning:     'rgba(195,125,0,1)',
  textPrimary: 'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:   'rgba(165,175,210,1)',
  bgBase:      'rgba(248,249,252,1)',
  cardBg:      'rgba(255,255,255,1)',
  codeBg:      'rgba(240,243,250,1)',
  glassBg:     'rgba(15,40,100,0.04)',
  glassBorder: 'rgba(15,40,100,0.09)',
});

const TABS = Object.freeze(['JSON', 'Base64', 'Regex', 'Hash', 'JWT'] as const);
type TabType = typeof TABS[number];

const inputStyle: React.CSSProperties = {
  fontFamily: FONT, fontSize: 11, color: C.textPrimary,
  background: C.codeBg, border: `1px solid ${C.glassBorder}`,
  borderRadius: 8, padding: '12px 14px', resize: 'vertical',
  outline: 'none', width: '100%', boxSizing: 'border-box',
  lineHeight: '1.6',
};

// ─── JSON Tool ────────────────────────────────────────────────────────────────

const JsonTool = memo(() => {
  const [input, setInput]   = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError]   = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const format = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }, [output]);

  const stats = useMemo(() => {
    if (!output) return null;
    try {
      const obj = JSON.parse(output);
      const keys = (o: unknown): number => typeof o === 'object' && o !== null ? Object.keys(o as Record<string,unknown>).length + Object.values(o as Record<string,unknown>).reduce((s, v) => s + keys(v), 0) : 0;
      return { size: new Blob([output]).size, keys: keys(obj) };
    } catch { return null; }
  }, [output]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder='{"key": "value"}' style={{ ...inputStyle, minHeight: 160 }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={format} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.bgBase, background: C.accent, border: 'none', borderRadius: 6, padding: '7px 16px', cursor: 'pointer' }}>Format</button>
        <button onClick={minify} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}`, borderRadius: 6, padding: '7px 14px', cursor: 'pointer' }}>Minify</button>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>Indent:</span>
          <select value={indent} onChange={e => setIndent(Number(e.target.value))} style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '4px 8px' }}>
            {[2, 4, '\t'].map(v => <option key={v} value={v}>{v === '\t' ? 'Tab' : `${v} spaces`}</option>)}
          </select>
        </label>
        {stats && <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>{stats.size} bytes · {stats.keys} keys</span>}
      </div>
      {error && <div style={{ fontFamily: FONT, fontSize: 10, color: C.negative, background: C.negativeBg, borderRadius: 6, padding: '8px 12px' }}>⚠ {error}</div>}
      {output && (
        <div style={{ position: 'relative' }}>
          <pre style={{ ...inputStyle, minHeight: 120, margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{output}</pre>
          <button onClick={copy} style={{ position: 'absolute', top: 8, right: 8, fontFamily: FONT, fontSize: 9, color: copied ? C.positive : C.accent, background: C.cardBg, border: `1px solid ${copied ? C.positive : C.glassBorder}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      )}
    </div>
  );
});
JsonTool.displayName = 'JsonTool';

// ─── Base64 Tool ──────────────────────────────────────────────────────────────

const Base64Tool = memo(() => {
  const [input, setInput]   = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode]     = useState<'encode' | 'decode'>('encode');
  const [error, setError]   = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const run = useCallback(() => {
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
      setError(null);
    } catch (e) {
      setError((e as Error).message);
      setOutput('');
    }
  }, [input, mode]);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }, [output]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
        {(['encode', 'decode'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600,
            color: m === mode ? C.bgBase : C.textFaint,
            background: m === mode ? C.accent : 'transparent',
            border: `1px solid ${m === mode ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '4px 14px', cursor: 'pointer',
          }}>{m.charAt(0).toUpperCase() + m.slice(1)}</button>
        ))}
      </div>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'} style={{ ...inputStyle, minHeight: 120 }} />
      <button onClick={run} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.bgBase, background: C.accent, border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', alignSelf: 'flex-start' }}>
        {mode === 'encode' ? 'Encode →' : 'Decode →'}
      </button>
      {error && <div style={{ fontFamily: FONT, fontSize: 10, color: C.negative, background: C.negativeBg, borderRadius: 6, padding: '8px 12px' }}>⚠ {error}</div>}
      {output && (
        <div style={{ position: 'relative' }}>
          <pre style={{ ...inputStyle, minHeight: 80, margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{output}</pre>
          <button onClick={copy} style={{ position: 'absolute', top: 8, right: 8, fontFamily: FONT, fontSize: 9, color: copied ? C.positive : C.accent, background: C.cardBg, border: `1px solid ${copied ? C.positive : C.glassBorder}`, borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}>{copied ? '✓ Copied' : 'Copy'}</button>
        </div>
      )}
    </div>
  );
});
Base64Tool.displayName = 'Base64Tool';

// ─── Regex Tool ───────────────────────────────────────────────────────────────

const RegexTool = memo(() => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags]     = useState('gi');
  const [text, setText]       = useState('');
  const [error, setError]     = useState<string | null>(null);

  const result = useMemo(() => {
    if (!pattern || !text) return null;
    try {
      const re = new RegExp(pattern, flags);
      const matches = [...text.matchAll(new RegExp(pattern, 'g' + flags.replace('g', '')))];
      const highlighted = text.replace(re, m => `\x00${m}\x01`);
      setError(null);
      return { count: matches.length, matches: matches.map(m => ({ value: m[0], index: m.index ?? 0, groups: m.groups })), highlighted };
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [pattern, flags, text]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginBottom: 4 }}>PATTERN</div>
          <input value={pattern} onChange={e => setPattern(e.target.value)} placeholder="[a-z]+" style={{ ...inputStyle, minHeight: 0, padding: '8px 12px' }} />
        </div>
        <div>
          <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginBottom: 4 }}>FLAGS</div>
          <input value={flags} onChange={e => setFlags(e.target.value)} placeholder="gi" style={{ ...inputStyle, minHeight: 0, padding: '8px 10px', width: 60 }} />
        </div>
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginBottom: 4 }}>TEST STRING</div>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter test string..." style={{ ...inputStyle, minHeight: 100 }} />
      </div>
      {error && <div style={{ fontFamily: FONT, fontSize: 10, color: C.negative, background: C.negativeBg, borderRadius: 6, padding: '8px 12px' }}>⚠ {error}</div>}
      {result && (
        <div style={{ background: C.codeBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: 14 }}>
          <div style={{ fontFamily: FONT, fontSize: 10, color: result.count > 0 ? C.positive : C.textFaint, marginBottom: 10, fontWeight: 700 }}>
            {result.count} match{result.count !== 1 ? 'es' : ''}
          </div>
          {result.count > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.matches.slice(0, 20).map((m, i) => (
                <span key={i} style={{ fontFamily: FONT, fontSize: 10, color: C.accent, background: C.accentBg, borderRadius: 4, padding: '2px 8px' }}>{m.value}</span>
              ))}
              {result.count > 20 && <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>+{result.count - 20} more</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
RegexTool.displayName = 'RegexTool';

// ─── Hash Tool ────────────────────────────────────────────────────────────────

const HashTool = memo(() => {
  const [input, setInput]     = useState('');
  const [hashes, setHashes]   = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const compute = useCallback(async () => {
    if (!input) return;
    setLoading(true);
    try {
      const enc = new TextEncoder().encode(input);
      const results: Record<string, string> = {};
      for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
        const buf  = await crypto.subtle.digest(algo, enc);
        const arr  = Array.from(new Uint8Array(buf));
        results[algo] = arr.map(b => b.toString(16).padStart(2, '0')).join('');
      }
      setHashes(results);
    } finally {
      setLoading(false);
    }
  }, [input]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash..." style={{ ...inputStyle, minHeight: 100 }} />
      <button onClick={compute} disabled={loading || !input} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.bgBase, background: input ? C.accent : C.textFaint, border: 'none', borderRadius: 6, padding: '8px 20px', cursor: input ? 'pointer' : 'not-allowed', alignSelf: 'flex-start' }}>
        {loading ? 'Computing...' : 'Compute Hashes'}
      </button>
      {Object.entries(hashes).map(([algo, hash]) => (
        <div key={algo} style={{ background: C.codeBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginBottom: 4, letterSpacing: '0.1em' }}>{algo}</div>
          <div style={{ fontFamily: FONT, fontSize: 10, color: C.accent, wordBreak: 'break-all' }}>{hash}</div>
        </div>
      ))}
    </div>
  );
});
HashTool.displayName = 'HashTool';

// ─── JWT Tool ─────────────────────────────────────────────────────────────────

const JwtTool = memo(() => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const decoded = useMemo(() => {
    if (!input.trim()) return null;
    try {
      const parts = input.trim().split('.');
      if (parts.length !== 3) throw new Error('JWT must have 3 parts separated by dots');

      const decode = (s: string) => {
        const pad = s.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(escape(atob(pad))));
      };

      const header  = decode(parts[0]);
      const payload = decode(parts[1]);
      setError(null);

      const exp     = payload.exp ? new Date(payload.exp * 1000) : null;
      const iat     = payload.iat ? new Date(payload.iat * 1000) : null;
      const expired = exp ? exp < new Date() : null;

      return { header, payload, exp, iat, expired, sig: parts[2] };
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [input]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste JWT token here..." style={{ ...inputStyle, minHeight: 100 }} />
      {error && <div style={{ fontFamily: FONT, fontSize: 10, color: C.negative, background: C.negativeBg, borderRadius: 6, padding: '8px 12px' }}>⚠ {error}</div>}
      {decoded && (
        <>
          {decoded.exp && (
            <div style={{ fontFamily: FONT, fontSize: 10, color: decoded.expired ? C.negative : C.positive, background: decoded.expired ? C.negativeBg : C.positiveBg, borderRadius: 6, padding: '8px 12px', fontWeight: 600 }}>
              {decoded.expired ? `⚠ EXPIRED: ${decoded.exp.toLocaleString()}` : `✓ Valid until: ${decoded.exp.toLocaleString()}`}
            </div>
          )}
          {[{ label: 'HEADER', data: decoded.header }, { label: 'PAYLOAD', data: decoded.payload }].map(s => (
            <div key={s.label} style={{ background: C.codeBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontFamily: FONT, fontSize: 9, color: C.accent, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 }}>{s.label}</div>
              <pre style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {JSON.stringify(s.data, null, 2)}
              </pre>
            </div>
          ))}
          <div style={{ background: C.codeBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 6 }}>SIGNATURE (not verified)</div>
            <div style={{ fontFamily: FONT, fontSize: 10, color: C.textFaint, wordBreak: 'break-all' }}>{decoded.sig}</div>
          </div>
        </>
      )}
    </div>
  );
});
JwtTool.displayName = 'JwtTool';

// ─── DevTools (Main) ──────────────────────────────────────────────────────────

const TAB_ICONS: Record<TabType, string> = { JSON: '{}', Base64: '64', Regex: 'RE', Hash: '#', JWT: 'JW' };

const DevTools = memo(() => {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<TabType>('JSON');

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Developer Tools</h1>
        <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
          JSON · Base64 · Regex · Hash · JWT — Client-Side Only
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 700,
            color: t === activeTab ? C.bgBase : C.textFaint,
            background: t === activeTab ? C.accent : 'transparent',
            border: `1px solid ${t === activeTab ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <span style={{ fontFamily: FONT, fontSize: 9, opacity: 0.7 }}>{TAB_ICONS[t]}</span>
            {t}
          </button>
        ))}
      </div>

      <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: isMobile ? '14px 12px' : '20px 24px' }}>
        {activeTab === 'JSON'   && <JsonTool />}
        {activeTab === 'Base64' && <Base64Tool />}
        {activeTab === 'Regex'  && <RegexTool />}
        {activeTab === 'Hash'   && <HashTool />}
        {activeTab === 'JWT'    && <JwtTool />}
      </div>
    </div>
  );
});
DevTools.displayName = 'DevTools';
export default DevTools;
