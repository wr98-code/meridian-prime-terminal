export const colors = {
  bgPage: 'rgba(255,255,255,1)',
  bgCard: 'rgba(248,249,252,1)',
  bgHover: 'rgba(241,243,249,1)',
  bgModal: 'rgba(234,237,245,1)',
  accent: 'rgba(15,40,180,1)',
  accentDim: 'rgba(15,40,180,0.08)',
  accentMid: 'rgba(15,40,180,0.35)',
  bull: 'rgba(0,155,95,1)',
  bullDim: 'rgba(0,155,95,0.08)',
  bullMid: 'rgba(0,155,95,0.35)',
  bear: 'rgba(210,38,75,1)',
  bearDim: 'rgba(210,38,75,0.08)',
  bearMid: 'rgba(210,38,75,0.35)',
  warn: 'rgba(195,125,0,1)',
  warnDim: 'rgba(195,125,0,0.08)',
  warnMid: 'rgba(195,125,0,0.35)',
  textPrimary: 'rgba(10,14,40,1)',
  textSecondary: 'rgba(60,70,110,1)',
  textMuted: 'rgba(120,130,165,1)',
  textFaint: 'rgba(175,185,210,1)',
  borderFaint: 'rgba(15,40,100,0.06)',
  borderMuted: 'rgba(15,40,100,0.10)',
  borderStrong: 'rgba(15,40,100,0.18)',
  borderAccent: 'rgba(15,40,180,0.40)',
} as const;

export const shadows = {
  card: '0 1px 4px rgba(15,40,100,0.07), 0 0 0 1px rgba(15,40,100,0.06)',
  raised: '0 4px 16px rgba(15,40,100,0.10), 0 0 0 1px rgba(15,40,100,0.07)',
  float: '0 8px 32px rgba(15,40,100,0.12), 0 0 0 1px rgba(15,40,100,0.08)',
  focusRing: '0 0 0 3px rgba(15,40,180,0.15)',
} as const;

export const radii = {
  card: '12px',
  button: '8px',
  badge: '6px',
  modal: '16px',
} as const;

export const font = {
  family: "'JetBrains Mono', monospace",
} as const;

export const glassCardStyle: React.CSSProperties = {
  background: colors.bgCard,
  border: `1px solid ${colors.borderMuted}`,
  borderRadius: radii.card,
  boxShadow: shadows.card,
  padding: '16px 20px',
};

export const cardHeaderStyle: React.CSSProperties = {
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${colors.borderFaint}`,
  marginBottom: '12px',
  paddingBottom: '10px',
};

// Extra tokens for ZM-migrated pages
export const extra = {
  positive: colors.bull,
  positiveDim: colors.bullDim,
  negative: colors.bear,
  negativeDim: colors.bearDim,
  border: colors.borderMuted,
} as const;
