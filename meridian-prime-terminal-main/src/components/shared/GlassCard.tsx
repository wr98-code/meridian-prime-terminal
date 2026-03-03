import { memo, useState, type ReactNode, type CSSProperties } from 'react';
import { colors, shadows, radii } from '@/styles/tokens';

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  hoverable?: boolean;
  onClick?: () => void;
}

const GlassCard = memo(function GlassCard({ children, style, hoverable = true, onClick }: GlassCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.borderMuted}`,
        borderRadius: radii.card,
        boxShadow: hovered ? shadows.raised : shadows.card,
        padding: '16px 20px',
        transition: 'box-shadow 200ms, transform 200ms',
        transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';
export default GlassCard;
