import { memo } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { colors, font } from '@/styles/tokens';
import type { LucideIcon } from 'lucide-react';

interface StubPageProps {
  title: string;
  icon: LucideIcon;
  description?: string;
}

function StubPage({ title, icon: Icon, description }: StubPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}
    >
      <GlassCard style={{ textAlign: 'center', padding: '40px 60px' }}>
        <Icon size={28} style={{ color: colors.textFaint, marginBottom: '12px' }} />
        <div style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, fontFamily: font.family, marginBottom: '6px' }}>{title}</div>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: font.family }}>
          {description ?? 'Coming soon — this module is under development.'}
        </div>
      </GlassCard>
    </motion.div>
  );
}

export default memo(StubPage);
