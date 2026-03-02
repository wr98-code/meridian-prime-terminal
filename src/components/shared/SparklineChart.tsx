import { memo, useMemo } from 'react';
import { colors } from '@/styles/tokens';

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  positive?: boolean;
}

const SparklineChart = memo(function SparklineChart({
  data,
  width = 80,
  height = 28,
  positive = true,
}: SparklineChartProps) {
  const { path, fill } = useMemo(() => {
    if (data.length < 2) return { path: '', fill: '' };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1);
    const points = data.map((v, i) => ({
      x: i * step,
      y: height - ((v - min) / range) * (height - 4) - 2,
    }));
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const fillD = `${d} L${width},${height} L0,${height} Z`;
    return { path: d, fill: fillD };
  }, [data, width, height]);

  const strokeColor = positive ? colors.bull : colors.bear;
  const fillColor = positive ? 'rgba(0,155,95,0.12)' : 'rgba(210,38,75,0.12)';

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={fill} fill={fillColor} />
      <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
});

SparklineChart.displayName = 'SparklineChart';
export default SparklineChart;
