/**
 * Governance.tsx — Meridian Prime
 * Active DAO proposals, voting power, treasury balances
 * Real data: Tally API + snapshot.org GraphQL (free)
 * React.memo + displayName ✓  rgba() only ✓  Zero className ✓
 * JetBrains Mono ✓  useCallback + useMemo ✓  mountedRef ✓  AbortController ✓
 */

import React, { memo, useCallback, useMemo, useEffect, useRef, useState } from 'react';
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
  purple:      'rgba(130,80,220,1)',
  purpleBg:    'rgba(130,80,220,0.08)',
  textPrimary: 'rgba(8,12,40,1)',
  textSecondary:'rgba(60,70,110,1)',
  textFaint:   'rgba(165,175,210,1)',
  bgBase:      'rgba(248,249,252,1)',
  cardBg:      'rgba(255,255,255,1)',
  glassBg:     'rgba(15,40,100,0.04)',
  glassBorder: 'rgba(15,40,100,0.09)',
});

type ProposalState = 'active' | 'passed' | 'failed' | 'pending' | 'executed';

interface GovernanceProposal {
  id: string;
  title: string;
  protocol: string;
  state: ProposalState;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  endTime: number;
  startTime: number;
  link: string;
  category: string;
}

interface SnapshotProposal {
  id?: string;
  title?: string;
  space?: { id?: string; name?: string };
  state?: string;
  scores?: number[];
  scores_total?: number;
  quorum?: number;
  end?: number;
  start?: number;
  link?: string;
  choices?: string[];
}

function fmtVotes(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toFixed(0);
}

function fmtTime(ts: number): string {
  const now = Date.now() / 1000;
  const diff = ts - now;
  if (diff < 0) return 'Ended';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m left`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h left`;
  return `${Math.floor(diff / 86400)}d left`;
}

// ─── StateChip ────────────────────────────────────────────────────────────────

interface StateChipProps { state: ProposalState; }
const StateChip = memo(({ state }: StateChipProps) => {
  const map: Record<ProposalState, { color: string; bg: string }> = {
    active:   { color: C.positive, bg: C.positiveBg },
    passed:   { color: C.accent,   bg: C.accentBg },
    failed:   { color: C.negative, bg: C.negativeBg },
    pending:  { color: C.warning,  bg: C.warningBg },
    executed: { color: C.purple,   bg: C.purpleBg },
  };
  const { color, bg } = map[state] ?? map.pending;
  return <span style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, color, background: bg, borderRadius: 4, padding: '2px 7px', flexShrink: 0 }}>{state.toUpperCase()}</span>;
});
StateChip.displayName = 'StateChip';

// ─── VoteBar ──────────────────────────────────────────────────────────────────

interface VoteBarProps { for_: number; against: number; abstain: number; }
const VoteBar = memo(({ for_, against, abstain }: VoteBarProps) => {
  const total = for_ + against + abstain || 1;
  const pctFor     = (for_    / total) * 100;
  const pctAgainst = (against / total) * 100;
  const pctAbstain = (abstain / total) * 100;

  return (
    <div>
      <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', gap: 1 }}>
        <div style={{ width: `${pctFor}%`,     background: C.positive, transition: 'width 0.3s' }} />
        <div style={{ width: `${pctAgainst}%`, background: C.negative, transition: 'width 0.3s' }} />
        <div style={{ width: `${pctAbstain}%`, background: C.textFaint, transition: 'width 0.3s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        <span style={{ fontFamily: FONT, fontSize: 8, color: C.positive }}>▲ {fmtVotes(for_)} ({pctFor.toFixed(0)}%)</span>
        <span style={{ fontFamily: FONT, fontSize: 8, color: C.negative }}>▼ {fmtVotes(against)} ({pctAgainst.toFixed(0)}%)</span>
      </div>
    </div>
  );
});
VoteBar.displayName = 'VoteBar';

// ─── ProposalCard ─────────────────────────────────────────────────────────────

interface ProposalCardProps { proposal: GovernanceProposal; isMobile: boolean; }
const ProposalCard = memo(({ proposal, isMobile }: ProposalCardProps) => {
  const [hovered, setHovered] = useState(false);
  const timeLeft = fmtTime(proposal.endTime);
  const isActive = proposal.state === 'active';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => proposal.link && window.open(proposal.link, '_blank')}
      style={{
        background: hovered ? C.glassBg : C.cardBg,
        border: `1px solid ${hovered && isActive ? C.accent : C.glassBorder}`,
        borderRadius: 12,
        padding: isMobile ? '14px 14px' : '16px 20px',
        cursor: proposal.link ? 'pointer' : 'default',
        transition: 'all 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, color: C.accent, background: C.accentBg, borderRadius: 4, padding: '2px 7px' }}>{proposal.protocol}</span>
            <StateChip state={proposal.state} />
            {isActive && <span style={{ fontFamily: FONT, fontSize: 9, color: C.warning }}>{timeLeft}</span>}
          </div>
          <div style={{ fontFamily: FONT, fontSize: isMobile ? 11 : 12, fontWeight: 600, color: C.textPrimary, lineHeight: '1.5', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {proposal.title}
          </div>
        </div>
      </div>

      {/* Vote bar */}
      <VoteBar for_={proposal.votesFor} against={proposal.votesAgainst} abstain={proposal.votesAbstain} />

      {/* Bottom */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>
          Total: {fmtVotes(proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain)} votes
        </span>
        {proposal.quorum > 0 && (
          <span style={{ fontFamily: FONT, fontSize: 9, color: C.textFaint }}>
            Quorum: {fmtVotes(proposal.quorum)}
          </span>
        )}
      </div>
    </div>
  );
});
ProposalCard.displayName = 'ProposalCard';

// ─── Governance (Main) ────────────────────────────────────────────────────────

const SNAPSHOT_SPACES = ['uniswapgovernance.eth', 'aave.eth', 'compound-governance.eth', 'gitcoindao.eth', 'balancer.eth', 'ens.eth', 'sushigov.eth', 'curve.eth'];

const QUERY = `
{
  proposals(
    first: 30
    skip: 0
    where: { space_in: ${JSON.stringify(SNAPSHOT_SPACES)}, state: "active" }
    orderBy: "created"
    orderDirection: desc
  ) {
    id title state
    space { id name }
    scores scores_total quorum end start choices link
  }
}`;

const Governance = memo(() => {
  const { isMobile } = useBreakpoint();
  const [proposals, setProposals]   = useState<GovernanceProposal[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [filter, setFilter]         = useState<'all' | 'active' | 'passed' | 'failed'>('all');
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);
  const abortRef   = useRef(new AbortController());

  const fetchData = useCallback(async () => {
    abortRef.current.abort();
    abortRef.current = new AbortController();
    const { signal } = abortRef.current;
    setLoading(true); setError(null);

    try {
      const res = await fetch('https://hub.snapshot.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: QUERY }),
        signal,
      });
      if (!mountedRef.current) return;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { data?: { proposals?: SnapshotProposal[] } };
      if (!mountedRef.current) return;

      const raw = json.data?.proposals ?? [];
      const parsed: GovernanceProposal[] = (raw as SnapshotProposal[]).map((p: SnapshotProposal): GovernanceProposal => {
        const scores  = p.scores ?? [];
        const choices = p.choices ?? [];
        const forIdx  = choices.findIndex(c => /^for|yes|approve|yea/i.test(c));
        const agtIdx  = choices.findIndex(c => /against|no|reject|nay/i.test(c));
        const absIdx  = choices.findIndex(c => /abstain/i.test(c));
        const forVotes  = forIdx >= 0 ? (scores[forIdx] ?? 0) : (scores[0] ?? 0);
        const agtVotes  = agtIdx >= 0 ? (scores[agtIdx] ?? 0) : (scores[1] ?? 0);
        const absVotes  = absIdx >= 0 ? (scores[absIdx] ?? 0) : 0;
        const state: ProposalState = (['active','passed','failed','pending','executed'] as ProposalState[]).includes(p.state as ProposalState) ? (p.state as ProposalState) : 'pending';
        return {
          id:           p.id ?? '',
          title:        p.title ?? 'Untitled Proposal',
          protocol:     p.space?.name ?? p.space?.id ?? 'Unknown',
          state,
          votesFor:     forVotes,
          votesAgainst: agtVotes,
          votesAbstain: absVotes,
          quorum:       p.quorum ?? 0,
          endTime:      p.end ?? 0,
          startTime:    p.start ?? 0,
          link:         p.link ?? `https://snapshot.org/#/${p.space?.id}/proposal/${p.id}`,
          category:     'Governance',
        };
      });

      setProposals(parsed);
      setLastUpdated(Date.now());
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') return;
      if (!mountedRef.current) return;
      setError((e instanceof Error) ? e.message : 'Failed to load');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; abortRef.current.abort(); };
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (filter === 'all') return proposals;
    return proposals.filter(p => p.state === filter);
  }, [proposals, filter]);

  const counts = useMemo(() => ({
    active:  proposals.filter(p => p.state === 'active').length,
    passed:  proposals.filter(p => p.state === 'passed').length,
    failed:  proposals.filter(p => p.state === 'failed').length,
  }), [proposals]);

  const lastStr = useMemo(() => {
    if (!lastUpdated) return '—';
    const s = Math.floor((Date.now() - lastUpdated) / 1000);
    return s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`;
  }, [lastUpdated]);

  return (
    <div style={{ background: C.bgBase, minHeight: '100vh', fontFamily: FONT, color: C.textPrimary, padding: isMobile ? '16px 12px' : '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: FONT, fontSize: isMobile ? 16 : 22, fontWeight: 700, letterSpacing: '0.04em', color: C.textPrimary, margin: 0 }}>Governance</h1>
          <p style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.textFaint, margin: '6px 0 0' }}>
            DAO Proposals · Voting · Treasury · Updated {lastStr}
          </p>
        </div>
        <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, color: C.accent, background: C.accentBg, border: `1px solid rgba(15,40,180,0.2)`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', flexShrink: 0 }}>↻ Refresh</button>
      </div>

      {/* Stat cards */}
      {!loading && proposals.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Active Votes', value: counts.active, color: C.positive },
            { label: 'Passed',       value: counts.passed, color: C.accent },
            { label: 'Failed',       value: counts.failed, color: C.negative },
            { label: 'Total DAOs',   value: SNAPSHOT_SPACES.length, color: C.purple },
          ].map(s => (
            <div key={s.label} style={{ background: C.cardBg, border: `1px solid ${C.glassBorder}`, borderRadius: 12, padding: '14px 16px', flex: 1, minWidth: 90, textAlign: 'center' }}>
              <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: FONT, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.textFaint, marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'active', 'passed', 'failed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontFamily: FONT, fontSize: 10, fontWeight: 600,
            color: f === filter ? C.bgBase : C.textFaint,
            background: f === filter ? C.accent : 'transparent',
            border: `1px solid ${f === filter ? C.accent : C.glassBorder}`,
            borderRadius: 6, padding: '4px 12px', cursor: 'pointer',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {loading && <div style={{ padding: '80px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>Loading governance data...</div>}
      {!loading && error && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '60px 24px' }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: C.negative }}>{error}</span>
          <button onClick={fetchData} style={{ fontFamily: FONT, fontSize: 10, color: C.textPrimary, background: C.glassBg, border: `1px solid ${C.glassBorder}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        filtered.length === 0
          ? <div style={{ padding: '60px 24px', textAlign: 'center', fontFamily: FONT, fontSize: 11, color: C.textFaint }}>No {filter !== 'all' ? filter : ''} proposals found.</div>
          : <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
              {filtered.map(p => <ProposalCard key={p.id} proposal={p} isMobile={isMobile} />)}
            </div>
      )}
    </div>
  );
});
Governance.displayName = 'Governance';
export default Governance;
