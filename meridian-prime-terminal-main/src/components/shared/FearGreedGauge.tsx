import { memo, useMemo } from 'react';
import { colors, font } from '@/styles/tokens';

interface FearGreedGaugeProps {
  value: number;
  label: string;
}

const FearGreedGauge = memo(function FearGreedGauge({ value, label }: FearGreedGaugeProps) {
  const angle = useMemo(() => (value / 100) * 180, [value]);
  const gaugeColor = useMemo(() => {
    if (value < 25) return colors.bear;
    if (value < 45) return colors.warn;
    if (value < 55) return colors.textMuted;
    if (value < 75) return 'rgba(120,180,50,1)';
    return colors.bull;
  }, [value]);

  const r = 60;
  const cx = 70;
  const cy = 70;
  const startAngle = Math.PI;
  const endAngle = Math.PI + (angle / 180) * Math.PI;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = angle > 180 ? 1 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="140" height="80" viewBox="0 0 140 80">
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="rgba(15,40,100,0.06)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none"
          stroke={gaugeColor}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        fontFamily: font.family,
        fontSize: '28px',
        fontWeight: 700,
        color: gaugeColor,
        fontVariantNumeric: 'tabular-nums',
        marginTop: '-8px',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: font.family,
        fontSize: '10px',
        fontWeight: 600,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </div>
    </div>
  );
});

FearGreedGauge.displayName = 'FearGreedGauge';
export default FearGreedGauge;
