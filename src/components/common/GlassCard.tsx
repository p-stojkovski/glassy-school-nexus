import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  animate?: boolean; // New prop to control animations
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  animate = true, // Default to true for backward compatibility
}) => {
  // Use a regular div when animations are disabled
  if (!animate) {
    return (
      <div
        className={cn(
          // Base glass card styles - softened for calmer appearance
          'backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-xl shadow-lg',
          // Hover styles - subtle elevation
          hover &&
            'hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-xl transition-all duration-200 cursor-pointer',
          // Clickable styles
          onClick && 'cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        // Base glass card styles - softened for calmer appearance
        'backdrop-blur-sm bg-white/[0.03] border border-white/[0.06] rounded-xl shadow-lg',
        // Hover styles - subtle elevation
        hover &&
          'hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-xl transition-all duration-200 cursor-pointer',
        // Clickable styles
        onClick && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      whileHover={hover ? { scale: 1.01, y: -1 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

