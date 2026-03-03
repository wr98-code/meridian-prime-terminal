import { memo, type CSSProperties } from 'react';
import { radii } from '@/styles/tokens';

interface SkeletonShimmerProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: CSSProperties;
}

const shimmerKeyframes = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

let styleInjected = false;
function injectShimmerStyle() {
  if (styleInjected) return;
  const el = document.createElement('style');
  el.textContent = shimmerKeyframes;
  document.head.appendChild(el);
  styleInjected = true;
}

const SkeletonShimmer = memo(function SkeletonShimmer({
  width = '100%',
  height = '16px',
  borderRadius = radii.badge,
  style,
}: SkeletonShimmerProps) {
  injectShimmerStyle();

  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(15,40,100,0.04) 25%, rgba(15,40,100,0.08) 50%, rgba(15,40,100,0.04) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      ...style,
    }} />
  );
});

SkeletonShimmer.displayName = 'SkeletonShimmer';
export default SkeletonShimmer;
