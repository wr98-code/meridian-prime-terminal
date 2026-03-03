import { memo } from 'react';
import { colors, radii, font } from '@/styles/tokens';
import { formatDelta } from '@/utils/formatters';

interface ChangeBadgeProps {
  value: number | null | undefined;
  size?: 'sm' | 'md';
}

const ChangeBadge = memo(function ChangeBadge({ value, size = 'sm' }: ChangeBadgeProps) {
  const v = value ?? 0;
  const positive = v >= 0;
  const bg = positive ? colors.bullDim : colors.bearDim;
  const border = positive ? colors.bullMid : colors.bearMid;
  const color = positive ? colors.bull : colors.bear;
  const arrow = positive ? '↑' : '↓';
  const fontSize = size === 'sm' ? '10px' : '11px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      background: bg,
      border: `1px solid ${border}`,
      color,
      fontSize,
      fontWeight: 600,
      fontFamily: font.family,
      fontVariantNumeric: 'tabular-nums',
      borderRadius: radii.badge,
      padding: '2px 8px',
      lineHeight: 1.4,
      whiteSpace: 'nowrap',
    }}>
      {arrow} {formatDelta(v)}
    </span>
  );
});

ChangeBadge.displayName = 'ChangeBadge';
export default ChangeBadge;
