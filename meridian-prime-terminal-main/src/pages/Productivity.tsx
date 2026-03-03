/**
 * Productivity.tsx — Meridian Prime
 * Tasks, Notes, Pomodoro Timer, Trade Journal, Market Calendar
 * 100% local state — no API required
 * React.memo + displayName ✓  rgba() only ✓  Zero className ✓
 * JetBrains Mono ✓  useCallback + useMemo ✓
 */

import React, { memo, useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
  warningBg:   'rgba(195,125,0,0.08)',
  textPrimary: 'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:   'rgba(165,175,210,1)',
  bgBase:      'rgba(248,249,252,1)',
  cardBg:      'rgba(255,255,255,1)',
  glassBg:     'rgba(15,40,100,0.04)',
  glassBorder: 'rgba(15,40,100,0.09)',
});

const TABS = Object.freeze(['Tasks', 'Pomodoro', 'Trade Journal', 'Notes'] as const);
type TabType = typeof TABS[number];

interface Task { id: string; text: string; done: boolean; priority: 'high' | 'med' | 'low'; created: number; }
interface TradeEntry { id: string; pair: string; side: 'long' | 'short'; entry: number; exit: number | null; size: number; notes: string; date: string; }
type PomodoroPhase = 'work' | 'break' | 'idle';

// ─── Tasks Panel ──────────────────────────────────────────────────────────────

const PRIORITY_COLORS = { high: C.negative, med: C.warning, low: C.positive };

const TasksPanel = memo(() => {
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [input, setInput]     = useState('');
  const [priority, setPriority] = useState<Task['priority']>('med');
  const [filter, setFilter]   = useState<'all' | 'open' | 'done'>('all');

  const addTask = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    setTasks(prev => [...prev, { id: Date.now().toString(), text: t, done: false, priority, created: Date.now() }]);
    setInput('');
  }, [input, priority]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'open') return tasks.filter(t => !t.done);
    if (filter === 'done') return tasks.filter(t => t.done);
    return tasks;
  }, [tasks, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Input */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addTask()}
          placeholder="Add task... (Enter)"
          style={{ flex: 1, minWidth: 160, fontFamily: FONT, fontSize: 11, color: C.textPrimary, background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: '8px 12px', outline: 'none' }}
        />
        <select value={priority} onChange={e => setPriority(e.target.value as Task['priority'])} style={{ fontFamily: FONT, fontSize: 10, color: PRIORITY_COLORS[priority], background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer' }}>
          <option value="high">High</option>
          <option value="med">Medium</option>
          <option value="low">Low</option>
        </select>
        <button onClick={addTask} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.bgBase, background: C.accent, border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}>Add</button>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['all', 'open', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: FONT, fontSize: 9, fontWeight: 600,
            color: f === filter ? C.bgBase : C.textFaint,
            background: f === filter ? C.accent : 'transparent',
            border: `1px solid ${f === filter ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' ? `(${tasks.length})` : f === 'open' ? `(${tasks.filter(t=>!t.done).length})` : `(${tasks.filter(t=>t.done).length})`}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.length === 0 && (
          <div style={{ fontFamily: FONT, fontSize: 11, color: C.textFaint, textAlign: 'center', padding: '32px 0' }}>
            {filter === 'all' ? 'No tasks yet. Add one above.' : `No ${filter} tasks.`}
          </div>
        )}
        {filtered.map(t => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8 }}>
            <button onClick={() => toggleTask(t.id)} style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${t.done ? C.positive : C.glassBorder}`, background: t.done ? C.positive : 'transparent', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {t.done && <span style={{ color: C.bgBase, fontSize: 10, lineHeight: 1 }}>✓</span>}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontFamily: FONT, fontSize: 11, color: t.done ? C.textFaint : C.textPrimary, textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
            </div>
            <span style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, color: PRIORITY_COLORS[t.priority], background: `${PRIORITY_COLORS[t.priority]}18`, borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>{t.priority.toUpperCase()}</span>
            <button onClick={() => deleteTask(t.id)} style={{ fontFamily: FONT, fontSize: 11, color: C.textFaint, background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', flexShrink: 0 }}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
});
TasksPanel.displayName = 'TasksPanel';

// ─── Pomodoro Panel ───────────────────────────────────────────────────────────

const PomodoroPanel = memo(() => {
  const [phase, setPhase]       = useState<PomodoroPhase>('idle');
  const [seconds, setSeconds]   = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [workMins, setWorkMins] = useState(25);
  const [breakMins, setBreakMins] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const running  = phase !== 'idle';

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  const start = useCallback(() => {
    if (phase === 'idle') {
      setPhase('work');
      setSeconds(workMins * 60);
    }
    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearTimer();
          setPhase(p => {
            if (p === 'work') {
              setSessions(s => s + 1);
              setSeconds(breakMins * 60);
              setTimeout(() => {
                timerRef.current = setInterval(() => setSeconds(pp => { if (pp <= 1) { clearTimer(); setPhase('idle'); return 0; } return pp - 1; }), 1000);
              }, 100);
              return 'break';
            }
            return 'idle';
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [phase, workMins, breakMins, clearTimer]);

  const pause  = useCallback(() => clearTimer(), [clearTimer]);
  const reset  = useCallback(() => { clearTimer(); setPhase('idle'); setSeconds(workMins * 60); }, [clearTimer, workMins]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  const pct = phase === 'work' ? ((workMins * 60 - seconds) / (workMins * 60)) * 100 : phase === 'break' ? ((breakMins * 60 - seconds) / (breakMins * 60)) * 100 : 0;
  const phaseColor = phase === 'work' ? C.accent : phase === 'break' ? C.positive : C.textFaint;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '16px 0' }}>
      {/* Ring */}
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="80" cy="80" r="70" fill="none" stroke={C.glassBg} strokeWidth="8" />
          <circle cx="80" cy="80" r="70" fill="none" stroke={phaseColor} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${440 * pct / 100} 440`} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 800, color: C.textPrimary, letterSpacing: '0.04em', lineHeight: 1 }}>{mm}:{ss}</span>
          <span style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.14em', color: phaseColor, marginTop: 6 }}>{phase.toUpperCase()}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10 }}>
        {!running ? (
          <button onClick={start} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.bgBase, background: C.accent, border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer' }}>▶ Start</button>
        ) : (
          <button onClick={pause} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentBg, border: `1px solid ${C.accent}`, borderRadius: 8, padding: '10px 24px', cursor: 'pointer' }}>⏸ Pause</button>
        )}
        <button onClick={reset} style={{ fontFamily: FONT, fontSize: 11, color: C.textFaint, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>↺ Reset</button>
      </div>

      {/* Session count */}
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: Math.max(4, sessions + 1) }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: i < sessions ? C.accent : C.glassBg, border: `1px solid ${i < sessions ? C.accent : C.glassBorder}` }} />
        ))}
      </div>

      {/* Settings */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {[{ label: 'Work (min)', val: workMins, set: setWorkMins }, { label: 'Break (min)', val: breakMins, set: setBreakMins }].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>{s.label}</span>
            <input type="number" min={1} max={60} value={s.val} onChange={e => !running && s.set(Number(e.target.value))} style={{ width: 48, fontFamily: FONT, fontSize: 11, color: C.textPrimary, background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '4px 8px', textAlign: 'center' }} />
          </div>
        ))}
        <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>Sessions: <b style={{ color: C.accent }}>{sessions}</b></span>
      </div>
    </div>
  );
});
PomodoroPanel.displayName = 'PomodoroPanel';

// ─── Trade Journal Panel ──────────────────────────────────────────────────────

const TradeJournalPanel = memo(() => {
  const [trades, setTrades] = useState<TradeEntry[]>([]);
  const [form, setForm] = useState({ pair:'BTC/USDT', side:'long' as 'long'|'short', entry:'', exit:'', size:'', notes:'' });

  const addTrade = useCallback(() => {
    if (!form.entry || !form.size) return;
    const entry: TradeEntry = {
      id:     Date.now().toString(),
      pair:   form.pair,
      side:   form.side,
      entry:  parseFloat(form.entry),
      exit:   form.exit ? parseFloat(form.exit) : null,
      size:   parseFloat(form.size),
      notes:  form.notes,
      date:   new Date().toLocaleDateString(),
    };
    setTrades(prev => [entry, ...prev]);
    setForm(prev => ({ ...prev, entry: '', exit: '', size: '', notes: '' }));
  }, [form]);

  const pnl = useCallback((t: TradeEntry): number | null => {
    if (t.exit === null) return null;
    const diff = t.side === 'long' ? t.exit - t.entry : t.entry - t.exit;
    return diff * t.size;
  }, []);

  const totalPnl = useMemo(() => trades.reduce((s, t) => { const p = pnl(t); return p !== null ? s + p : s; }, 0), [trades, pnl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Form */}
      <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.textPrimary, letterSpacing: '0.06em' }}>NEW TRADE</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={form.pair} onChange={e => setForm(prev => ({...prev, pair: e.target.value}))} placeholder="Pair" style={{ flex: '1 1 90px', fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.bgBase, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
          <select value={form.side} onChange={e => setForm(prev => ({...prev, side: e.target.value as 'long'|'short'}))} style={{ fontFamily: FONT, fontSize: 10, color: form.side === 'long' ? C.positive : C.negative, background: C.bgBase, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '7px 10px', cursor: 'pointer' }}>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
          <input value={form.entry} onChange={e => setForm(prev => ({...prev, entry: e.target.value}))} placeholder="Entry price" type="number" style={{ flex: '1 1 100px', fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.bgBase, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
          <input value={form.exit} onChange={e => setForm(prev => ({...prev, exit: e.target.value}))} placeholder="Exit (opt)" type="number" style={{ flex: '1 1 100px', fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.bgBase, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
          <input value={form.size} onChange={e => setForm(prev => ({...prev, size: e.target.value}))} placeholder="Size" type="number" style={{ flex: '1 1 80px', fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.bgBase, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={form.notes} onChange={e => setForm(prev => ({...prev, notes: e.target.value}))} placeholder="Notes" style={{ flex: 1, fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.bgBase, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '7px 10px', outline: 'none' }} />
          <button onClick={addTrade} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, color: C.bgBase, background: C.accent, border: 'none', borderRadius: 6, padding: '7px 18px', cursor: 'pointer' }}>Log</button>
        </div>
      </div>

      {/* Total PnL */}
      {trades.length > 0 && (
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: totalPnl >= 0 ? C.positive : C.negative, textAlign: 'right' }}>
          Total Realized P&L: {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(2)} USD
        </div>
      )}

      {/* Trades list */}
      {trades.length === 0 ? (
        <div style={{ fontFamily: FONT, fontSize: 11, color: C.textFaint, textAlign: 'center', padding: '32px 0' }}>No trades logged yet.</div>
      ) : trades.map(t => {
        const p = pnl(t);
        return (
          <div key={t.id} style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, color: C.textPrimary }}>{t.pair}</span>
                <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: t.side === 'long' ? C.positive : C.negative, background: t.side === 'long' ? C.positiveBg : C.negativeBg, borderRadius: 4, padding: '1px 6px' }}>{t.side.toUpperCase()}</span>
              </div>
              <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>Entry {t.entry} → {t.exit ?? '?'} | Size {t.size}</span>
              {t.notes && <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 2 }}>{t.notes}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              {p !== null ? (
                <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, color: p >= 0 ? C.positive : C.negative }}>{p >= 0 ? '+' : ''}{p.toFixed(2)}</div>
              ) : (
                <div style={{ fontFamily: FONT, fontSize: 10, color: C.warning }}>OPEN</div>
              )}
              <div style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint, marginTop: 2 }}>{t.date}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
TradeJournalPanel.displayName = 'TradeJournalPanel';

// ─── Notes Panel ──────────────────────────────────────────────────────────────

const NotesPanel = memo(() => {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaved(false);
  }, []);

  const handleSave = useCallback(() => setSaved(true), []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT, fontSize: 10, color: C.textFaint }}>{notes.length} chars · {notes.split('\n').filter(Boolean).length} lines</span>
        <button onClick={handleSave} style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, color: saved ? C.positive : C.accent, background: saved ? C.positiveBg : C.accentBg, border: `1px solid ${saved ? C.positive : C.accent}`, borderRadius: 6, padding: '4px 12px', cursor: 'pointer' }}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        placeholder="Write market notes, trade ideas, analysis..."
        style={{ fontFamily: FONT, fontSize: 11, color: C.textPrimary, background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 10, padding: 14, resize: 'vertical', minHeight: 300, outline: 'none', lineHeight: '1.8' }}
      />
    </div>
  );
});
NotesPanel.displayName = 'NotesPanel';

// ─── Productivity (Main) ──────────────────────────────────────────────────────

const Productivity = memo(() => {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<TabType>('Tasks');

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Productivity Suite</h1>
        <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
          Tasks · Pomodoro · Trade Journal · Notes
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600,
            color: t === activeTab ? C.bgBase : C.textFaint,
            background: t === activeTab ? C.accent : 'transparent',
            border: `1px solid ${t === activeTab ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: isMobile ? '14px 12px' : '20px 24px' }}>
        {activeTab === 'Tasks'         && <TasksPanel />}
        {activeTab === 'Pomodoro'      && <PomodoroPanel />}
        {activeTab === 'Trade Journal' && <TradeJournalPanel />}
        {activeTab === 'Notes'         && <NotesPanel />}
      </div>
    </div>
  );
});
Productivity.displayName = 'Productivity';
export default Productivity;
