
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import styles from './GlassCard.module.scss';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  hover = false,
  onClick 
}) => {
  return (
    <motion.div
      className={cn(
        styles.glassCard,
        hover && styles.hoverable,
        onClick && styles.clickable,
        className
      )}
      whileHover={hover ? { scale: 1.02, y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
